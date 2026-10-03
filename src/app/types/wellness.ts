export type WellnessMetricType = 'Steps' | 'Water' | 'Sleep' | 'Mood' | 'BPM' | 'Weight';

export interface WellnessLog {
  id: string;
  patientId: string;
  type: WellnessMetricType;
  value: number;
  unit: string;
  timestamp: string;
  note?: string;
}

export interface WellnessSummary {
  dailySteps: number;
  dailyWater: number; // in ML
  avgSleep: number; // in Hours
  lastMood: 'Happy' | 'Neutral' | 'Sad' | 'Tired';
}
