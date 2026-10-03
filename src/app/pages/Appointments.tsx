import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useAppState } from '../contexts/AppStateContext';
import { MOCK_HOSPITALS, MOCK_DOCTORS, generateSlots, Slot } from '../constants/mockData';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar, Clock, ChevronRight, Stethoscope, Building2,
  UserPlus, CheckCircle2, Star, ChevronDown, User, CreditCard, ChevronLeft, Zap, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { PatientDetails } from '../components/booking/PatientDetails';
import { SlotSelection } from '../components/booking/SlotSelection';
import { PaymentGatewayOverlay } from '../components/booking/PaymentGatewayOverlay';
import { ConfirmationToken } from '../components/booking/ConfirmationToken';
import { TriageWizard } from '../components/booking/TriageWizard';
import { TriageResult } from '../services/triageEngine';
import { Token } from '../types/token';
import { SlotRecommender, SlotScore } from '../services/slotRecommender';

type BookingStep = 'selection' | 'details' | 'slots' | 'payment' | 'confirmation';

export const Appointments = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { addToken } = useAppState();
  const [bookingType, setBookingType] = useState<'slot' | 'walkin'>('slot');
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'clinic'>('clinic');
  const [step, setStep] = useState<BookingStep>('selection');
  const [isLoading, setIsLoading] = useState(false);
  const [bookedToken, setBookedToken] = useState<Token | null>(null);
  const [patientData, setPatientData] = useState<any>(null);
  const [slotData, setSlotData] = useState<any>(null);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [showTriage, setShowTriage] = useState(false);

  const hospital = MOCK_HOSPITALS.find(h => h.id === selectedHospital);

  const availableDepts = useMemo(() => {
    if (!hospital) return [];
    return hospital.departments;
  }, [hospital]);

  const availableDoctors = useMemo(() => {
    return MOCK_DOCTORS.filter(
      d => d.hospitalId === selectedHospital && d.department === selectedDept
    );
  }, [selectedHospital, selectedDept]);

  const slots: Slot[] = useMemo(() => generateSlots(), []);
  const slotScores: SlotScore[] = useMemo(() => SlotRecommender.score(slots), [slots]);
  const bestSlotHint = useMemo(() => selectedDept ? SlotRecommender.getBestSlotHint(slots) : null, [slots, selectedDept]);

  const canProceed =
    selectedHospital &&
    selectedDept &&
    (bookingType === 'walkin' || (selectedSlot && (availableDoctors.length === 0 || selectedDoctor)));

  const handleBook = () => {
    if (!canProceed || !hospital) return;
    setStep('details');
  };

  const handlePatientData = (data: any) => {
    setPatientData(data);
    setStep('slots');
  };

  const handleSlotData = (data: any) => {
    setSlotData(data);
    setStep('payment');
  };

  const handlePaymentSuccess = (
    method: 'Online' | 'Cash',
    status: 'Success' | 'PayAtClinic',
    paymentDetails?: { gateway: string; transactionId: string }
  ) => {
    if (!hospital) return;
    
    const doctor = MOCK_DOCTORS.find(d => d.id === selectedDoctor) ||
      MOCK_DOCTORS.find(d => d.hospitalId === selectedHospital && d.department === selectedDept);

    const token = addToken({
      clinicId: selectedHospital,
      hospitalName: hospital.name,
      department: selectedDept,
      doctorName: doctor?.name || 'To be assigned',
      doctorId: doctor?.id || 'd_assigned',
      patientName: patientData.fullName,
      phone: patientData.phone,
      age: parseInt(patientData.age),
      appointmentTime: slotData.appointmentTime,
      type: bookingType,
      paymentMethod: method,
      paymentStatus: status,
      symptoms: patientData.symptoms || triageResult?.summary,
      relationship: patientData.relationship,
      urgency: triageResult?.urgency || 'Routine',
      triageSummary: triageResult?.summary,
      transactionId: paymentDetails?.transactionId,
      paymentGateway: paymentDetails?.gateway,
    });

    setBookedToken(token);
    setStep('confirmation');
    toast.success(`Token ${token.tokenNo} booked successfully!`);
  };

  if (step === 'confirmation' && bookedToken) {
    return <ConfirmationToken token={bookedToken} onDone={() => navigate('/home')} />;
  }

  if (showTriage) {
    return (
      <TriageWizard 
        onCancel={() => setShowTriage(false)}
        onComplete={(result) => {
          setTriageResult(result);
          setSelectedDept(result.department);
          // If we have doctors for this dept, let user pick one next
          setShowTriage(false);
          toast.info(`Triage Complete: Suggested ${result.department}`, {
            description: result.urgency === 'Urgent' ? 'Urgent priority will be assigned.' : undefined
          });
        }}
      />
    );
  }

  if (step === 'payment') {
    return (
      <div className="flex flex-col flex-1 bg-white relative">
        <PaymentGatewayOverlay 
          amount={500} 
          onSuccess={handlePaymentSuccess} 
          onCancel={() => setStep('slots')} 
        />
        {/* Underlay just in case */}
        <div className="p-6 opacity-20 pointer-events-none">
          <h2 className="text-xl font-bold">Awaiting Payment...</h2>
        </div>
      </div>
    );
  }

  if (step === 'slots') {
    const doctor = MOCK_DOCTORS.find(d => d.id === selectedDoctor) ||
      MOCK_DOCTORS.find(d => d.hospitalId === selectedHospital && d.department === selectedDept);
      
    return (
      <SlotSelection 
        hospitalName={hospital?.name || ''} 
        doctorName={doctor?.name || 'Doctor'} 
        onNext={handleSlotData} 
        onBack={() => setStep('details')} 
      />
    );
  }

  if (step === 'details') {
    return <PatientDetails onNext={handlePatientData} onBack={() => setStep('selection')} />;
  }

  return (
    <div className="flex flex-col flex-1 bg-gray-50 pb-6">
      <div className="bg-white px-5 pt-5 pb-4 border-b border-gray-100 mb-5 flex items-center gap-4">
        {step !== 'selection' && (
          <button onClick={() => setStep('selection')} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <div>
          <h2 className="text-2xl font-black text-gray-900">{t('bookAppointment')}</h2>
          <p className="text-sm font-medium text-gray-500 mt-0.5">Step 1: Choose Clinic & Doctor</p>
        </div>
      </div>

      <div className="px-5 space-y-5">
        {/* Triage Banner */}
        {!triageResult && (
          <button
            onClick={() => setShowTriage(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 p-4 rounded-2xl shadow-lg shadow-blue-600/20 flex items-center gap-4 text-left group active:scale-[0.98] transition-all"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0 border border-white/30 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-white font-black text-sm">Not sure about symptoms?</p>
              <p className="text-blue-100 text-[11px] font-medium leading-tight">Start our AI Assistant to find the right specialist for you.</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
          </button>
        )}

        {triageResult && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-start gap-3">
             <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
             </div>
             <div className="flex-1">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Triage Result</p>
                <p className="text-sm font-black text-gray-900">{triageResult.department}</p>
                <p className="text-xs text-gray-500 font-medium leading-tight mt-1">{triageResult.summary}</p>
             </div>
             <button 
              onClick={() => { setTriageResult(null); setSelectedDept(''); }}
              className="text-[10px] font-black text-red-500 underline uppercase tracking-wider"
             >
               Reset
             </button>
          </div>
        )}
        {/* Type toggle */}
        <div className="bg-white p-1 rounded-2xl flex border border-gray-200 shadow-sm">
          <button
            onClick={() => setBookingType('slot')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              bookingType === 'slot'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            {t('bookSlot')}
          </button>
          <button
            onClick={() => setBookingType('walkin')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              bookingType === 'walkin'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            {t('walkInToken')}
          </button>
        </div>

        {/* Hospital Select */}
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-700 uppercase tracking-widest flex items-center gap-1.5 pl-1">
            <Building2 className="w-3.5 h-3.5" /> {t('selectHospital')}
          </label>
          <div className="relative">
            <select
              value={selectedHospital}
              onChange={(e) => { setSelectedHospital(e.target.value); setSelectedDept(''); setSelectedDoctor(''); }}
              className="w-full p-4 pl-4 pr-10 bg-white border-2 border-gray-200 focus:border-blue-500 rounded-2xl text-gray-900 appearance-none font-medium transition-colors shadow-sm outline-none"
            >
              <option value="" disabled>Choose a hospital...</option>
              {MOCK_HOSPITALS.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} — ⭐{h.rating}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
          {hospital && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100"
            >
              <Star className="w-4 h-4 text-yellow-500 fill-current shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-blue-800 truncate">{hospital.name}</p>
                <p className="text-[11px] text-blue-600">{hospital.distance} km away • {hospital.eta} min ETA • {hospital.beds} beds</p>
              </div>
              {hospital.emergency && (
                <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-lg shrink-0">24/7 ER</span>
              )}
            </motion.div>
          )}
        </div>

        {/* Department Select */}
        <AnimatePresence>
          {selectedHospital && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <label className="text-xs font-black text-gray-700 uppercase tracking-widest flex items-center gap-1.5 pl-1">
                <Stethoscope className="w-3.5 h-3.5" /> {t('department')}
              </label>
              <div className="relative">
                <select
                  value={selectedDept}
                  onChange={(e) => { setSelectedDept(e.target.value); setSelectedDoctor(''); }}
                  className="w-full p-4 pr-10 bg-white border-2 border-gray-200 focus:border-blue-500 rounded-2xl text-gray-900 appearance-none font-medium transition-colors shadow-sm outline-none"
                >
                  <option value="" disabled>Choose a department...</option>
                  {availableDepts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Doctor Select */}
        <AnimatePresence>
          {selectedDept && availableDoctors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <label className="text-xs font-black text-gray-700 uppercase tracking-widest flex items-center gap-1.5 pl-1">
                <User className="w-3.5 h-3.5" /> {t('selectDoctor')}
              </label>
              <div className="space-y-2">
                {availableDoctors.map((doctor) => (
                  <button
                    key={doctor.id}
                    onClick={() => setSelectedDoctor(doctor.id)}
                    className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all flex items-center gap-3 ${
                      selectedDoctor === doctor.id
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-white border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      selectedDoctor === doctor.id ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <User className={`w-5 h-5 ${selectedDoctor === doctor.id ? 'text-blue-600' : 'text-gray-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900">{doctor.name}</p>
                      <p className="text-xs text-gray-500 font-medium">{doctor.qualification} • {doctor.experience} yrs exp</p>
                    </div>
                    {selectedDoctor === doctor.id && (
                      <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slot Select */}
        <AnimatePresence>
          {bookingType === 'slot' && selectedDept && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <label className="text-xs font-black text-gray-700 uppercase tracking-widest flex items-center gap-1.5 pl-1">
                <Calendar className="w-3.5 h-3.5" /> {t('availableSlots')}
              </label>

              {/* Smart Booking Hint */}
              {bestSlotHint && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <p className="text-xs font-bold text-emerald-800">{bestSlotHint}</p>
                </motion.div>
              )}

              {(['morning', 'afternoon', 'evening'] as const).map(period => {
                const periodSlots = slots.filter(s => s.period === period);
                const periodLabel = period === 'morning' ? '🌅 Morning' : period === 'afternoon' ? '☀️ Afternoon' : '🌙 Evening';
                return (
                  <div key={period} className="mb-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 pl-1">{periodLabel}</p>
                    <div className="grid grid-cols-4 gap-2">
                      {periodSlots.map((slot) => {
                        const score = slotScores.find(s => s.time === slot.time);
                        const isRec = score?.isRecommended && selectedSlot !== slot.time;
                        return (
                          <button
                            key={slot.time}
                            disabled={!slot.available}
                            onClick={() => setSelectedSlot(slot.time)}
                            className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all relative ${
                              !slot.available
                                ? 'bg-gray-100 text-gray-400 line-through cursor-not-allowed'
                                : selectedSlot === slot.time
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                                : isRec
                                ? 'bg-emerald-50 border-2 border-emerald-400 text-emerald-800'
                                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-400'
                            }`}
                          >
                            {slot.time}
                            {isRec && (
                              <span className="block text-[7px] font-black text-emerald-600 mt-0.5 uppercase tracking-wider">⭐ Best</span>
                            )}
                            {score && slot.available && selectedSlot !== slot.time && !isRec && (
                              <span className={`block text-[7px] font-bold mt-0.5 ${
                                score.loadScore >= 80 ? 'text-red-400' : 'text-gray-400'
                              }`}>
                                {score.loadScore >= 80 ? '🔴 Busy' : ''}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Walk-in info */}
        <AnimatePresence>
          {bookingType === 'walkin' && selectedDept && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-orange-50 rounded-2xl p-4 border border-orange-100"
            >
              <p className="text-sm font-black text-orange-800 mb-1">Walk-in Token</p>
              <p className="text-xs text-orange-700 font-medium leading-relaxed">
                You'll get a token with your position in the current queue. Wait at home and we'll notify you when your turn is near.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Select */}
        <AnimatePresence>
          {canProceed && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2 mt-4"
            >
              <label className="text-xs font-black text-gray-700 uppercase tracking-widest flex items-center gap-1.5 pl-1">
                <CreditCard className="w-3.5 h-3.5" /> Payment Option
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentMethod('online')}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all border-2 ${
                    paymentMethod === 'online'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-500 hover:border-blue-300'
                  }`}
                >
                   Pay Online
                </button>
                <button
                  onClick={() => setPaymentMethod('clinic')}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all border-2 ${
                    paymentMethod === 'clinic'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-500 hover:border-blue-300'
                  }`}
                >
                   Pay at Clinic
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <button
          onClick={handleBook}
          disabled={!canProceed}
          className="w-full py-4 bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-2xl font-black text-base transition-all active:scale-[0.98] disabled:active:scale-100 shadow-lg shadow-blue-600/20 disabled:shadow-none flex items-center justify-center gap-2 uppercase tracking-wider"
        >
          <UserPlus className="w-5 h-5" />
          {bookingType === 'slot' ? t('confirmBooking') : t('getToken')}
        </button>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
    <span className="text-sm font-bold text-gray-900 text-right max-w-[200px] leading-tight">{value}</span>
  </div>
);
