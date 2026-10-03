import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, ChevronRight, X, AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';
import { EMERGENCY_TRIAGE_STEPS, EmergencyTriageEngine, EmergencyTriageResult, EmergencyAction } from '../../services/emergencyTriageEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirmEmergency: () => void;  // proceeds to normal SOS flow
}

const actionColors: Record<EmergencyAction, { bg: string; text: string; border: string; icon: string }> = {
  Ambulance: { bg: 'bg-red-600', text: 'text-white', border: 'border-red-700', icon: '🚑' },
  ER: { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-600', icon: '🏥' },
  GP: { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-700', icon: '🩺' },
  HomeObservation: { bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-700', icon: '🏠' },
};

export const EmergencyTriageOverlay: React.FC<Props> = ({ isOpen, onClose, onConfirmEmergency }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<EmergencyTriageResult | null>(null);

  const step = EMERGENCY_TRIAGE_STEPS[currentStep];

  const handleOption = (value: string) => {
    const newAnswers = { ...answers, [step.id]: value };
    setAnswers(newAnswers);

    // If force ambulance at step 0, skip to result
    const option = step.options.find(o => o.value === value);
    if (option?.isForceAmbulance) {
      const res = EmergencyTriageEngine.process({ ...newAnswers });
      setResult(res);
      return;
    }

    if (currentStep < EMERGENCY_TRIAGE_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setResult(EmergencyTriageEngine.process(newAnswers));
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setAnswers({});
    setResult(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gray-950/90 backdrop-blur-sm flex flex-col"
      >
        <div className="flex-1 flex flex-col max-h-full overflow-y-auto">
          {/* Header */}
          <div className="bg-gray-900 px-5 pt-6 pb-4 flex items-center justify-between border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/30">
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="font-black text-white text-sm">Emergency Symptom Check</p>
                <p className="text-[10px] text-gray-400 font-medium">AI-guided • Takes 20 seconds</p>
              </div>
            </div>
            <button
              onClick={() => { reset(); onClose(); }}
              className="w-8 h-8 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-5">
            {!result ? (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Progress dots */}
                <div className="flex gap-2">
                  {EMERGENCY_TRIAGE_STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        i <= currentStep ? 'bg-red-500' : 'bg-gray-700'
                      }`}
                    />
                  ))}
                </div>

                <div>
                  <h2 className="text-xl font-black text-white leading-tight mb-2">
                    {step.question}
                  </h2>
                  {step.subtext && (
                    <p className="text-xs text-gray-400 font-medium leading-relaxed">{step.subtext}</p>
                  )}
                </div>

                <div className="space-y-3">
                  {step.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleOption(option.value)}
                      className={`w-full p-4 rounded-2xl text-left transition-all flex items-center gap-4 active:scale-[0.98] border-2 ${
                        option.isForceAmbulance
                          ? 'bg-red-950/40 border-red-900/60 hover:border-red-500 hover:bg-red-950/70'
                          : option.value === 'none' || option.value === 'conscious'
                          ? 'bg-emerald-950/30 border-emerald-900/40 hover:border-emerald-500 hover:bg-emerald-950/60'
                          : 'bg-gray-900 border-gray-700 hover:border-orange-500 hover:bg-orange-950/30'
                      }`}
                    >
                      <span className="text-2xl shrink-0">{option.emoji}</span>
                      <span className={`font-bold text-sm ${
                        option.isForceAmbulance ? 'text-red-300' :
                        option.value === 'none' || option.value === 'conscious' ? 'text-emerald-300' : 'text-white'
                      }`}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>

                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep(p => p - 1)}
                    className="text-xs font-bold text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    ← Go Back
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-5"
              >
                {/* Result card */}
                <div className={`rounded-3xl p-5 ${
                  result.forceAmbulance ? 'bg-red-950/60 border-2 border-red-700/60' : 'bg-gray-900 border border-gray-700'
                }`}>
                  <p className="text-3xl mb-3">{actionColors[result.action].icon}</p>
                  <p className="font-black text-white text-lg mb-2">{result.urgencyMessage}</p>
                  <p className="text-sm text-gray-400 font-medium leading-relaxed">{result.reason}</p>
                </div>

                {/* CTA buttons */}
                <div className="space-y-3">
                  {result.forceAmbulance ? (
                    <a
                      href={`tel:${result.callNumber}`}
                      className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-red-900/40 animate-pulse-slow"
                    >
                      <Phone className="w-6 h-6" />
                      Call 108 — Ambulance Now
                    </a>
                  ) : null}

                  {result.action === 'ER' && (
                    <button
                      onClick={() => { reset(); onConfirmEmergency(); }}
                      className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black text-base uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                    >
                      <ArrowRight className="w-5 h-5" />
                      Proceed to Emergency SOS
                    </button>
                  )}

                  {(result.action === 'GP') && (
                    <div className="bg-gray-900 rounded-2xl p-4 border border-gray-700">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-300 font-medium leading-relaxed">
                          This does not appear to be a life-threatening emergency. Consider booking a GP appointment for a proper evaluation.
                        </p>
                      </div>
                    </div>
                  )}

                  {!result.forceAmbulance && (
                    <button
                      onClick={() => { reset(); onConfirmEmergency(); }}
                      className="w-full py-3 border border-gray-700 text-gray-400 rounded-2xl font-bold text-sm hover:border-red-700 hover:text-red-400 transition-colors"
                    >
                      Proceed anyway — I still want to alert
                    </button>
                  )}

                  <button
                    onClick={reset}
                    className="w-full py-3 text-gray-500 font-bold text-sm hover:text-gray-300 transition-colors"
                  >
                    ← Redo Assessment
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
