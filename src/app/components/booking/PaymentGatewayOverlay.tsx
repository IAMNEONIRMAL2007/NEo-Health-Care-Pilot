import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Wallet, ShieldCheck, CheckCircle2, Lock, ArrowRight, Loader2, Copy, Check, ArrowLeft, QrCode } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentGatewayOverlayProps {
  amount: number;
  onSuccess: (
    method: 'Online' | 'Cash',
    status: 'Success' | 'PayAtClinic',
    paymentDetails?: { gateway: string; transactionId: string }
  ) => void;
  onCancel: () => void;
}

type PaymentStep = 'selection' | 'online_choice' | 'upi_qr' | 'processing' | 'success';

// Dynamically inject Razorpay Checkout script
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const PaymentGatewayOverlay: React.FC<PaymentGatewayOverlayProps> = ({ amount, onSuccess, onCancel }) => {
  const [step, setStep] = useState<PaymentStep>('selection');
  const [utr, setUtr] = useState('');
  const [copied, setCopied] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<{ gateway: string; transactionId: string } | undefined>(undefined);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('7559489540@ptsbi');
    setCopied(true);
    toast.success('UPI ID copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaymentChoice = (method: 'Online' | 'Cash') => {
    if (method === 'Online') {
      setStep('online_choice');
    } else {
      // Direct success for Pay at Clinic
      onSuccess('Cash', 'PayAtClinic');
    }
  };

  // Trigger Razorpay payment gateway
  const handleRazorpayPayment = async () => {
    setStep('processing');
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error('Failed to load Razorpay SDK. Directing to UPI QR transfer...');
      setStep('upi_qr');
      return;
    }

    const options = {
      key: 'rzp_test_SzPlmWhiTOZN04',
      amount: amount * 100, // paise
      currency: 'INR',
      name: 'Airoli Care Connect',
      description: 'Consultation Token Booking Fee',
      image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=128&q=80',
      handler: function (response: any) {
        const details = {
          gateway: 'Razorpay',
          transactionId: response.razorpay_payment_id,
        };
        setTransactionDetails(details);
        setStep('success');
      },
      prefill: {
        name: 'Rohan Deshmukh',
        email: 'rohan.deshmukh@gmail.com',
        contact: '9876543210',
      },
      notes: {
        address: 'Sector 8, Airoli, Navi Mumbai',
        upi_payee: '7559489540@ptsbi',
      },
      theme: {
        color: '#2563EB', // blue-600
      },
      modal: {
        ondismiss: function () {
          toast.warning('Payment popup closed.');
          setStep('online_choice');
        },
      },
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      toast.error('Razorpay initialization failed. Directing to UPI QR...');
      setStep('upi_qr');
    }
  };

  // Submit direct UPI UTR number
  const handleUpiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (utr.trim().length !== 12 || !/^\d+$/.test(utr)) {
      toast.error('Please enter a valid 12-digit UTR Transaction ID.');
      return;
    }

    const details = {
      gateway: 'Direct UPI',
      transactionId: `UTR-${utr}`,
    };
    setTransactionDetails(details);
    setStep('success');
  };

  // Success state completion delay
  useEffect(() => {
    if (step === 'success' && transactionDetails) {
      const timer = setTimeout(() => {
        onSuccess('Online', 'Success', transactionDetails);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, onSuccess, transactionDetails]);

  // QR code image URL pointing to the user's customized UPI destination
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    `upi://pay?pa=7559489540@ptsbi&pn=Airoli Care Connect&am=${amount}&cu=INR`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm"
        onClick={step === 'selection' || step === 'online_choice' ? onCancel : undefined}
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-sm bg-white rounded-[2.5rem] overflow-hidden shadow-2xl z-10"
      >
        <AnimatePresence mode="wait">
          {step === 'selection' && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Amount</p>
                  <p className="text-2xl font-black text-gray-900">₹{amount}</p>
                </div>
              </div>

              <h3 className="text-xl font-black text-gray-900 mb-2">Payment Choice</h3>
              <p className="text-sm text-gray-500 font-medium mb-8">Select how you'd like to pay for your consultation.</p>

              <div className="space-y-3">
                <button
                  onClick={() => handlePaymentChoice('Online')}
                  className="w-full p-5 bg-blue-600 font-black text-white rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all shadow-lg shadow-blue-600/25"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm">Pay Online Now</p>
                      <p className="text-[10px] text-blue-100 font-bold uppercase tracking-tight">Secure UPI / Card</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => handlePaymentChoice('Cash')}
                  className="w-full p-5 bg-gray-50 border-2 border-gray-100 hover:border-blue-200 font-black text-gray-900 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm">Pay at Clinic</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Cash / Card on Arrival</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-gray-400" />
                </button>
              </div>

              <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <Lock className="w-3 h-3" />
                256-bit Secure Encryption
              </div>
            </motion.div>
          )}

          {step === 'online_choice' && (
            <motion.div
              key="online_choice"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-8"
            >
              <div className="flex items-center gap-2 mb-6">
                <button
                  onClick={() => setStep('selection')}
                  className="p-1 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-black text-gray-900">Select Gateway</h3>
              </div>

              <p className="text-sm text-gray-500 font-medium mb-6">Choose an online gateway to complete your transaction.</p>

              <div className="space-y-3">
                {/* Razorpay Gateway */}
                <button
                  onClick={handleRazorpayPayment}
                  className="w-full p-4 bg-blue-50 border-2 border-blue-200 hover:bg-blue-100/50 font-black text-blue-900 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg">
                      R
                    </div>
                    <div className="text-left">
                      <p className="text-sm">Razorpay Checkout</p>
                      <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tight">Cards, Netbanking, UPI</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Direct UPI Gateway */}
                <button
                  onClick={() => setStep('upi_qr')}
                  className="w-full p-4 bg-orange-50 border-2 border-orange-200 hover:bg-orange-100/50 font-black text-orange-950 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm">Direct UPI QR Code</p>
                      <p className="text-[10px] text-orange-700 font-bold uppercase tracking-tight">7559489540@ptsbi</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-orange-500 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <Lock className="w-3 h-3" />
                Payments processed securely
              </div>
            </motion.div>
          )}

          {step === 'upi_qr' && (
            <motion.div
              key="upi_qr"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 flex flex-col items-center"
            >
              <div className="w-full flex items-center gap-2 mb-4">
                <button
                  onClick={() => setStep('online_choice')}
                  className="p-1 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h3 className="text-base font-black text-gray-900">Direct UPI Scan</h3>
              </div>

              {/* QR Code Canvas Frame */}
              <div className="bg-gray-50 border-2 border-gray-100 p-4 rounded-3xl mb-4 relative shadow-inner">
                <img
                  src={qrCodeUrl}
                  alt="UPI QR Code"
                  className="w-40 h-40 object-contain"
                  onError={(e) => {
                    // QR loading failed fallback
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="text-center mt-1 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                  Scan to Pay ₹{amount}
                </div>
              </div>

              {/* UPI ID Copy Field */}
              <div className="w-full flex items-center justify-between p-2.5 bg-gray-50 rounded-2xl border border-gray-200 mb-4">
                <div className="pl-1 text-left min-w-0">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">UPI ID Address</p>
                  <p className="text-xs font-bold text-gray-800 truncate select-all">7559489540@ptsbi</p>
                </div>
                <button
                  onClick={handleCopyUpi}
                  className="p-2 bg-white border border-gray-200 hover:border-blue-400 rounded-xl transition-colors shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
                </button>
              </div>

              {/* Transaction Ref (UTR) Submission Form */}
              <form onSubmit={handleUpiSubmit} className="w-full space-y-3">
                <div className="text-left">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider pl-1 block mb-1">
                    Enter 12-Digit UTR / Ref Number
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={12}
                    placeholder="e.g. 403982736152"
                    value={utr}
                    onChange={(e) => setUtr(e.target.value.replace(/\D/g, '').substring(0, 12))}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 focus:border-orange-500 rounded-2xl outline-none font-bold text-sm text-center tracking-widest text-gray-900 placeholder:tracking-normal transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={utr.length !== 12}
                  className="w-full py-3.5 bg-orange-600 disabled:bg-gray-100 disabled:text-gray-400 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md active:scale-95 disabled:active:scale-100"
                >
                  Verify & Book Token
                </button>
              </form>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-12 flex flex-col items-center justify-center text-center"
            >
              <div className="relative mb-8">
                <div className="w-24 h-24 border-4 border-blue-50 rounded-full" />
                <motion.div
                  className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-blue-600 animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Connecting Gateway</h3>
              <p className="text-sm text-gray-500 font-medium max-w-[200px]">Loading secure payments powered by Razorpay...</p>
            </motion.div>
          )}

          {step === 'success' && transactionDetails && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 flex flex-col items-center justify-center text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-8"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </motion.div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Payment Verified</h3>
              <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-widest">{transactionDetails.gateway} Ref</p>
              <p className="text-xs text-emerald-600 font-bold select-all bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl break-all">
                {transactionDetails.transactionId}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
