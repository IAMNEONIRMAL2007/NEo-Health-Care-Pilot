export type EmergencyAction = 'Ambulance' | 'ER' | 'GP' | 'HomeObservation';

export interface EmergencyTriageStep {
  id: string;
  question: string;
  subtext?: string;
  options: {
    label: string;
    value: string;
    action: EmergencyAction;
    emoji: string;
    isForceAmbulance?: boolean;
  }[];
}

export interface EmergencyTriageResult {
  action: EmergencyAction;
  reason: string;
  urgencyMessage: string;
  forceAmbulance: boolean;  // hides self-drive option
  callNumber: string;        // '108' or local ER
}

export const EMERGENCY_TRIAGE_STEPS: EmergencyTriageStep[] = [
  {
    id: 'redFlag',
    question: 'Is the person experiencing any of these?',
    subtext: 'Tap the most urgent symptom. Be honest — this helps save lives.',
    options: [
      {
        label: 'Chest pain / tightness / pressure',
        value: 'chest',
        action: 'Ambulance',
        emoji: '🫀',
        isForceAmbulance: true,
      },
      {
        label: 'Sudden face drooping, arm weakness, or slurred speech',
        value: 'stroke',
        action: 'Ambulance',
        emoji: '🧠',
        isForceAmbulance: true,
      },
      {
        label: 'Cannot breathe or severe shortness of breath',
        value: 'breath',
        action: 'Ambulance',
        emoji: '😮‍💨',
        isForceAmbulance: true,
      },
      {
        label: 'Severe or uncontrolled bleeding',
        value: 'bleed',
        action: 'ER',
        emoji: '🩸',
        isForceAmbulance: false,
      },
      {
        label: 'High fever with stiff neck or rash',
        value: 'fever',
        action: 'ER',
        emoji: '🌡️',
        isForceAmbulance: false,
      },
      {
        label: 'None of these',
        value: 'none',
        action: 'GP',
        emoji: '✅',
        isForceAmbulance: false,
      },
    ],
  },
  {
    id: 'consciousness',
    question: 'Is the person conscious and able to speak?',
    subtext: 'This helps us decide whether you need an ambulance immediately.',
    options: [
      {
        label: 'No — unconscious or not responding',
        value: 'unconscious',
        action: 'Ambulance',
        emoji: '❌',
        isForceAmbulance: true,
      },
      {
        label: 'Barely — confused or semi-conscious',
        value: 'confused',
        action: 'Ambulance',
        emoji: '⚠️',
        isForceAmbulance: true,
      },
      {
        label: 'Yes — conscious but in pain',
        value: 'conscious',
        action: 'ER',
        emoji: '✅',
        isForceAmbulance: false,
      },
    ],
  },
];

export class EmergencyTriageEngine {
  static process(answers: Record<string, string>): EmergencyTriageResult {
    let action: EmergencyAction = 'GP';
    let forceAmbulance = false;

    // Step 1: Red flag check
    const rfStep = EMERGENCY_TRIAGE_STEPS[0];
    const rfOption = rfStep.options.find(o => o.value === answers['redFlag']);

    if (rfOption) {
      action = rfOption.action;
      if (rfOption.isForceAmbulance) forceAmbulance = true;
    }

    // Step 2: Consciousness check
    const consStep = EMERGENCY_TRIAGE_STEPS[1];
    const consOption = consStep.options.find(o => o.value === answers['consciousness']);
    if (consOption?.isForceAmbulance) {
      forceAmbulance = true;
      action = 'Ambulance';
    }

    // Build response
    const reasonMap: Record<string, string> = {
      chest: 'Chest pain is a critical cardiac symptom requiring immediate medical attention.',
      stroke: 'Stroke symptoms are a medical emergency. Every second counts.',
      breath: 'Severe breathing difficulty can indicate a life-threatening condition.',
      bleed: 'Severe bleeding requires ER attention immediately.',
      fever: 'High fever with neurological symptoms needs urgent evaluation.',
      none: 'No critical symptoms detected. This may be manageable at a GP or clinic.',
    };

    const urgencyMap: Record<EmergencyAction, string> = {
      Ambulance: '🚨 Call 108 NOW — an ambulance is the safest option.',
      ER: '⚡ Head to the nearest Emergency Room immediately.',
      GP: '📅 This may not be an emergency. Book a GP appointment.',
      HomeObservation: '🏠 Monitor at home and call if symptoms worsen.',
    };

    return {
      action,
      forceAmbulance,
      reason: reasonMap[answers['redFlag']] || 'Based on your answers.',
      urgencyMessage: urgencyMap[action],
      callNumber: '108',
    };
  }
}
