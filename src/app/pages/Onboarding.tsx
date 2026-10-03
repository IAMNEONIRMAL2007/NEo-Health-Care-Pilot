import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useAppState } from '../contexts/AppStateContext';
import { Globe, MapPin, Smartphone, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

type Step = 'language' | 'profile' | 'location';

export const Onboarding = () => {
  const navigate = useNavigate();
  const { setLanguage, language } = useLanguage();
  const { deviceProfile, setDeviceProfile, setUserLocation } = useAppState();
  
  const [step, setStep] = useState<Step>('language');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If they already have a profile and we're just hitting this page, redirect to home
  useEffect(() => {
    if (deviceProfile && step === 'language') {
      navigate('/home', { replace: true });
    }
  }, [deviceProfile, navigate, step]);

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
  ];

  const handleLanguageSelect = (code: any) => {
    setLanguage(code);
    setStep('profile');
  };

  const generateDeviceId = () => {
    return 'dev_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setIsSubmitting(true);
    try {
      const deviceProfileId = generateDeviceId();
      const response = await fetch(`http://${window.location.hostname}:5000/api/users/device-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceProfileId,
          displayName,
          language
        })
      });

      const data = await response.json();
      if (data.success) {
        setDeviceProfile({
          deviceProfileId: data.user.deviceProfileId,
          displayName: data.user.displayName
        });
        setStep('location');
      } else {
        toast.error('Failed to create profile. Try again.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error. Check if backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationAllow = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      navigate('/home');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // Reverse geocode here if you want an address, or just save coords
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng, address: 'Current Location' });

        toast.success('Location access granted!');
        navigate('/home', { replace: true });
      },
      (error) => {
        toast.error('Location access denied. Some features may not work.');
        navigate('/home', { replace: true });
      }
    );
  };

  const handleLocationDeny = () => {
    toast.info('You can manually enter location later.');
    navigate('/home', { replace: true });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto px-6 py-12 flex flex-col items-center justify-center">
        
        {step === 'language' && (
          <div className="w-full max-w-sm animate-fade-in">
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 mb-2">Welcome to NEo Care</h1>
              <p className="text-gray-500 font-medium">Choose your preferred language</p>
            </div>

            <div className="space-y-3">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className="w-full p-4 flex items-center justify-between rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 active:scale-95 transition-all group"
                >
                  <div className="text-left">
                    <p className="font-bold text-gray-900">{lang.native}</p>
                    <p className="text-sm text-gray-500 font-medium">{lang.label}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'profile' && (
          <div className="w-full max-w-sm animate-fade-in">
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 mb-2">Device Profile</h1>
              <p className="text-gray-500 font-medium">No sign up needed. We create a profile tied to this device.</p>
            </div>

            <form onSubmit={handleCreateProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">What should we call you?</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !displayName.trim()}
                className="w-full p-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Continue'}
              </button>
            </form>
          </div>
        )}

        {step === 'location' && (
          <div className="w-full max-w-sm animate-fade-in">
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 mb-2">Find Healthcare</h1>
              <p className="text-gray-500 font-medium">Allow location access to discover hospitals, clinics, and pharmacies near you.</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleLocationAllow}
                className="w-full p-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 active:scale-95 transition-all"
              >
                Allow Location Access
              </button>
              <button
                onClick={handleLocationDeny}
                className="w-full p-4 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 active:scale-95 transition-all"
              >
                Enter Manually Later
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
