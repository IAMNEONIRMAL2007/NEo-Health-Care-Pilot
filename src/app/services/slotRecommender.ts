import { Slot } from '../constants/mockData';

// Historical average load per time slot (0–100, higher = more busy)
export const SLOT_LOAD_HISTORY: Record<string, number> = {
  '09:00 AM': 35,
  '09:30 AM': 45,
  '10:00 AM': 88,
  '10:30 AM': 92,
  '11:00 AM': 85,
  '11:30 AM': 70,
  '02:00 PM': 40,
  '02:30 PM': 50,
  '03:00 PM': 62,
  '04:00 PM': 55,
  '04:30 PM': 48,
  '06:00 PM': 72,
  '06:30 PM': 80,
};

export interface SlotScore {
  time: string;
  period: 'morning' | 'afternoon' | 'evening';
  loadScore: number;      // 0–100 (lower = less busy)
  isRecommended: boolean;
  reasonLabel: string;
  savings: string;        // e.g. "~40% less busy"
}

export class SlotRecommender {
  static score(slots: Slot[]): SlotScore[] {
    const available = slots.filter(s => s.available);
    if (available.length === 0) return [];

    const loads = available.map(s => SLOT_LOAD_HISTORY[s.time] ?? 60);
    const avgLoad = loads.reduce((a, b) => a + b, 0) / loads.length;

    return slots.map(slot => {
      const load = SLOT_LOAD_HISTORY[slot.time] ?? 60;
      const saving = Math.round(((avgLoad - load) / avgLoad) * 100);
      const isRecommended = slot.available && load < 50 && saving > 10;

      let reasonLabel = '';
      if (!slot.available) {
        reasonLabel = 'Fully booked';
      } else if (load < 40) {
        reasonLabel = 'Very quiet';
      } else if (load < 55) {
        reasonLabel = 'Less busy';
      } else if (load >= 80) {
        reasonLabel = 'Peak hours';
      } else {
        reasonLabel = 'Moderate';
      }

      return {
        time: slot.time,
        period: slot.period,
        loadScore: load,
        isRecommended,
        reasonLabel,
        savings: saving > 0 ? `~${saving}% less busy` : 'Avg. load',
      };
    });
  }

  static getBestSlotHint(slots: Slot[]): string | null {
    const scores = this.score(slots);
    const best = scores
      .filter(s => s.isRecommended)
      .sort((a, b) => a.loadScore - b.loadScore)[0];

    if (!best) return null;
    return `⭐ ${best.time} is ${best.savings} than peak hours`;
  }
}
