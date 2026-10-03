export type TokenStatus = "Booked" | "Arrived" | "InConsultation" | "Completed" | "NoShow";
export type PaymentStatus = "Pending" | "Success" | "PayAtClinic";
export type PaymentMethod = "Online" | "Cash" | "Card";
export type NoShowRisk = "High" | "Medium" | "Low";
export type UrgencyLevel = "Routine" | "Urgent" | "Emergency";
export type FollowUpStatus = "Pending" | "Submitted" | "Escalated";

export interface Referral {
  id: string;
  fromDoctorId: string;
  fromDoctorName: string;
  toDepartment: string;
  reason: string;
  date: string;
  status: 'Pending' | 'Booked' | 'Completed';
}

export interface Token {
  id: string;
  tokenNo: string;
  patientName: string;
  phone: string;
  age: number;
  doctorId: string;
  clinicId: string;
  hospitalName?: string;
  doctorName?: string;
  department?: string;
  appointmentTime: string;
  bookedAt: string;
  status: TokenStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  type: 'slot' | 'walkin';
  remindersSent: {
    sms: boolean;
    email: boolean;
    whatsapp: boolean;
  };
  noShowRisk: NoShowRisk;
  waitTimeMinutes: number;
  position?: number;
  totalInQueue?: number;
  feedbackGiven?: boolean;
  symptoms?: string;
  relationship?: 'Self' | 'Family Member';
  patientId?: string;
  urgency?: UrgencyLevel;
  triageSummary?: string;
  referralId?: string;
  referralData?: Referral;
  followUpStatus?: FollowUpStatus;  // AI follow-up check-in state
  noShowScore?: number;              // 0–100 score from NoShowPredictor
  aiPriorityBoost?: boolean;         // manual override by reception
  transactionId?: string;            // Razorpay payment ID or UPI UTR reference
  paymentGateway?: string;           // 'Razorpay' or 'Direct UPI' or undefined
}
