import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Stethoscope, ChevronRight, ChevronLeft,
  ShieldCheck, Zap, AlertTriangle, CheckCircle2,
  Activity
} from 'lucide-react';
import { TRIAGE_STEPS, TriageEngine, TriageResult } from '../../services/triageEngine';

interface TriageWizardProps {
  onComplete: (result: TriageResult) => void;
  onCancel: () => void;
}

const urgencyColors = {
  Emergency: 'from-red-600 to-red-700',
  Urgent: 'from-orange-500 to-amber-600',
  Routine: 'from-emerald-500 to-teal-600',
};

const actionConfig = {
  Ambulance: { label: '🚨 Call Ambulance (108)', color: 'bg-red-600 text-white shadow-red-600/25' },
  ER: { label: '⚡ Go to Emergency Room', color: 'bg-orange-600 text-white shadow-orange-600/25' },
  Specialist: { label: '🩺 Book Specialist', color: 'bg-blue-600 text-white shadow-blue-600/25' },
  GP: { label: '📅 Book GP Appointment', color: 'bg-emerald-600 text-white shadow-emerald-600/25' },
};

export const TriageWizard: React.FC<TriageWizardProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);

  const step = TRIAGE_STEPS[currentStep];

  const handleOptionSelect = (value: string) => {
    const newAnswers = { ...answers, [step.id]: value };
    setAnswers(newAnswers);

    // Early exit: if red flag detected and it's 'none', skip to category
    if (step.id === 'redFlag' && value !== 'none') {
      handleFinish(newAnswers);
      return;
    }

    if (currentStep < TRIAGE_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinish(newAnswers);
    }
  };

  const handleFinish = (finalAnswers: Record<string, string>) => {
    setIsProcessing(true);
    setTimeout(() => {
      const triageResult = TriageEngine.process(finalAnswers);
      setResult(triageResult);
      setIsProcessing(false);
    }, 1800);
  };

  // Show result screen
  if (result) {
    const acfg = actionConfig[result.recommendedAction];
    return (
      <div className="flex flex-col flex-1 bg-white">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-black text-gray-900">AI Triage Result</h2>
          </div>
        </div>

        <div className="flex-1 p-6 flex flex-col space-y-5 overflow-y-auto">
          {/* Red flag alert */}
          {result.isRedFlag && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-red-50 border-2 border-red-400 rounded-3xl p-5 flex items-start gap-4"
            >
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse" />
              </div>
              <div>
                <p className="font-black text-red-700 text-base mb-1">🚨 Red Flag Detected</p>
                <p className="text-sm text-red-600 font-medium leading-relaxed">
                  Your symptoms may indicate a medical emergency. Please call <strong>108</strong> or go to the nearest ER immediately.
                </p>
              </div>
            </motion.div>
          )}

          {/* Department card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-3xl p-5 bg-gradient-to-br ${urgencyColors[result.urgency]} text-white`}
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-1">Recommended Department</p>
            <p className="text-2xl font-black mb-1">{result.department}</p>
            <p className="text-sm font-medium text-white/85 leading-relaxed">{result.summary}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-widest">
                {result.urgency}
              </span>
              <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full">
                Confidence: {result.confidence}%
              </span>
            </div>
          </motion.div>

          {/* Confidence bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-50 rounded-2xl p-4 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> AI Confidence
              </p>
              <span className="text-sm font-black text-gray-900">{result.confidence}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${result.confidence}%` }}
                transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  result.confidence >= 80 ? 'bg-emerald-500' :
                  result.confidence >= 60 ? 'bg-yellow-500' : 'bg-orange-500'
                }`}
              />
            </div>
            <p className="text-[10px] text-gray-400 font-medium mt-2">
              {result.confidence >= 80
                ? 'High confidence — strong symptom match'
                : result.confidence >= 60
                ? 'Moderate confidence — doctor will confirm'
                : 'Low confidence — please describe to doctor directly'}
            </p>
          </motion.div>

          {/* Actions */}
          <div className="space-y-3">
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              onClick={() => onComplete(result)}
              className={`w-full py-4 rounded-2xl font-black text-base shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform uppercase tracking-wider ${acfg.color}`}
            >
              {acfg.label}
            </motion.button>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              onClick={() => { setResult(null); setCurrentStep(0); setAnswers({}); }}
              className="w-full py-3 rounded-2xl font-bold text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Redo Assessment
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-white">
      <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-lg font-black text-gray-900">AI Triage Assistant</h2>
        </div>
        <button onClick={onCancel} className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">
          Cancel
        </button>
      </div>

      <div className="flex-1 p-6 flex flex-col">
        {!isProcessing ? (
          <div className="space-y-8">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex gap-1.5">
                {TRIAGE_STEPS.map((_, idx) => (
                  <motion.div
                    key={idx}
                    animate={{
                      backgroundColor: idx < currentStep ? '#2563eb' : idx === currentStep ? '#93c5fd' : '#f3f4f6'
                    }}
                    className="h-1.5 flex-1 rounded-full"
                  />
                ))}
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Question {currentStep + 1} of {TRIAGE_STEPS.length}
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <h3 className="text-xl font-black text-gray-900 leading-tight mb-1">
                    {step.question}
                  </h3>
                  {step.hint && (
                    <p className="text-xs text-gray-400 font-medium">{step.hint}</p>
                  )}
                </div>

                <div className="space-y-3">
                  {step.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleOptionSelect(option.value)}
                      className={`w-full p-4 bg-white border-2 rounded-2xl text-left transition-all flex items-center justify-between group active:scale-[0.98] ${
                        option.isRedFlag
                          ? 'border-red-100 hover:border-red-400 hover:bg-red-50/40'
                          : 'border-gray-100 hover:border-blue-400 hover:bg-blue-50/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {option.emoji && (
                          <span className="text-xl w-8 text-center shrink-0">{option.emoji}</span>
                        )}
                        <span className={`font-bold text-sm ${
                          option.isRedFlag ? 'text-red-700 group-hover:text-red-800' : 'text-gray-700 group-hover:text-blue-700'
                        }`}>
                          {option.label}
                        </span>
                      </div>
                      <ChevronRight className={`w-5 h-5 shrink-0 ${
                        option.isRedFlag ? 'text-red-300 group-hover:text-red-500' : 'text-gray-300 group-hover:text-blue-500'
                      }`} />
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Go Back
              </button>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-100 rounded-full" />
              <div className="w-20 h-20 border-4 border-blue-600 rounded-full border-t-transparent animate-spin absolute top-0" />
              <Stethoscope className="w-9 h-9 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center">
              <p className="font-black text-gray-900 text-lg">Analyzing Symptoms...</p>
              <p className="text-sm text-gray-500 font-medium mt-1">AI is matching you with the right specialist</p>
            </div>
            {/* Animated dots */}
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.25 }}
                  className="w-2 h-2 rounded-full bg-blue-500"
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto pt-4">
          <div className="bg-gray-50 rounded-2xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-gray-500 leading-tight font-medium">
              This AI assistant provides guidance only. In emergencies, always call <strong>108</strong> or go to the nearest hospital.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
