import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Pill, FileText, Upload, ChevronDown, ChevronUp,
  Download, Share2, Stethoscope, Calendar, Building2,
  CheckCircle2, AlertTriangle, Clock
} from 'lucide-react';
import { MOCK_PRESCRIPTIONS, MOCK_REPORTS } from '../constants/mockData';
import { toast } from 'sonner';
import { PharmacyPickerSheet } from '../components/records/PharmacyPickerSheet';
import { PartnerPharmacy } from '../constants/fulfillmentData';
import { ShoppingBag, ChevronRight as ChevronRightIcon } from 'lucide-react';

type Tab = 'prescriptions' | 'reports' | 'uploads';

export const MedicalRecords = () => {
  const [activeTab, setActiveTab] = useState<Tab>('prescriptions');
  const [expandedRx, setExpandedRx] = useState<string | null>(null);
  const [expandedLab, setExpandedLab] = useState<string | null>(null);
  const [selectedRx, setSelectedRx] = useState<string | null>(null);
  const [sentRx, setSentRx] = useState<Record<string, string>>({}); // rxId -> pharmacyName
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handlePharmacySelect = (pharmacy: PartnerPharmacy) => {
    if (!selectedRx) return;
    
    // Simulate API call
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: `Sending prescription to ${pharmacy.name}...`,
        success: () => {
          setSentRx(prev => ({ ...prev, [selectedRx]: pharmacy.name }));
          setIsPickerOpen(false);
          setSelectedRx(null);
          return `Prescription successfully sent to ${pharmacy.name}`;
        },
        error: 'Failed to send prescription. Please try again.',
      }
    );
  };

  const tabs = [
    { key: 'prescriptions' as Tab, label: 'Rx', icon: Pill },
    { key: 'reports' as Tab, label: 'Reports', icon: FileText },
    { key: 'uploads' as Tab, label: 'Uploads', icon: Upload },
  ];

  return (
    <div className="flex flex-col flex-1 bg-gray-50 pb-6">
      <div className="bg-white px-5 pt-5 pb-2 border-b border-gray-100">
        <h2 className="text-2xl font-black text-gray-900">Medical Records</h2>
        <p className="text-sm font-medium text-gray-500 mt-0.5 mb-4">Prescriptions, lab reports & uploads</p>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 py-2.5 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeTab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait">
          {/* ── PRESCRIPTIONS ── */}
          {activeTab === 'prescriptions' && (
            <motion.div key="rx" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              {MOCK_PRESCRIPTIONS.map((rx, i) => {
                const expanded = expandedRx === rx.id;
                const isSent = !!sentRx[rx.id];
                return (
                  <motion.div
                    key={rx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedRx(expanded ? null : rx.id)}
                      className="w-full p-4 flex items-center gap-3 text-left"
                    >
                      <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                        <Stethoscope className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{rx.diagnosis}</p>
                        <p className="text-xs text-gray-500 font-medium">{rx.doctorName} • {rx.department}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {rx.date}
                          </span>
                          <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">
                            {rx.medicines.length} medicines
                          </span>
                        </div>
                      </div>
                      {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                    </button>

                    <AnimatePresence>
                      {isSent && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="bg-green-50 border-t border-green-100 px-4 py-2 flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                          <p className="text-[10px] font-black text-green-700 uppercase tracking-wider">
                            Sent to: {sentRx[rx.id]}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Medicines</p>
                            <div className="space-y-2 mb-3">
                              {rx.medicines.map((med, mi) => (
                                <div key={mi} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                  <p className="font-bold text-gray-900 text-sm">{med.name}</p>
                                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                                    <span className="text-[11px] text-gray-500 font-medium">💊 {med.dosage}</span>
                                    <span className="text-[11px] text-gray-500 font-medium">📅 {med.duration}</span>
                                    <span className="text-[11px] text-gray-500 font-medium">⏰ {med.timing}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {rx.notes && (
                              <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100 mb-3">
                                <p className="text-xs text-yellow-800 font-medium">📝 {rx.notes}</p>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedRx(rx.id);
                                  setIsPickerOpen(true);
                                }}
                                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20 active:scale-95"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" /> Buy Medicine
                              </button>
                              <button
                                onClick={() => toast.success('Downloading prescription PDF...')}
                                className="flex-1 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-blue-100 active:scale-95"
                              >
                                <Download className="w-3.5 h-3.5" /> PDF
                              </button>
                              <button
                                onClick={() => toast.success('Sharing via WhatsApp...')}
                                className="flex-1 py-2.5 bg-green-50 text-green-600 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-green-100 active:scale-95"
                              >
                                <Share2 className="w-3.5 h-3.5" /> Share
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* ── LAB REPORTS ── */}
          {activeTab === 'reports' && (
            <motion.div key="labs" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              {MOCK_REPORTS.map((report, i) => {
                const expanded = expandedLab === report.id;
                const resultColor = report.result === 'Normal'
                  ? 'bg-green-50 text-green-600 border-green-100'
                  : report.result === 'Borderline'
                  ? 'bg-yellow-50 text-yellow-600 border-yellow-100'
                  : 'bg-red-50 text-red-600 border-red-100';
                const ResultIcon = report.result === 'Normal' ? CheckCircle2 : report.result === 'Borderline' ? Clock : AlertTriangle;

                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedLab(expanded ? null : report.id)}
                      className="w-full p-4 flex items-center gap-3 text-left"
                    >
                      <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-purple-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{report.testName}</p>
                        <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {report.hospitalName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-gray-400">{report.date}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${resultColor}`}>
                            <ResultIcon className="w-3 h-3" /> {report.result}
                          </span>
                        </div>
                      </div>
                      {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                    </button>

                    <AnimatePresence>
                      {expanded && report.values && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                            <div className="rounded-xl border border-gray-200 overflow-hidden mb-3">
                              <div className="grid grid-cols-4 bg-gray-50 px-3 py-2 text-[9px] font-black text-gray-500 uppercase tracking-wider">
                                <span>Parameter</span>
                                <span className="text-center">Value</span>
                                <span className="text-center">Range</span>
                                <span className="text-right">Status</span>
                              </div>
                              {report.values.map((v, vi) => (
                                <div key={vi} className="grid grid-cols-4 items-center px-3 py-2.5 border-t border-gray-100 text-xs">
                                  <span className="font-bold text-gray-800">{v.parameter}</span>
                                  <span className="text-center font-medium text-gray-700">{v.value}</span>
                                  <span className="text-center text-gray-400 font-medium">{v.range}</span>
                                  <div className="flex justify-end">
                                    <span className={`font-black text-[10px] px-2 py-0.5 rounded ${
                                      v.status === 'normal' ? 'bg-green-50 text-green-600' :
                                      v.status === 'high' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'
                                    }`}>
                                      {v.status === 'normal' ? '✓' : v.status === 'high' ? '↑ High' : '↓ Low'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => toast.success('Downloading report PDF...')}
                                className="flex-1 py-2.5 bg-purple-50 text-purple-600 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-purple-100 active:scale-95"
                              >
                                <Download className="w-3.5 h-3.5" /> Download
                              </button>
                              <button
                                onClick={() => toast.success('Sharing report...')}
                                className="flex-1 py-2.5 bg-green-50 text-green-600 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-green-100 active:scale-95"
                              >
                                <Share2 className="w-3.5 h-3.5" /> Share
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* ── UPLOADS ── */}
          {activeTab === 'uploads' && (
            <motion.div key="uploads" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <div
                onClick={() => toast.info('Upload feature coming soon! In the pilot, records are auto-imported from partner hospitals.')}
                className="bg-white rounded-3xl border-2 border-dashed border-gray-300 p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all active:scale-[0.98] mt-2"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-1">Upload Document</h3>
                <p className="text-xs text-gray-500 font-medium text-center leading-relaxed max-w-xs">
                  Tap to upload prescriptions, lab reports, X-rays, or any medical documents. Supported: PDF, JPG, PNG
                </p>
                <div className="mt-4 flex gap-2">
                  {['PDF', 'JPG', 'PNG'].map(fmt => (
                    <span key={fmt} className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-lg">{fmt}</span>
                  ))}
                </div>
              </div>

              <div className="mt-5 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-xs font-bold text-blue-700 mb-1">📋 Auto-Import Enabled</p>
                <p className="text-xs text-blue-600 font-medium leading-relaxed">
                  Records from NMMC Hospital Airoli and Lifeline Hospital are automatically imported when you visit. No manual upload needed for partner hospitals.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <PharmacyPickerSheet 
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handlePharmacySelect}
      />
    </div>
  );
};
