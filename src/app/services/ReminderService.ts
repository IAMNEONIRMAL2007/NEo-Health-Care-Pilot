import { Token } from '../types/token';
import { toast } from 'sonner';

export const ReminderService = {
  /**
   * Mocks sending a booking confirmation via multi-channel
   */
  sendBookingConfirmation: (token: Token) => {
    console.group(`🔔 Reminder Service: Booking Confirmation [Token ${token.tokenNo}]`);
    console.log(`📱 SMS: Sent to ${token.phone}`);
    console.log(`📧 Email: Sent to patient`);
    console.log(`💬 WhatsApp: Sent to ${token.phone}`);
    console.groupEnd();

    // Trigger a visual feedback for the demo
    setTimeout(() => {
      toast.info(`WhatsApp sent to ${token.phone}: Your token ${token.tokenNo} is confirmed for ${token.appointmentTime}.`, {
        icon: '💬',
      });
    }, 2000);
  },

  /**
   * Mocks sending a "Leave Now" notification
   */
  sendLeaveNowReminder: (token: Token) => {
    console.group(`🔔 Reminder Service: LEAVE NOW [Token ${token.tokenNo}]`);
    console.log(`📱 SMS: Urgent leave-now sent to ${token.phone}`);
    console.log(`💬 WhatsApp: "Your turn is coming up, please leave now"`);
    console.groupEnd();

    toast.success(`Priority WhatsApp sent to ${token.phone}: Your turn is near! Please head to the clinic.`, {
      icon: '🚀',
      duration: 5000
    });
  },

  /**
   * Mocks a generic reminder (e.g. 1 hour before)
   */
  sendGenericReminder: (token: Token, message: string) => {
    console.log(`🔔 Reminder Service: ${message} [Token ${token.tokenNo}]`);
  }
};
