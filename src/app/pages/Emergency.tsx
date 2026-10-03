import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useAppState } from '../contexts/AppStateContext';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_HOSPITALS } from '../constants/mockData';
import {
  ShieldAlert, MapPin, Navigation, Star, Phone,
  CheckCircle2, Loader2, AlertTriangle, Brain
} from 'lucide-react';
import { toast } from 'sonner';
import { EmergencyTriageOverlay } from '../components/booking/EmergencyTriageOverlay';
import { useLocationService } from '../hooks/useLocationService';
import { hospitalDiscoveryService, DiscoveredHospital } from '../services/hospitalDiscovery';
import { ambulanceDiscoveryService, DiscoveredAmbulance } from '../services/ambulanceDiscovery';

type Step = 'consent' | 'locating' | 'hospitals';

export const Emergency = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { startEmergency } = useAppState();
  const [step, setStep] = useState<Step>('consent');
  const [isChecked, setIsChecked] = useState(false);
  const [locatingProgress, setLocatingProgress] = useState(0);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [discoveredHospitals, setDiscoveredHospitals] = useState<DiscoveredHospital[]>([]);
  const [discoveredAmbulances, setDiscoveredAmbulances] = useState<DiscoveredAmbulance[]>([]);

  const [showTriageOverlay, setShowTriageOverlay] = useState(false);
  const { getSingleLocation } = useLocationService();

  useEffect(() => {
    if (step !== 'locating') return;
    let isCancelled = false;

    const discover = async () => {
      try {
        setLocatingProgress(20);
        const loc = await getSingleLocation();
        setLocatingProgress(50);
        
        const hospitals = await hospitalDiscoveryService.discoverEmergencyHospitals(loc.latitude, loc.longitude);
        setLocatingProgress(75);
        
        const ambulances = await ambulanceDiscoveryService.discoverNearbyAmbulances(loc.latitude, loc.longitude);
        setLocatingProgress(100);
        
        if (!isCancelled) {
          setDiscoveredHospitals(hospitals);
          setDiscoveredAmbulances(ambulances);
          setTimeout(() => setStep('hospitals'), 500);
        }
      } catch (err) {
        toast.error("Could not determine live ETA. Using fallback data.");
        setLocatingProgress(100);
        if (!isCancelled) {
          // Fallback to static
          setDiscoveredHospitals(MOCK_HOSPITALS.filter(h => h.emergency).map(h => ({ 
            ...h, 
            calculatedEta: h.eta, 
            calculatedDistance: h.distance 
          })).sort((a, b) => a.calculatedEta - b.calculatedEta));
          setDiscoveredAmbulances([]);
          setTimeout(() => setStep('hospitals'), 500);
        }
      }
    };
    
    discover();
    return () => { isCancelled = true; };
  }, [step, getSingleLocation]);

  const handleConsent = () => {
    if (!isChecked) return;
    setStep('locating');
  };

  const handleSelectHospital = (hospitalId: string) => {
    setSelectedHospitalId(hospitalId);
    const hospital = MOCK_HOSPITALS.find(h => h.id === hospitalId)!;
    startEmergency(hospitalId);
    toast.success(`Emergency sent to ${hospital.shortName}. Help is on the way!`, { duration: 3000 });
    navigate('/emergency-active', { state: { hospitalId } });
  };

  const handleSendToNearest = () => {
    if (discoveredHospitals.length > 0) {
      handleSelectHospital(discoveredHospitals[0].id);
    }
  };

  const handleCallHospital = (e: React.MouseEvent, phone: string, name: string) => {
    e.stopPropagation();
    window.location.href = `tel:${phone}`;
    toast.info(`Calling ${name}...`);
  };

  const handleDispatchAmbulance = (ambulanceId: string, vehicleNum: string) => {
    toast.success(`Ambulance ${vehicleNum} dispatched! They are on their way.`, { duration: 4000 });
    // In a real app, we'd also update the backend to mark it as DISPATCHED and route the user to a tracking screen.
  };

  return (
    <div className="flex flex-col flex-1 bg-white relative">
      {/* AI Emergency Triage Overlay */}
      <EmergencyTriageOverlay
        isOpen={showTriageOverlay}
        onClose={() => setShowTriageOverlay(false)}
        onConfirmEmergency={() => {
          setShowTriageOverlay(false);
          setIsChecked(true);
          setStep('locating');
        }}
      />

      <AnimatePresence mode="wait">
        {/* STEP 1: CONSENT */}
        {step === 'consent' && (
          <motion.div
            key="consent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 p-5 flex flex-col justify-center max-w-sm mx-auto w-full"
          >
            <div className="bg-red-50 p-6 rounded-3xl border border-red-100 relative overflow-hidden mb-5">
              <div className="absolute top-[-30px] right-[-30px] opacity-5">
                <ShieldAlert className="w-56 h-56 text-red-500" />
              </div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                  <ShieldAlert className="w-7 h-7 text-red-600" />
                </div>
                <h2 className="text-xl font-black text-gray-900 mb-3 tracking-tight">
                  {t('emergencyConsentTitle')}
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed font-medium mb-5">
                  {t('emergencyConsentText')}
                </p>
                <label className="flex items-start gap-3 p-4 bg-white rounded-xl border-2 border-red-100 hover:border-red-300 cursor-pointer transition-colors">
                  <div className="mt-0.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => setIsChecked(e.target.checked)}
                      className="w-5 h-5 rounded accent-red-600"
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">
                    I agree to share my location for emergency response
                  </span>
                </label>
              </div>
            </div>

            {/* AI Symptom Check Button */}
            <button
              onClick={() => setShowTriageOverlay(true)}
              className="w-full flex items-center gap-3 p-4 mb-4 bg-indigo-50 rounded-2xl border border-indigo-100 hover:border-indigo-300 transition-colors active:scale-[0.98] text-left"
            >
              <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                <Brain className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="font-black text-indigo-800 text-sm">Check symptoms first (AI)</p>
                <p className="text-[10px] text-indigo-500 font-medium">Not sure if this is an emergency?</p>
              </div>
              <span className="text-[10px] font-black bg-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full">20s</span>
            </button>
            <div className="space-y-3">
              <button
                onClick={handleConsent}
                disabled={!isChecked}
                className="w-full py-4 bg-red-600 disabled:bg-red-300 text-white rounded-2xl font-black text-base transition-all active:scale-[0.98] disabled:active:scale-100 uppercase tracking-wider shadow-lg shadow-red-600/25 disabled:shadow-none"
              >
                {t('agree')}
              </button>
              <button
                onClick={() => navigate(-1)}
                className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold text-base hover:bg-gray-200 transition-colors active:scale-[0.98] uppercase tracking-wider"
              >
                {t('cancel')}
              </button>
            </div>

            <div className="mt-5 flex items-start gap-2 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
              <p className="text-xs text-yellow-800 font-medium leading-relaxed">
                Only use for real emergencies. A 30-second cancel window is available to avoid false alarms.
              </p>
            </div>
          </motion.div>
        )}

        {/* STEP 2: LOCATING */}
        {step === 'locating' && (
          <motion.div
            key="locating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-900 text-white"
          >
            <div className="relative mb-8">
              <div className="w-28 h-28 rounded-full border-4 border-red-500/30 flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500"
                  style={{
                    transform: `rotate(${locatingProgress * 3.6}deg)`,
                    transition: 'transform 0.15s linear',
                  }}
                />
                <MapPin className="w-10 h-10 text-red-400" />
              </div>
              <div className="absolute inset-0 animate-ping rounded-full bg-red-500/10" />
            </div>
            <h3 className="text-xl font-black mb-2 tracking-tight">Getting Your Location</h3>
            <p className="text-gray-400 text-sm font-medium text-center mb-6">
              Finding nearby hospitals and calculating ETAs...
            </p>
            <div className="w-full max-w-xs bg-gray-800 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-red-500 rounded-full"
                style={{ width: `${locatingProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-3 font-medium">{locatingProgress}%</p>
          </motion.div>
        )}

        {/* STEP 3: HOSPITALS LIST */}
        {step === 'hospitals' && (
          <motion.div
            key="hospitals"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col bg-gray-50"
          >
            {/* Mini Map */}
            <div className="h-36 bg-gray-200 relative overflow-hidden shrink-0">
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(135deg, #e8f4e8 0%, #d4e8d4 50%, #c8ddc8 100%)',
                }}
              />
              {/* Grid pattern */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'linear-gradient(#555 1px,transparent 1px),linear-gradient(90deg,#555 1px,transparent 1px)',
                  backgroundSize: '30px 30px',
                }}
              />
              {/* Road */}
              <div className="absolute top-1/2 left-0 right-0 h-5 bg-gray-400/40 -translate-y-1/2" />
              <div className="absolute top-0 bottom-0 left-1/3 w-4 bg-gray-400/30" />

              {/* User location */}
              <div className="absolute top-1/2 left-[42%] -translate-x-1/2 -translate-y-1/2">
                <div className="absolute inset-0 w-10 h-10 bg-blue-400 rounded-full blur-md opacity-40 animate-pulse" />
                <div className="w-4 h-4 bg-blue-600 border-3 border-white rounded-full shadow-lg relative z-10" />
                <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow">
                  You
                </div>
              </div>
              {/* Hospital dots */}
              {discoveredHospitals.slice(0, 3).map((h, i) => (
                <div
                  key={h.id}
                  className="absolute"
                  style={{
                    top: `${30 + i * 18}%`,
                    left: `${55 + i * 12}%`,
                  }}
                >
                  <div className="w-3 h-3 bg-red-500 border-2 border-white rounded-full shadow" />
                </div>
              ))}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50" />

              <div className="absolute top-3 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow">
                📍 Airoli, Navi Mumbai
              </div>
            </div>

            <div className="flex-1 p-4 space-y-5 pb-6">
              
              {/* Ambulances Section */}
              {discoveredAmbulances.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-black text-lg text-gray-900">Nearby Ambulances</h3>
                    <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Live Tracking
                    </span>
                  </div>
                  <div className="space-y-3">
                    {discoveredAmbulances.slice(0, 2).map((ambulance) => (
                      <div key={ambulance.id} className="bg-white p-3.5 rounded-2xl border-2 border-blue-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-black px-2.5 py-1 rounded-bl-xl uppercase tracking-widest">
                          {ambulance.category}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                            <span className="text-xl">🚑</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-gray-900 text-sm">{ambulance.vehicleNumber}</h4>
                            <p className="text-xs text-gray-500 font-medium">Driver: {ambulance.driverName}</p>
                            <p className="text-[10px] text-blue-600 font-bold mt-0.5">{ambulance.calculatedDistance} km away</p>
                          </div>
                          <div className="flex flex-col items-center shrink-0">
                            <span className="text-xl font-black text-blue-600 leading-none">{ambulance.calculatedEta}</span>
                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">MINS</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3 pt-3 border-t border-blue-50">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCallHospital(e, ambulance.phone, 'Ambulance Driver'); }}
                            className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Phone className="w-3 h-3" /> Call Driver
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDispatchAmbulance(ambulance.id, ambulance.vehicleNumber); }}
                            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-blue-600/20"
                          >
                            <Navigation className="w-3 h-3" /> Dispatch Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hospitals Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                <h3 className="font-black text-lg text-gray-900">{t('nearbyHospitals')}</h3>
                <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                  <CheckCircle2 className="w-3 h-3" />
                  Location Found
                </div>
              </div>

              {/* Send to Nearest CTA */}
              <button
                onClick={handleSendToNearest}
                className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-base shadow-lg shadow-red-600/30 flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all uppercase tracking-widest"
              >
                <Navigation className="w-5 h-5" />
                {t('sendToNearest')}
              </button>

              {discoveredHospitals.map((hospital, index) => (
                <div
                  key={hospital.id}
                  onClick={() => handleSelectHospital(hospital.id)}
                  className={`bg-white p-4 rounded-2xl border-2 shadow-sm cursor-pointer transition-all active:scale-[0.98] ${
                    selectedHospitalId === hospital.id
                      ? 'border-red-500 shadow-red-100'
                      : 'border-gray-100 hover:border-red-200'
                  } relative overflow-hidden`}
                >
                  {index === 0 && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                      Nearest
                    </div>
                  )}
                  {hospital.verified && (
                    <div className="absolute top-0 left-0 bg-green-500 text-white text-[9px] font-black px-2.5 py-1 rounded-br-xl uppercase tracking-widest flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                    </div>
                  )}

                  <div className="flex items-start gap-3 mt-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-gray-900 text-base leading-tight mb-1">
                        {hospital.name}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-gray-500 font-medium mb-2">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate">{hospital.address}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-lg text-xs font-bold border border-yellow-100">
                          <Star className="w-3 h-3 fill-current" />
                          {hospital.rating}
                          <span className="text-yellow-500 font-medium">({hospital.reviewCount})</span>
                        </div>
                        {hospital.emergency && (
                          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">
                            🚨 24/7 Emergency
                          </span>
                        )}
                        {hospital.ambulance && (
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                            🚑 Ambulance
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-center bg-red-50 px-3 py-2 rounded-xl border border-red-100 shrink-0">
                      <span className="text-2xl font-black text-red-600 leading-none">{hospital.calculatedEta}</span>
                      <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">{t('etaMins')}</span>
                      <span className="text-[9px] text-gray-400 font-medium mt-1">{hospital.calculatedDistance} km</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={(e) => handleCallHospital(e, hospital.phone, hospital.name)}
                      className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                    >
                      <Phone className="w-3.5 h-3.5" /> {t('callHospital')}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSelectHospital(hospital.id); }}
                      className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-95 shadow-sm shadow-red-600/20"
                    >
                      <Navigation className="w-3.5 h-3.5" /> Send Alert
                    </button>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
