import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Phone, Calendar, ChevronRight, MessageSquare } from 'lucide-react';
import { Token } from '../../types/token';
import { FOLLOW_UP_QUESTION, FollowUpService } from '../../services/followUpService';
import { useAppState } from '../../contexts/AppStateContext';
import { useNavigate } from 'react-router';

interface Props {
  token: Token;
}

export const FollowUpPrompt: React.FC<Props> = ({ token }) => {
  const { addFollowUpResponse } = useAppState();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  if (dismissed || token.followUpStatus === 'Submitted' || token.followUpStatus === 'Escalated') return null;
  if (!FollowUpService.shouldPrompt(token)) return null;

  const q = FOLLOW_UP_QUESTION;

  const handleSelect = (value: 'better' | 'same' | 'worse' | 'emergency') => {
    setSelected(value);
    const response = FollowUpService.buildResponse(token, value);
    addFollowUpResponse(response);
    setSubmitted(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      className="mx-1 bg-white rounded-3xl border-2 border-indigo-100 shadow-xl shadow-indigo-500/10 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-indigo-600 to-purple-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-black text-sm">Post-Visit Check-In</p>
            <p className="text-indigo-200 text-[10px] font-medium">{token.department} • {token.hospitalName}</p>
          </div>
        </div>
        {!submitted && (
          <button
            onClick={() => setDismissed(true)}
            className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="p-5">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div key="question" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="font-black text-gray-900 text-base mb-0.5">{q.text}</p>
              <p className="text-xs text-gray-500 font-medium mb-5">{q.subtext}</p>

              <div className="grid grid-cols-2 gap-3">
                {q.options.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all active:scale-95 ${option.bgColor}`}
                  >
                    <span className="text-3xl">{option.emoji}</span>
                    <span className={`text-xs font-black ${option.color}`}>{option.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-2"
            >
              {selected === 'worse' || selected === 'emergency' ? (
                <>
                  <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <p className="font-black text-gray-900 text-base mb-1">Your care team has been notified</p>
                  <p className="text-xs text-gray-500 font-medium mb-5 leading-relaxed">
                    We've flagged your response to the clinic. Please take action if symptoms worsen.
                  </p>
                  <div className="space-y-2">
                    <a
                      href="tel:+912227688000"
                      className="w-full py-3 bg-red-600 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
                    >
                      <Phone className="w-4 h-4" /> Call Clinic Now
                    </a>
                    <button
                      onClick={() => navigate('/appointments')}
                      className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-blue-100"
                    >
                      <Calendar className="w-4 h-4" /> Book Follow-Up Appointment
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">{selected === 'better' ? '😊' : '😐'}</span>
                  </div>
                  <p className="font-black text-gray-900 text-base mb-1">
                    {selected === 'better' ? 'Great to hear!' : 'Thanks for letting us know.'}
                  </p>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    {selected === 'better'
                      ? 'Keep following your prescription. Visit again if symptoms return.'
                      : 'Monitor your symptoms closely. Book a follow-up if needed.'}
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
