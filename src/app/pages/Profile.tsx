import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  User, Phone, Mail, MapPin, Heart, Shield, AlertTriangle,
  Edit3, Check, Calendar, Clock, Zap, QrCode, ChevronRight,
  Droplets, Pill
} from 'lucide-react';
import { MOCK_USER_PROFILE } from '../constants/mockData';
import { useAppState } from '../contexts/AppStateContext';
import { toast } from 'sonner';
import { MOCK_FAMILY_MEMBERS } from '../types/patient';

export const Profile = () => {
  const navigate = useNavigate();
  const { userTokens } = useAppState();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(MOCK_USER_PROFILE.name);
  const [phone, setPhone] = useState(MOCK_USER_PROFILE.phone);
  const [email, setEmail] = useState(MOCK_USER_PROFILE.email);
  const [abhaLinked, setAbhaLinked] = useState(false);
  const [showingAbhaModal, setShowingAbhaModal] = useState(false);
  const profile = MOCK_USER_PROFILE;

  const handleSave = () => {
    setEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleLinkAbha = () => {
    setShowingAbhaModal(true);
    setTimeout(() => {
      setShowingAbhaModal(false);
      setAbhaLinked(true);
      toast.success('ABHA ID linked successfully!', {
        description: 'Your health records are now being synced with ABDM.'
      });
    }, 2000);
  };

  return (
    <div className="flex flex-col flex-1 bg-gray-50 pb-6">
      {/* Header card */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-5 pt-5 pb-8 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-15%] w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-36 h-36 bg-white/5 rounded-full blur-xl" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center border-2 border-white/30 shrink-0">
            <span className="text-3xl font-black text-white">{profile.avatar}</span>
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="bg-white/20 text-white placeholder-white/50 rounded-lg px-3 py-1.5 text-lg font-bold w-full border border-white/30 outline-none mb-1"
              />
            ) : (
              <h1 className="text-xl font-black text-white leading-tight mb-0.5">{name}</h1>
            )}
            <p className="text-indigo-200 text-xs font-medium">Airoli, Navi Mumbai</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-black bg-white/15 text-white px-2 py-0.5 rounded-lg border border-white/20">
                🩸 {profile.bloodGroup}
              </span>
              <span className="text-[10px] font-black bg-green-500/20 text-green-300 px-2 py-0.5 rounded-lg border border-green-400/30">
                ✓ Verified
              </span>
            </div>
          </div>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center border border-white/20 active:scale-95 shrink-0"
          >
            {editing ? <Check className="w-5 h-5 text-green-300" /> : <Edit3 className="w-4 h-4 text-white" />}
          </button>
        </div>
      </div>

      <div className="px-5 -mt-4 relative z-20 space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-2xl p-3 shadow-lg border border-gray-100 text-center">
            <p className="text-2xl font-black text-indigo-600">{profile.stats.totalVisits}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Visits</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-lg border border-gray-100 text-center">
            <p className="text-2xl font-black text-blue-600">{profile.stats.tokensUsed + userTokens.length}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Tokens</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-lg border border-gray-100 text-center">
            <p className="text-2xl font-black text-red-600">{profile.stats.emergencyAlerts}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">SOS Used</p>
          </div>
        </div>

        {/* QR Code Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
              <QrCode className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="font-black text-gray-900 text-sm">Hospital Check-In QR</p>
              <p className="text-xs text-gray-500 font-medium">Show at reception for quick check-in</p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-40 h-40 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center p-3">
              {/* Simulated QR pattern */}
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {Array.from({ length: 10 }).map((_, row) =>
                  Array.from({ length: 10 }).map((_, col) => {
                    const filled = ((row + col) % 3 === 0) || ((row * col) % 7 < 3);
                    return filled ? (
                      <rect key={`${row}-${col}`} x={col * 10} y={row * 10} width="8" height="8" rx="1" fill="#1e1b4b" />
                    ) : null;
                  })
                )}
                {/* Corner markers */}
                <rect x="0" y="0" width="28" height="28" rx="4" fill="none" stroke="#1e1b4b" strokeWidth="3" />
                <rect x="4" y="4" width="20" height="20" rx="2" fill="#1e1b4b" />
                <rect x="72" y="0" width="28" height="28" rx="4" fill="none" stroke="#1e1b4b" strokeWidth="3" />
                <rect x="76" y="4" width="20" height="20" rx="2" fill="#1e1b4b" />
                <rect x="0" y="72" width="28" height="28" rx="4" fill="none" stroke="#1e1b4b" strokeWidth="3" />
                <rect x="4" y="76" width="20" height="20" rx="2" fill="#1e1b4b" />
              </svg>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 font-medium text-center mt-3">ID: NEO-{profile.aadhaar.slice(-4)}-{Date.now().toString(36).slice(-6).toUpperCase()}</p>
        </motion.div>

        {/* ABHA / ABDM Section */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-blue-50/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-black text-gray-900 text-sm">ABDM Health Stack</p>
                <p className="text-[10px] text-blue-600 font-black uppercase tracking-wider">Ayushman Bharat</p>
              </div>
            </div>
            {abhaLinked ? (
              <div className="flex items-center gap-1 text-green-600 font-bold text-xs">
                <Check className="w-4 h-4" /> Linked
              </div>
            ) : (
               <button 
                onClick={handleLinkAbha}
                disabled={showingAbhaModal}
                className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50 transition-all"
               >
                 {showingAbhaModal ? 'Linking...' : 'Link ABHA'}
               </button>
            )}
          </div>
          <div className="p-4">
            {abhaLinked ? (
              <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">ABHA Address</p>
                <p className="text-sm font-black text-gray-900">{profile.phone.slice(-10)}@abdm</p>
                <div className="mt-2 flex gap-2">
                  <span className="text-[9px] font-bold bg-white text-green-700 px-1.5 py-0.5 rounded border border-green-200">Records Shared</span>
                  <span className="text-[9px] font-bold bg-white text-green-700 px-1.5 py-0.5 rounded border border-green-200">Consent Active</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 leading-relaxed">
                Connect your ABHA (Ayushman Bharat Health Account) to securely access and share your digital health records with doctors across India.
              </p>
            )}
          </div>
        </section>

        {/* Personal Info */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-blue-500" />
            </div>
            <p className="font-black text-gray-900 text-sm">Personal Info</p>
          </div>
          <div className="divide-y divide-gray-100">
            <InfoRow icon={Phone} label="Phone" value={editing ? phone : profile.phone} editing={editing} onChange={setPhone} />
            <InfoRow icon={Mail} label="Email" value={editing ? email : profile.email} editing={editing} onChange={setEmail} />
            <InfoRow icon={Calendar} label="Date of Birth" value={profile.dob} />
            <InfoRow icon={MapPin} label="Address" value={profile.address} />
            <InfoRow icon={Shield} label="Aadhaar" value={profile.aadhaar} />
          </div>
        </section>

        {/* Medical Info */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <p className="font-black text-gray-900 text-sm">Medical Info</p>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
              <Droplets className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Blood Group</p>
                <p className="text-lg font-black text-red-600">{profile.bloodGroup}</p>
              </div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100">
              <div className="flex items-center gap-2 mb-2">
                <Pill className="w-4 h-4 text-yellow-600" />
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Allergies</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.allergies.map(a => (
                  <span key={a} className="text-xs font-bold text-yellow-800 bg-yellow-100 px-3 py-1 rounded-lg border border-yellow-200">{a}</span>
                ))}
              </div>
            </div>
            <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Emergency Contact</p>
              </div>
              <p className="text-sm font-bold text-gray-900">{profile.emergencyContact.name}</p>
              <p className="text-xs text-gray-500 font-medium">{profile.emergencyContact.relation} • {profile.emergencyContact.phone}</p>
            </div>
          </div>
        </section>

        {/* Quick links */}
        <div className="space-y-2">
          <button
            onClick={() => navigate('/records')}
            className="w-full flex items-center gap-3 px-5 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors active:scale-[0.99]"
          >
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
              <Pill className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-black text-gray-900 text-sm">Medical Records</p>
              <p className="text-xs text-gray-500 font-medium">Prescriptions & lab reports</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => navigate('/feedback')}
            className="w-full flex items-center gap-3 px-5 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors active:scale-[0.99]"
          >
            <div className="w-9 h-9 bg-yellow-50 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-black text-gray-900 text-sm">Rate Your Visit</p>
              <p className="text-xs text-gray-500 font-medium">Share feedback & reviews</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({
  icon: Icon, label, value, editing, onChange
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  editing?: boolean;
  onChange?: (v: string) => void;
}) => (
  <div className="flex items-center gap-3 px-5 py-3.5">
    <Icon className="w-4 h-4 text-gray-400 shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      {editing && onChange ? (
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          className="text-sm font-bold text-gray-900 w-full bg-blue-50 rounded px-2 py-1 mt-0.5 border border-blue-200 outline-none"
        />
      ) : (
        <p className="text-sm font-bold text-gray-900 truncate">{value}</p>
      )}
    </div>
  </div>
);
