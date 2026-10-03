import { Token } from '../types/token';
import { toast } from 'sonner';

export interface FollowUpQuestion {
  id: string;
  text: string;
  subtext: string;
  options: {
    label: string;
    value: 'better' | 'same' | 'worse' | 'emergency';
    emoji: string;
    color: string;
    bgColor: string;
  }[];
}

export interface FollowUpResponse {
  id: string;
  tokenId: string;
  patientName: string;
  department: string;
  answer: 'better' | 'same' | 'worse' | 'emergency';
  submittedAt: string;
  escalated: boolean;
}

export const FOLLOW_UP_QUESTION: FollowUpQuestion = {
  id: 'fq1',
  text: 'How are you feeling since your visit?',
  subtext: 'Your feedback helps your care team monitor your recovery.',
  options: [
    {
      label: 'Much better',
      value: 'better',
      emoji: '😊',
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50 border-emerald-200',
    },
    {
      label: 'About the same',
      value: 'same',
      emoji: '😐',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-50 border-yellow-200',
    },
    {
      label: 'Getting worse',
      value: 'worse',
      emoji: '😔',
      color: 'text-orange-700',
      bgColor: 'bg-orange-50 border-orange-200',
    },
    {
      label: 'Need emergency help',
      value: 'emergency',
      emoji: '🚨',
      color: 'text-red-700',
      bgColor: 'bg-red-50 border-red-300',
    },
  ],
};

const FOLLOW_UP_DELAY_HOURS = 24;

export const FollowUpService = {
  /**
   * Returns true if a follow-up prompt should be shown for this token.
   * Conditions: status is Completed AND 24h have passed since booking.
   */
  shouldPrompt(token: Token): boolean {
    if (token.status !== 'Completed') return false;
    if (token.followUpStatus === 'Submitted' || token.followUpStatus === 'Escalated') return false;

    const completedTime = new Date(token.bookedAt).getTime();
    const now = Date.now();
    const hoursPassed = (now - completedTime) / (1000 * 60 * 60);

    // In demo mode, always show for completed tokens (skip 24h wait)
    // Change this line to `return hoursPassed >= FOLLOW_UP_DELAY_HOURS;` in production
    return true;
  },

  /**
   * Processes the submitted follow-up and determines if escalation is needed.
   */
  buildResponse(
    token: Token,
    answer: FollowUpResponse['answer']
  ): FollowUpResponse {
    const escalated = answer === 'worse' || answer === 'emergency';

    if (escalated) {
      toast.error(
        answer === 'emergency'
          ? '🚨 Emergency follow-up triggered — notifying your clinic now.'
          : '⚠️ Your care team has been notified that your condition has worsened.',
        { duration: 6000 }
      );
    } else if (answer === 'better') {
      toast.success('Great to hear you\'re feeling better! 💚', { duration: 3000 });
    } else {
      toast.info('Thanks for your update. Keep monitoring and reach out if needed.', {
        duration: 3000,
      });
    }

    return {
      id: `fu_${Date.now()}`,
      tokenId: token.id,
      patientName: token.patientName,
      department: token.department || 'General',
      answer,
      submittedAt: new Date().toISOString(),
      escalated,
    };
  },
};
