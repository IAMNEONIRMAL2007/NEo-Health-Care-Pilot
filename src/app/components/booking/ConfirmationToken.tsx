import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Download, Share2, MapPin, Calendar, Clock, User, Phone, Stethoscope, ChevronRight, Printer } from 'lucide-react';
import { Token } from '../../types/token';
import { format } from 'date-fns';

interface ConfirmationTokenProps {
  token: Token;
  onDone: () => void;
}

export const ConfirmationToken: React.FC<ConfirmationTokenProps> = ({ token, onDone }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col flex-1 p-6 bg-white"
    >
      <div className="flex flex-col items-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
          className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/10"
        >
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </motion.div>
        <h2 className="text-3xl font-black text-gray-900 mb-1 tracking-tight text-center">Booking Success!</h2>
        <p className="text-gray-500 text-sm font-medium text-center">Your token was issued & clinic notified</p>
      </div>

      {/* Main Token Card */}
      <div className="relative mb-8 group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
              token.paymentStatus === 'Success' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
            }`}>
              {token.paymentStatus === 'Success' ? 'Paid' : 'Pay at Clinic'}
            </div>
          </div>

          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 text-center">Your Smart Token</p>
          <p className="text-7xl font-black text-gray-900 text-center tracking-tighter mb-4 pr-2">
            {token.tokenNo}
          </p>

          <div className="space-y-4 pt-4 border-t border-dashed border-gray-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                   <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Appointment Time</p>
                  <p className="text-sm font-bold text-gray-900">{token.appointmentTime}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Est. Wait</p>
                <p className="text-sm font-black text-blue-600">~{token.waitTimeMinutes} mins</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                 <Stethoscope className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Doctor & Clinic</p>
                <p className="text-sm font-bold text-gray-900 leading-tight">{token.doctorName}</p>
                <p className="text-[11px] text-gray-500 font-medium">{token.hospitalName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Summary */}
      <div className="bg-gray-50 rounded-3xl p-5 mb-8 border border-gray-100">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <User className="w-3.5 h-3.5" /> Patient Summary
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm font-bold">
            <span className="text-gray-500">Name / Age</span>
            <span className="text-gray-900">{token.patientName} ({token.age})</span>
          </div>
          <div className="flex justify-between items-center text-sm font-bold">
            <span className="text-gray-500">Phone</span>
            <span className="text-gray-900">{token.phone}</span>
          </div>
          {token.symptoms && (
            <div className="pt-2 border-t border-gray-100">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter block mb-1">Chief Complaints</span>
              <p className="text-xs text-gray-800 font-medium italic">"{token.symptoms}"</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <button className="flex-1 flex items-center justify-center gap-2 py-3.5 border-2 border-gray-100 rounded-2xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" /> Save PDF
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-3.5 border-2 border-gray-100 rounded-2xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
          <Printer className="w-4 h-4" /> Print
        </button>
      </div>

      <div className="mt-auto space-y-3">
        <button
          onClick={onDone}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-wider text-sm shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
        >
          Track Live Status
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
        <p className="text-[10px] text-gray-400 font-bold text-center uppercase tracking-widest">
          Reminders scheduled via WhatsApp & SMS
        </p>
      </div>
    </motion.div>
  );
};
