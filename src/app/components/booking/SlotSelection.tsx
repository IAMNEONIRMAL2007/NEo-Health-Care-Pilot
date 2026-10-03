import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addDays, isSameDay } from 'date-fns';
import { Calendar, Clock, Info, ShieldCheck, Timer, Zap, CheckCircle2 } from 'lucide-react';
import { generateSlots, Slot } from '../../constants/mockData';

interface SlotSelectionProps {
  onNext: (data: any) => void;
  onBack: () => void;
  hospitalName: string;
  doctorName: string;
}

export const SlotSelection: React.FC<SlotSelectionProps> = ({ onNext, onBack, hospitalName, doctorName }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isLoading, setIsLoading] = useState(false);

  // Generate 14 days for the horizontal picker
  const days = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));
  }, []);

  // Filter slots for the selected date (simulated)
  const slots = useMemo(() => generateSlots(), [selectedDate]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDateSelect = (date: Date) => {
    setIsLoading(true);
    setSelectedDate(date);
    setSelectedSlot(null);
    setTimeout(() => setIsLoading(false), 600);
  };

  const handleNext = () => {
    if (!selectedSlot) return;
    onNext({ appointmentDate: selectedDate.toISOString(), appointmentTime: selectedSlot });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col flex-1 p-5"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Select Slot</h2>
        <p className="text-sm text-gray-500 font-medium">{doctorName} @ {hospitalName}</p>
      </div>

      {/* Date Picker (Horizontal) */}
      <div className="mb-8 overflow-x-auto no-scrollbar -mx-5 px-5 flex gap-3">
        {days.map((day, idx) => {
          const isSelected = isSameDay(day, selectedDate);
          return (
            <button
              key={idx}
              onClick={() => handleDateSelect(day)}
              className={`flex flex-col items-center justify-center min-w-[70px] h-[90px] rounded-2xl border-2 transition-all shrink-0 ${
                isSelected
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105'
                  : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200'
              }`}
            >
              <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                {format(day, 'EEE')}
              </span>
              <span className="text-xl font-black">{format(day, 'd')}</span>
              <span className={`text-[9px] font-bold mt-1 ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                {format(day, 'MMM')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Slot Hold Timer */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
            <Timer className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-black text-orange-800 uppercase tracking-wider">Slot Hold Active</p>
            <p className="text-[11px] text-orange-600 font-medium">Complete booking within this time</p>
          </div>
        </div>
        <div className="text-xl font-black text-orange-600 tabular-nums">
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Slot Grids */}
      <div className="space-y-6 flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
            <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm font-bold">Fetching slots...</p>
          </div>
        ) : (
          (['morning', 'afternoon', 'evening'] as const).map(period => (
            <div key={period} className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                {period === 'morning' ? '🌅 Morning' : period === 'afternoon' ? '☀️ Afternoon' : '🌙 Evening'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {slots
                  .filter(s => s.period === period)
                  .map((slot, idx) => {
                    const isSelected = selectedSlot === slot.time;
                    const isRecommended = idx === 0 && period === 'morning'; // Mock recommendation
                    return (
                      <button
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot.time)}
                        className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                          !slot.available
                            ? 'bg-gray-50 border-gray-50 text-gray-300 cursor-not-allowed'
                            : isSelected
                            ? 'bg-blue-50 border-blue-500 shadow-sm shadow-blue-500/10'
                            : 'bg-white border-gray-100 hover:border-blue-200'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-sm font-black ${isSelected ? 'text-blue-700' : slot.available ? 'text-gray-900' : 'text-gray-300'}`}>
                            {slot.time}
                          </span>
                          {isRecommended && (
                            <span className="text-[8px] font-black bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
                              Nearest
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold ${isSelected ? 'text-blue-500' : 'text-gray-500'}`}>
                            ₹500 Fee
                          </span>
                          <span className={`text-[9px] font-medium ${isSelected ? 'text-blue-400' : 'text-gray-400'}`}>
                            {slot.available ? `${Math.floor(Math.random() * 5) + 1} slots left` : 'Fully booked'}
                          </span>
                        </div>
                        {isSelected && (
                          <motion.div
                            layoutId="check"
                            className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-1 shadow-md shadow-blue-600/30"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                          </motion.div>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-8 flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100 text-blue-600 text-[11px] font-semibold leading-relaxed">
        <Zap className="w-4 h-4 shrink-0 fill-blue-600" />
        Booking with Airoli Care Connect reduces clinic wait time by average 45 minutes.
      </div>

      {/* CTA */}
      <div className="pt-6 flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase tracking-wider text-sm active:scale-[0.98] transition-transform"
        >
          Back
        </button>
        <button
          disabled={!selectedSlot}
          onClick={handleNext}
          className="flex-[2] py-4 bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-2xl font-black uppercase tracking-wider text-sm shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          {t('confirmBooking')}
        </button>
      </div>
    </motion.div>
  );
};

// Helper for translation key usage if needed, or just hardcode as per MVP specs
const t = (key: string) => key === 'confirmBooking' ? 'Confirm Slot' : key;
