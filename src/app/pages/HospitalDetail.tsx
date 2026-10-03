import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Star, MapPin, Phone, Calendar, Clock, CheckCircle2,
  ChevronRight, Building2, User, Bed, Navigation, Stethoscope, Shield
} from 'lucide-react';
import { MOCK_HOSPITALS, MOCK_DOCTORS, MOCK_REVIEWS } from '../constants/mockData';
import { toast } from 'sonner';

export const HospitalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const hospital = MOCK_HOSPITALS.find(h => h.id === id);

  if (!hospital) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-8 bg-gray-50">
        <Building2 className="w-12 h-12 text-gray-300 mb-4" />
        <p className="font-bold text-gray-600 mb-2">Hospital not found</p>
        <button onClick={() => navigate(-1)} className="text-blue-600 font-bold text-sm">Go Back</button>
      </div>
    );
  }

  const doctors = MOCK_DOCTORS.filter(d => d.hospitalId === hospital.id);
  const reviews = MOCK_REVIEWS.filter(r => r.hospitalId === hospital.id);
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : hospital.rating;

  return (
    <div className="flex flex-col flex-1 bg-gray-50 pb-6">
      {/* Hero banner */}
      <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 px-5 pt-5 pb-6">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[20%] right-[10%] w-32 h-32 rounded-full bg-white blur-2xl" />
          <div className="absolute bottom-[10%] left-[5%] w-24 h-24 rounded-full bg-white blur-xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-black text-white leading-tight mb-1">{hospital.name}</h1>
              <div className="flex items-center gap-1.5 text-blue-200 text-xs font-medium">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{hospital.address}</span>
              </div>
            </div>
            {hospital.verified && (
              <div className="flex items-center gap-1 bg-green-500/20 text-green-300 text-[9px] font-black px-2 py-1 rounded-lg border border-green-400/30 shrink-0 ml-2">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white/10 backdrop-blur rounded-xl px-2 py-2.5 text-center border border-white/10">
              <p className="text-lg font-black text-white">{avgRating}</p>
              <p className="text-[9px] text-blue-200 font-bold">⭐ Rating</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-2 py-2.5 text-center border border-white/10">
              <p className="text-lg font-black text-white">{hospital.eta}</p>
              <p className="text-[9px] text-blue-200 font-bold">min ETA</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-2 py-2.5 text-center border border-white/10">
              <p className="text-lg font-black text-white">{hospital.beds}</p>
              <p className="text-[9px] text-blue-200 font-bold">Beds</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-2 py-2.5 text-center border border-white/10">
              <p className="text-lg font-black text-white">{hospital.distance}</p>
              <p className="text-[9px] text-blue-200 font-bold">km away</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-5 -mt-4 relative z-20 grid grid-cols-3 gap-2">
        <button
          onClick={() => navigate('/appointments')}
          className="bg-white rounded-2xl p-3 shadow-lg border border-gray-100 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
        >
          <Calendar className="w-5 h-5 text-blue-600" />
          <span className="text-[10px] font-black text-gray-700 uppercase tracking-wider">Book</span>
        </button>
        <button
          onClick={() => { window.location.href = `tel:${hospital.phone}`; toast.info(`Calling ${hospital.shortName}...`); }}
          className="bg-white rounded-2xl p-3 shadow-lg border border-gray-100 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
        >
          <Phone className="w-5 h-5 text-green-600" />
          <span className="text-[10px] font-black text-gray-700 uppercase tracking-wider">Call</span>
        </button>
        <button
          onClick={() => { window.open(`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`, '_blank'); }}
          className="bg-white rounded-2xl p-3 shadow-lg border border-gray-100 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
        >
          <Navigation className="w-5 h-5 text-red-500" />
          <span className="text-[10px] font-black text-gray-700 uppercase tracking-wider">Navigate</span>
        </button>
      </div>

      <div className="px-5 pt-5 space-y-5">
        {/* Google Map Location */}
        <div>
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 pl-1">Location</h3>
          <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-sm overflow-hidden">
            <iframe
              title="Hospital Location"
              width="100%"
              height="200"
              style={{ border: 0, borderRadius: '0.75rem' }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${hospital.lat},${hospital.lng}&z=15&output=embed`}
            />
          </div>
        </div>

        {/* Services badges */}
        <div>
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 pl-1">Services & Features</h3>
          <div className="flex flex-wrap gap-2">
            {hospital.emergency && (
              <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100">🚨 24/7 Emergency</span>
            )}
            {hospital.ambulance && (
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">🚑 Ambulance</span>
            )}
            <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100">
              <Shield className="w-3 h-3 inline mr-1" />Verified
            </span>
          </div>
        </div>

        {/* Departments */}
        <div>
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 pl-1">Departments</h3>
          <div className="flex flex-wrap gap-2">
            {hospital.departments.map(dept => (
              <span key={dept} className="text-xs font-bold text-gray-700 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm">
                {dept}
              </span>
            ))}
          </div>
        </div>

        {/* Doctors */}
        {doctors.length > 0 && (
          <div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 pl-1">Our Doctors</h3>
            <div className="space-y-2">
              {doctors.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3"
                >
                  <div className="w-11 h-11 bg-indigo-50 rounded-full flex items-center justify-center shrink-0 border border-indigo-100">
                    <User className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">{doc.name}</p>
                    <p className="text-xs text-gray-500 font-medium">{doc.qualification} • {doc.experience} yrs</p>
                    <p className="text-[11px] text-indigo-500 font-bold mt-0.5">{doc.department}</p>
                  </div>
                  <button
                    onClick={() => navigate('/appointments')}
                    className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-100 active:scale-95 shrink-0"
                  >
                    Book
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" /> Patient Reviews
            </h3>
            <span className="text-xs font-bold text-gray-500">{reviews.length} reviews</span>
          </div>
          <div className="space-y-3">
            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-black text-gray-500">
                      {review.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{review.name}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star key={si} className={`w-3 h-3 ${si < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-600 font-medium leading-relaxed mb-2">{review.text}</p>
                <div className="flex flex-wrap gap-1.5">
                  {review.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-lg border border-green-100">{tag}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Book CTA */}
        <button
          onClick={() => navigate('/appointments')}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-base shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform uppercase tracking-wider"
        >
          <Calendar className="w-5 h-5" /> Book Appointment Here
        </button>
      </div>
    </div>
  );
};
