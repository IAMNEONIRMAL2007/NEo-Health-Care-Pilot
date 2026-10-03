import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, MapPin, Star, Phone, 
  ShoppingBag, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { MOCK_PHARMACIES, PartnerPharmacy } from '../../constants/fulfillmentData';

interface PharmacyPickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pharmacy: PartnerPharmacy) => void;
}

export const PharmacyPickerSheet: React.FC<PharmacyPickerSheetProps> = ({ isOpen, onClose, onSelect }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[300]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-[32px] z-[301] shadow-2xl overflow-hidden pb-safe"
            style={{ maxHeight: '80vh' }}
          >
            <div className="p-1 flex flex-col items-center">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full my-3" />
            </div>

            <div className="px-6 pb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Select Pharmacy</h3>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5">Partnered fulfillment</p>
                </div>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 active:scale-90 transition-transform"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[50vh] pr-1">
                {MOCK_PHARMACIES.map((ph) => (
                  <button
                    key={ph.id}
                    disabled={!ph.open}
                    onClick={() => onSelect(ph)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-4 ${
                      ph.open 
                        ? 'bg-white border-gray-100 hover:border-blue-500 active:scale-[0.98]' 
                        : 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      ph.open ? 'bg-blue-50 text-blue-600' : 'bg-gray-200 text-gray-400'
                    }`}>
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-black text-gray-900 text-sm truncate">{ph.name}</p>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                          <span className="text-xs font-black text-gray-900">{ph.rating}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {ph.distance} • {ph.address}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider border ${
                          ph.stockLevel === 'High' ? 'bg-green-50 text-green-700 border-green-100' : 
                          ph.stockLevel === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 
                          'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          Stock: {ph.stockLevel}
                        </span>
                        {!ph.open && (
                          <span className="text-[9px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                            Closed
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 self-center" />
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <p className="text-[10px] text-gray-500 leading-tight font-medium">
                  Prescription data will be shared securely via end-to-end encrypted channel with the selected pharmacy.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
