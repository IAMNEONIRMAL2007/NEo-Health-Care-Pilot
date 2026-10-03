export interface NoShowInput {
  leadTimeDays: number;       // days between booking and appointment
  pastNoShows: number;        // count from history
  pastAttendance: number;     // count of completed visits
  hourOfDay: number;          // 0–23
  dayOfWeek: number;          // 0=Sun … 6=Sat
  paymentMethod: 'Online' | 'Cash' | 'Card';
  isFirstVisit: boolean;
}

export interface NoShowPrediction {
  risk: 'High' | 'Medium' | 'Low';
  score: number;               // 0–100
  reasons: string[];
  suggestedActions: string[];
}

export class NoShowPredictor {
  static predict(input: NoShowInput): NoShowPrediction {
    let score = 0;
    const reasons: string[] = [];
    const suggestedActions: string[] = [];

    // --- Scoring factors ---

    // Lead time (longer = higher risk)
    if (input.leadTimeDays > 5) {
      score += 28;
      reasons.push('Booking made far in advance (>5 days)');
    } else if (input.leadTimeDays > 2) {
      score += 15;
      reasons.push('Moderate lead time');
    } else if (input.leadTimeDays < 1) {
      score -= 10;
      reasons.push('Same-day booking — high commitment');
    }

    // Past behaviour
    if (input.pastNoShows >= 2) {
      score += 35;
      reasons.push(`${input.pastNoShows} previous no-shows on record`);
    } else if (input.pastNoShows === 1) {
      score += 20;
      reasons.push('1 previous no-show on record');
    }

    if (input.pastAttendance > 3) {
      score -= 15;
      reasons.push('Strong attendance history');
    }

    // Payment method
    if (input.paymentMethod === 'Online') {
      score -= 20;
      reasons.push('Online payment — financial commitment made');
    } else if (input.paymentMethod === 'Cash') {
      score += 15;
      reasons.push('Cash/Pay-at-clinic — lower commitment');
    }

    // First visit
    if (input.isFirstVisit) {
      score += 10;
      reasons.push('First-time patient — unfamiliar with process');
    }

    // Time-of-day pattern
    if (input.hourOfDay >= 7 && input.hourOfDay <= 10) {
      score -= 8;
    } else if (input.hourOfDay >= 17 && input.hourOfDay <= 20) {
      score += 10;
      reasons.push('Evening slot — high cancellation time');
    }

    // Day-of-week pattern
    if (input.dayOfWeek === 1) {
      // Monday
      score += 8;
      reasons.push('Monday booking — higher skip rate');
    } else if (input.dayOfWeek === 5 || input.dayOfWeek === 6) {
      // Fri/Sat
      score += 5;
    }

    // Clamp score
    score = Math.max(0, Math.min(100, score));

    // Determine risk band
    let risk: 'High' | 'Medium' | 'Low';
    if (score >= 55) {
      risk = 'High';
      suggestedActions.push('Send SMS reminder 2 hours before appointment');
      suggestedActions.push('Auto-call if no check-in 30 min before slot');
      suggestedActions.push('Flag slot for re-opening if no arrival');
    } else if (score >= 30) {
      risk = 'Medium';
      suggestedActions.push('Send WhatsApp reminder 24h before');
      suggestedActions.push('Push notification 1 hour before');
    } else {
      risk = 'Low';
      suggestedActions.push('Standard booking confirmation sent');
    }

    return { risk, score, reasons, suggestedActions };
  }
}
