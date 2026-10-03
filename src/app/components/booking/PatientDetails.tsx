import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Users, Phone, FileText, ChevronDown, CheckCircle2, ShieldCheck, MapPin, CreditCard } from 'lucide-react';

interface PatientDetailsProps {
  onNext: (data: any) => void;
  onBack: () => void;
}

export const PatientDetails: React.FC<PatientDetailsProps> = ({ onNext, onBack }) => {
  const [relationship, setRelationship] = useState<'Self' | 'Family Member'>('Self');
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: 'Male',
    phone: '',
    symptoms: '',
  });
  const [showAdditional, setShowAdditional] = useState(false);
  const [additionalData, setAdditionalData] = useState({
    idNumber: '',
    insuranceProvider: '',
    address: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdditionalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAdditionalData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.age) {
      return; // Basic validation
    }
    onNext({ ...formData, relationship, ...additionalData });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col flex-1 p-5"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Patient Details</h2>
        <p className="text-sm text-gray-500 font-medium">Who is this appointment for?</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Relationship Toggle */}
        <div className="bg-gray-100 p-1 rounded-2xl flex border border-gray-200">
          <button
            type="button"
            onClick={() => setRelationship('Self')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              relationship === 'Self'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-4 h-4" />
            Self
          </button>
          <button
            type="button"
            onClick={() => setRelationship('Family Member')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              relationship === 'Family Member'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4" />
            Family Member
          </button>
        </div>

        <div className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-gray-700 uppercase tracking-widest flex items-center gap-1.5 pl-1">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter full name"
              className="w-full p-4 bg-white border-2 border-gray-100 focus:border-blue-500 rounded-2xl text-sm font-bold outline-none transition-all shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Age */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-gray-700 uppercase tracking-widest flex items-center gap-1.5 pl-1">
                Age
              </label>
              <input
                type="number"
                name="age"
                required
                value={formData.age}
                onChange={handleInputChange}
                placeholder="Years"
                className="w-full p-4 bg-white border-2 border-gray-100 focus:border-blue-500 rounded-2xl text-sm font-bold outline-none transition-all shadow-sm"
              />
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-gray-700 uppercase tracking-widest flex items-center gap-1.5 pl-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full p-4 bg-white border-2 border-gray-100 focus:border-blue-500 rounded-2xl text-sm font-bold outline-none appearance-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-gray-700 uppercase tracking-widest flex items-center gap-1.5 pl-1">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+91 00000 00000"
                className="w-full p-4 bg-white border-2 border-gray-100 focus:border-blue-500 rounded-2xl text-sm font-bold outline-none transition-all shadow-sm"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100"
              >
                Send OTP
              </button>
            </div>
          </div>

          {/* Symptoms */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-gray-700 uppercase tracking-widest flex items-center gap-1.5 pl-1">
              Symptoms / Reason for Visit
            </label>
            <textarea
              name="symptoms"
              rows={3}
              value={formData.symptoms}
              onChange={handleInputChange}
              placeholder="Briefly describe why you are visiting today..."
              className="w-full p-4 bg-white border-2 border-gray-100 focus:border-blue-500 rounded-2xl text-sm font-bold outline-none transition-all shadow-sm resize-none"
            />
          </div>
        </div>

        {/* Optional Toggle */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowAdditional(!showAdditional)}
            className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors pl-1"
          >
            <ShieldCheck className="w-4 h-4" />
            {showAdditional ? 'Hide' : 'Add'} ID / Insurance / Address
            <ChevronDown className={`w-3 h-3 transition-transform ${showAdditional ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showAdditional && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-4 pt-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Aadhaar / ID Number</label>
                    <input
                      type="text"
                      name="idNumber"
                      value={additionalData.idNumber}
                      onChange={handleAdditionalChange}
                      placeholder="XXXX-XXXX-XXXX"
                      className="w-full p-3.5 bg-gray-50 border-2 border-gray-100 focus:border-blue-500 rounded-2xl text-sm font-bold outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Insurance Provider</label>
                    <input
                      type="text"
                      name="insuranceProvider"
                      value={additionalData.insuranceProvider}
                      onChange={handleAdditionalChange}
                      placeholder="e.g. LIC, Star Health"
                      className="w-full p-3.5 bg-gray-50 border-2 border-gray-100 focus:border-blue-500 rounded-2xl text-sm font-bold outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Address</label>
                    <textarea
                      name="address"
                      rows={2}
                      value={additionalData.address}
                      onChange={handleAdditionalChange}
                      placeholder="Your full address..."
                      className="w-full p-3.5 bg-gray-50 border-2 border-gray-100 focus:border-blue-500 rounded-2xl text-sm font-bold outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CTA */}
        <div className="pt-4 flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase tracking-wider text-sm active:scale-[0.98] transition-transform"
          >
            Back
          </button>
          <button
            type="submit"
            className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-wider text-sm shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-transform"
          >
            Next: Select Slot
          </button>
        </div>
      </form>
    </motion.div>
  );
};
