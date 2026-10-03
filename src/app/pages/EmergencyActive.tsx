import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useAppState } from '../contexts/AppStateContext';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_HOSPITALS, AMBULANCE_NUMBER } from '../constants/mockData';
import {
  PhoneCall, XCircle, ShieldCheck, HeartPulse,
  MapPin, AlertTriangle, CheckCircle2, Wifi, WifiOff, Share2
} from 'lucide-react';
import { toast } from 'sonner';
import { liveEmergencyService } from '../services/liveEmergencyService';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const patientIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export const EmergencyActive = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const locationState = useLocation().state as { hospitalId?: string; ambulanceId?: string } | null;
  const { activeEmergency, stopEmergency } = useAppState();

  const hospitalId = locationState?.hospitalId || activeEmergency?.hospitalId;
  const ambulanceId = locationState?.ambulanceId;
  const hospital = hospitalId ? MOCK_HOSPITALS.find(h => h.id === hospitalId) : MOCK_HOSPITALS[0];

  const [eta, setEta] = useState(hospital ? hospital.eta : 10);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelCountdown, setCancelCountdown] = useState(30);
  const [isOnline, setIsOnline] = useState(true);
  const [locationUpdates, setLocationUpdates] = useState(0);
  const [patientLocation, setPatientLocation] = useState<[number, number] | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);

  // Simulate ETA countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setEta(prev => Math.max(0, prev - 1));
    }, 30000); // fast demo: every 30s
    return () => clearInterval(timer);
  }, []);

  // Start live session and location updates
  useEffect(() => {
    let currentSessionId: string | null = null;
    let watchId: number | null = null;

    const initSession = async () => {
      // 1. Get initial location
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        setPatientLocation([latitude, longitude]);
        
        // Fetch initial route
        if (hospital?.lat && hospital?.lng) {
          try {
            const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${longitude},${latitude};${hospital.lng},${hospital.lat}?overview=full&geometries=geojson`);
            const data = await res.json();
            if (data.routes && data.routes[0]) {
              // OSRM returns [lng, lat], Leaflet needs [lat, lng]
              const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
              setRouteCoordinates(coords);
            }
          } catch (e) {
            console.error("OSRM Route Error:", e);
          }
        }

        // 2. Start session on backend
        currentSessionId = await liveEmergencyService.startSession(latitude, longitude, {
          hospitalId,
          ambulanceId
        });
        
        if (currentSessionId) {
          setSessionId(currentSessionId);
          console.log("Emergency Session Started:", currentSessionId);

          // 3. Watch location and push updates
          watchId = navigator.geolocation.watchPosition(
            async (newPos) => {
              setLocationUpdates(n => n + 1);
              setIsOnline(true);
              setPatientLocation([newPos.coords.latitude, newPos.coords.longitude]);
              await liveEmergencyService.updateLocation(currentSessionId!, newPos.coords.latitude, newPos.coords.longitude);
            },
            (err) => {
              console.error("Watch location error:", err);
              setIsOnline(false);
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
          );
        }
      });
    };

    initSession();

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [hospitalId, ambulanceId]);

  // Cancel countdown
  useEffect(() => {
    let cancelTimer: NodeJS.Timeout;
    if (showCancelConfirm && cancelCountdown > 0) {
      cancelTimer = setInterval(() => setCancelCountdown(c => c - 1), 1000);
    } else if (cancelCountdown === 0) {
      setShowCancelConfirm(false);
      setCancelCountdown(30);
    }
    return () => clearInterval(cancelTimer!);
  }, [showCancelConfirm, cancelCountdown]);

  const handleCallHospital = () => {
    window.location.href = `tel:${hospital.phone}`;
    toast.info(`Calling ${hospital.shortName}...`);
  };

  const handleCallAmbulance = () => {
    window.location.href = `tel:${AMBULANCE_NUMBER}`;
    toast.info('Calling National Ambulance 108...');
  };

  const handleShareLocation = () => {
    const mapsUrl = `https://maps.google.com/?q=${hospital.lat},${hospital.lng}`;
    if (navigator.share) {
      navigator.share({ title: 'Emergency - My Location', url: mapsUrl }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(mapsUrl);
      toast.success('Hospital location link copied to clipboard!');
    }
  };

  const handleCancel = async (reason: 'arrived' | 'cancelled' | 'false_alarm') => {
    if (sessionId) {
      await liveEmergencyService.resolveSession(sessionId);
    }
    stopEmergency(reason);
    toast.success(
      reason === 'arrived' ? 'Marked as arrived. Stay safe!' :
      reason === 'false_alarm' ? 'False alarm reported. Alert cancelled.' :
      'Emergency alert cancelled.'
    );
    navigate('/home');
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 text-white relative overflow-hidden">
      {/* Ambient glow */}
      <motion.div
        animate={{ opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 left-0 right-0 h-72 bg-gradient-to-b from-red-900/40 to-transparent pointer-events-none"
      />

      {/* Top status bar */}
      <div className="relative z-10 px-5 pt-5 pb-4 bg-gray-900/90 backdrop-blur-xl border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-25" />
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/40 relative z-10">
                <ShieldCheck className="w-5 h-5 text-red-400" />
              </div>
            </div>
            <div>
              <h2 className="font-black text-white text-base">{t('emergencyActive')}</h2>
              <p className="text-xs text-red-300 font-bold uppercase tracking-widest">{t('locationSharing')}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest ${
            isOnline
              ? 'bg-green-900/50 border-green-700 text-green-400'
              : 'bg-red-900/50 border-red-700 text-red-400'
          }`}>
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isOnline ? 'Live' : 'Syncing...'}
          </div>
        </div>

        {/* Hospital card */}
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <h3 className="font-black text-lg text-white leading-tight mb-1">{hospital.name}</h3>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-3">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{hospital.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-green-400">
                  <HeartPulse className="w-3.5 h-3.5" />
                  {t('hospitalNotified')}
                </div>
                <div className="text-xs text-gray-600">•</div>
                <div className="text-xs text-gray-500 font-medium">{locationUpdates} updates sent</div>
              </div>
            </div>
            <div className="bg-red-950/60 border border-red-900/60 px-3 py-2 rounded-xl text-center shrink-0">
              <p className="text-[9px] text-red-500 font-black uppercase tracking-widest mb-0.5">ETA</p>
              <p className="text-3xl font-black text-red-400 leading-none">{eta}</p>
              <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest mt-0.5">{t('etaMins')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Map area */}
      <div className="flex-1 relative bg-gray-900 overflow-hidden z-0">
        {patientLocation ? (
          <MapContainer 
            center={patientLocation} 
            zoom={14} 
            style={{ height: '100%', width: '100%', opacity: 0.8 }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={patientLocation} icon={patientIcon}>
              <Popup>Your Location</Popup>
            </Marker>
            {hospital && hospital.lat && hospital.lng && (
              <Marker position={[hospital.lat, hospital.lng]} icon={hospitalIcon}>
                <Popup>{hospital.name}</Popup>
              </Marker>
            )}
            {routeCoordinates.length > 0 && (
              <Polyline positions={routeCoordinates} color="#ef4444" weight={5} opacity={0.7} dashArray="10, 10" className="animate-pulse" />
            )}
          </MapContainer>
        ) : (
          <div className="w-full h-full bg-slate-900 flex items-center justify-center text-gray-400">
            Locating...
          </div>
        )}
      </div>

      {/* Bottom action panel */}
      <div className="relative z-10 p-5 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleCallHospital}
            className="py-3.5 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-bold flex flex-col items-center justify-center gap-1.5 transition-colors border border-gray-700 active:scale-95"
          >
            <PhoneCall className="w-5 h-5 text-green-400" />
            <span className="text-[10px] uppercase tracking-wider text-gray-300">Hospital</span>
          </button>
          <button
            onClick={handleCallAmbulance}
            className="py-3.5 bg-red-600/90 hover:bg-red-600 text-white rounded-2xl font-bold flex flex-col items-center justify-center gap-1.5 transition-colors border border-red-500 active:scale-95 shadow-lg shadow-red-900/50"
          >
            <span className="text-xl">🚑</span>
            <span className="text-[10px] uppercase tracking-wider">108</span>
          </button>
          <button
            onClick={handleShareLocation}
            className="py-3.5 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-bold flex flex-col items-center justify-center gap-1.5 transition-colors border border-gray-700 active:scale-95"
          >
            <Share2 className="w-5 h-5 text-blue-400" />
            <span className="text-[10px] uppercase tracking-wider text-gray-300">Share</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!showCancelConfirm ? (
            <motion.div key="cancel-btn" className="space-y-2">
              <button
                onClick={() => handleCancel('arrived')}
                className="w-full py-3 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 rounded-xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> I've Arrived at Hospital
              </button>
              <button
                onClick={() => { setShowCancelConfirm(true); setCancelCountdown(30); }}
                className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" /> {t('cancelAlert')}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="cancel-confirm"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="bg-gray-950 p-4 rounded-2xl border border-red-900/50"
            >
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
                <p className="text-sm font-bold text-gray-200 leading-tight">
                  Cancel the emergency alert?
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleCancel('cancelled')}
                  className="col-span-1 py-2.5 bg-gray-700 text-gray-300 rounded-xl font-bold text-xs uppercase tracking-wide active:scale-95"
                >
                  Cancel ({cancelCountdown}s)
                </button>
                <button
                  onClick={() => handleCancel('false_alarm')}
                  className="col-span-1 py-2.5 bg-yellow-600/80 text-yellow-100 rounded-xl font-bold text-xs uppercase tracking-wide active:scale-95"
                >
                  False Alarm
                </button>
                <button
                  onClick={() => { setShowCancelConfirm(false); setCancelCountdown(30); }}
                  className="col-span-1 py-2.5 bg-green-600 text-white rounded-xl font-bold text-xs uppercase tracking-wide active:scale-95"
                >
                  Keep Active
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
