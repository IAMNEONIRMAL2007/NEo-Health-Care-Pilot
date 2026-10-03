import { UrgencyLevel } from '../types/token';

export interface TriageStep {
  id: string;
  question: string;
  hint?: string;
  options: {
    label: string;
    value: string;
    urgency?: UrgencyLevel;
    department?: string;
    isRedFlag?: boolean;
    emoji?: string;
  }[];
}

export interface TriageResult {
  department: string;
  urgency: UrgencyLevel;
  summary: string;
  confidence: number;           // 0-100
  isRedFlag: boolean;           // triggers ambulance CTA
  recommendedAction: 'GP' | 'Specialist' | 'ER' | 'Ambulance';
  recommendedHospitalId?: string;
}

export const TRIAGE_STEPS: TriageStep[] = [
  {
    id: 'redFlag',
    question: 'Are any of these happening right now?',
    hint: 'Select the most urgent symptom first',
    options: [
      { label: '🫀 Chest pain or pressure', value: 'chest', urgency: 'Emergency', department: 'Cardiology', isRedFlag: true, emoji: '🫀' },
      { label: '🧠 Sudden confusion or face drooping', value: 'stroke', urgency: 'Emergency', department: 'Neurology', isRedFlag: true, emoji: '🧠' },
      { label: '😮‍💨 Difficulty breathing', value: 'breath', urgency: 'Emergency', department: 'Pulmonology', isRedFlag: true, emoji: '😮‍💨' },
      { label: '🩸 Severe or uncontrolled bleeding', value: 'bleed', urgency: 'Emergency', department: 'Surgery', isRedFlag: true, emoji: '🩸' },
      { label: '✅ None of the above', value: 'none', urgency: 'Routine', emoji: '✅' },
    ],
  },
  {
    id: 'category',
    question: 'What is your primary concern?',
    hint: 'Pick the one that best matches your main symptom',
    options: [
      { label: '🤒 Fever / Cold / General', value: 'general', urgency: 'Routine', department: 'General Physician', emoji: '🤒' },
      { label: '🦴 Bones / Joints / Injury', value: 'ortho', urgency: 'Routine', department: 'Orthopedics', emoji: '🦴' },
      { label: '👶 Child Health', value: 'peds', urgency: 'Routine', department: 'Pediatrics', emoji: '👶' },
      { label: '👩 Women\'s Health', value: 'gyn', urgency: 'Routine', department: 'Gynecology', emoji: '👩' },
      { label: '👁️ Eye / Ear / Nose / Throat', value: 'ent', urgency: 'Routine', department: 'ENT', emoji: '👁️' },
      { label: '🧴 Skin / Allergy', value: 'derm', urgency: 'Routine', department: 'Dermatology', emoji: '🧴' },
    ],
  },
  {
    id: 'severity',
    question: 'How severe are the symptoms?',
    hint: 'Be honest — this helps prioritise your care',
    options: [
      { label: '🔴 Extreme / Unbearable — affecting daily life', value: 'high', urgency: 'Emergency', emoji: '🔴' },
      { label: '🟡 Moderate / Persistent — manageable but worsening', value: 'med', urgency: 'Urgent', emoji: '🟡' },
      { label: '🟢 Mild / Just started — minor discomfort', value: 'low', urgency: 'Routine', emoji: '🟢' },
    ],
  },
  {
    id: 'duration',
    question: 'How long has this been happening?',
    options: [
      { label: '⚡ Just now (less than 1 hour)', value: 'now', urgency: 'Urgent', emoji: '⚡' },
      { label: '🕐 A few hours (2–12 hours)', value: 'hours', urgency: 'Urgent', emoji: '🕐' },
      { label: '📅 A few days', value: 'days', urgency: 'Routine', emoji: '📅' },
      { label: '📆 Over a week or chronic', value: 'week', urgency: 'Routine', emoji: '📆' },
    ],
  },
  {
    id: 'ageGroup',
    question: 'Who is the patient?',
    hint: 'Age affects urgency assessment',
    options: [
      { label: '👶 Child (under 12)', value: 'child', emoji: '👶' },
      { label: '🧑 Adult (12–60)', value: 'adult', emoji: '🧑' },
      { label: '👴 Senior (60+)', value: 'senior', urgency: 'Urgent', emoji: '👴' },
    ],
  },
];

export class TriageEngine {
  static process(answers: Record<string, string>): TriageResult {
    let urgency: UrgencyLevel = 'Routine';
    let department = 'General Physician';
    let isRedFlag = false;
    let confidence = 60;

    // Step 1: Red Flag Check
    const redFlagAnswer = answers['redFlag'];
    if (redFlagAnswer && redFlagAnswer !== 'none') {
      const rfOption = TRIAGE_STEPS[0].options.find(o => o.value === redFlagAnswer);
      if (rfOption) {
        isRedFlag = true;
        urgency = 'Emergency';
        department = rfOption.department || 'Emergency';
        confidence = 95;
      }
    }

    // Step 2: Category mapping
    if (!isRedFlag) {
      const categoryOption = TRIAGE_STEPS[1].options.find(o => o.value === answers['category']);
      if (categoryOption) {
        department = categoryOption.department || 'General Physician';
        confidence += 10;
      }
    }

    // Step 3: Severity boost
    const severity = answers['severity'];
    if (severity === 'high' && !isRedFlag) { urgency = 'Emergency'; confidence = Math.min(confidence + 15, 95); }
    else if (severity === 'med' && urgency !== 'Emergency') { urgency = 'Urgent'; confidence = Math.min(confidence + 10, 90); }

    // Step 4: Duration boost
    const duration = answers['duration'];
    if (duration === 'now' && severity !== 'low' && urgency !== 'Emergency') {
      urgency = 'Urgent';
      confidence = Math.min(confidence + 5, 90);
    }
    if (duration === 'days' || duration === 'week') {
      confidence = Math.min(confidence + 10, 85);
    }

    // Step 5: Age modifier
    const ageGroup = answers['ageGroup'];
    if (ageGroup === 'senior' && urgency === 'Routine') {
      urgency = 'Urgent';
      confidence = Math.min(confidence + 5, 90);
    }
    if (ageGroup === 'child') {
      if (department === 'General Physician') department = 'Pediatrics';
      confidence = Math.min(confidence + 5, 90);
    }

    // Determine recommended action
    let recommendedAction: TriageResult['recommendedAction'] = 'GP';
    if (isRedFlag) {
      recommendedAction = 'Ambulance';
    } else if (urgency === 'Emergency') {
      recommendedAction = 'ER';
    } else if (urgency === 'Urgent' || department !== 'General Physician') {
      recommendedAction = 'Specialist';
    }

    // Build summary
    let summary = '';
    if (isRedFlag) {
      summary = `🚨 Red flag symptom detected. Immediate emergency care needed for ${department}. Please call 108 or go to the nearest ER.`;
    } else if (urgency === 'Emergency') {
      summary = `Urgent attention needed. High severity reported for ${department}. Consult immediately.`;
    } else if (urgency === 'Urgent') {
      summary = `Priority consultation for ${department} recommended. Symptoms are persistent — don't delay.`;
    } else {
      summary = `Routine follow-up for ${department}. Book a convenient slot at your nearest clinic.`;
    }

    return { department, urgency, summary, confidence, isRedFlag, recommendedAction };
  }
}
