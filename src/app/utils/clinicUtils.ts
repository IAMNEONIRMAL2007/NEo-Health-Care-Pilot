// Clinic time-since utility — used in queue cards + next patient banner

const WAIT_THRESHOLD_WARNING_MINS = 30;
const WAIT_THRESHOLD_CRITICAL_MINS = 60;

export type TimeSinceResult = {
  text: string;
  minutes: number;
  severity: 'normal' | 'warning' | 'critical';
};

/**
 * Returns a human-readable "time since" string with severity classification.
 * @param timestamp ISO timestamp string
 */
export function getTimeSince(timestamp: string): TimeSinceResult {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.max(0, Math.floor(diff / 60000));

  let text: string;
  if (minutes < 1) {
    text = 'Just now';
  } else if (minutes < 60) {
    text = `${minutes}m ago`;
  } else if (minutes < 180) {
    const hours = Math.floor(minutes / 60);
    text = `${hours}h ago`;
  } else {
    const hours = Math.floor(minutes / 60);
    text = `${hours}h ago`;
  }

  let severity: TimeSinceResult['severity'] = 'normal';
  if (minutes >= WAIT_THRESHOLD_CRITICAL_MINS) {
    severity = 'critical';
  } else if (minutes >= WAIT_THRESHOLD_WARNING_MINS) {
    severity = 'warning';
  }

  return { text, minutes, severity };
}

/**
 * Get a greeting string based on time of day.
 */
export function getGreeting(date: Date): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
}

/**
 * Format a Date to HH:MM in en-IN locale (no seconds — cleaner for clinical UI).
 */
export function formatClock(date: Date): string {
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
