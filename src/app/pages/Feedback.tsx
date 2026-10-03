import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ChevronRight, CheckCircle2, MessageSquare, Eye, EyeOff } from 'lucide-react';
import { MOCK_HOSPITALS } from '../constants/mockData';
import { toast } from 'sonner';

const FEEDBACK_TAGS = [
  'Short Wait', 'Polite Staff', 'Clean Facility', 'Good Doctor',
  'Fast Response', 'Helpful Nurses', 'Easy Parking', 'Modern Equipment',
];

export const Feedback = () => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(MOCK_HOSPITALS[0].id);
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }
    setSubmitted(true);
    toast.success('Thank you for your feedback! 🎉');
  };

  if (submitted) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-8 bg-white">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-black text-gray-900 mb-2"
        >
          Thank You! 🎉
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-500 text-sm font-medium text-center mb-2 max-w-xs"
        >
          Your feedback helps us improve healthcare services in Airoli.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-1 mb-8"
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-6 h-6 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full space-y-3"
        >
          <button
            onClick={() => navigate('/home')}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-wider shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-transform"
          >
            Back to Home
          </button>
          <button
            onClick={() => { setSubmitted(false); setRating(0); setSelectedTags([]); setText(''); }}
            className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold uppercase tracking-wider active:scale-[0.98] transition-transform"
          >
            Submit Another
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-gray-50 pb-6">
      <div className="bg-white px-5 pt-5 pb-4 border-b border-gray-100">
        <h2 className="text-2xl font-black text-gray-900">Rate Your Visit</h2>
        <p className="text-sm font-medium text-gray-500 mt-0.5">Help us improve healthcare in Airoli</p>
      </div>

      <div className="p-5 space-y-6">
        {/* Hospital select */}
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Hospital</label>
          <select
            value={selectedHospital}
            onChange={e => setSelectedHospital(e.target.value)}
            className="w-full p-4 bg-white border-2 border-gray-200 focus:border-blue-500 rounded-2xl text-gray-900 appearance-none font-medium transition-colors shadow-sm outline-none"
          >
            {MOCK_HOSPITALS.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>

        {/* Star rating */}
        <div>
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1 mb-3 block">
            Overall Rating
          </label>
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col items-center">
            <div className="flex items-center gap-2 mb-3">
              {Array.from({ length: 5 }).map((_, i) => {
                const starIndex = i + 1;
                const active = starIndex <= (hoverRating || rating);
                return (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 1.3, rotate: 15 }}
                    onMouseEnter={() => setHoverRating(starIndex)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(starIndex)}
                    className="p-1"
                  >
                    <Star className={`w-10 h-10 transition-colors ${active ? 'text-yellow-400 fill-current drop-shadow-lg' : 'text-gray-200'}`} />
                  </motion.button>
                );
              })}
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={hoverRating || rating}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm font-black text-gray-600"
              >
                {(hoverRating || rating) === 0 && 'Tap a star to rate'}
                {(hoverRating || rating) === 1 && '😞 Poor'}
                {(hoverRating || rating) === 2 && '😐 Below Average'}
                {(hoverRating || rating) === 3 && '🙂 Average'}
                {(hoverRating || rating) === 4 && '😊 Good'}
                {(hoverRating || rating) === 5 && '🤩 Excellent!'}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1 mb-3 block">
            What went well? (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {FEEDBACK_TAGS.map(tag => {
              const selected = selectedTags.includes(tag);
              return (
                <motion.button
                  key={tag}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border-2 ${
                    selected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {tag}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Text review */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Your Review (optional)
            </label>
            <span className={`text-[10px] font-bold ${text.length > 280 ? 'text-red-500' : 'text-gray-400'}`}>
              {text.length}/300
            </span>
          </div>
          <textarea
            value={text}
            onChange={e => e.target.value.length <= 300 && setText(e.target.value)}
            placeholder="Share your experience... (e.g. The doctor was very thorough and the wait time was reasonable)"
            className="w-full p-4 bg-white border-2 border-gray-200 focus:border-blue-500 rounded-2xl text-gray-900 placeholder-gray-400 font-medium text-sm resize-none h-28 outline-none transition-colors shadow-sm"
          />
        </div>

        {/* Anonymous toggle */}
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            {anonymous ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-blue-500" />}
            <div>
              <p className="font-bold text-gray-900 text-sm">Submit Anonymously</p>
              <p className="text-xs text-gray-500 font-medium">Your name won't be shown</p>
            </div>
          </div>
          <button
            onClick={() => setAnonymous(!anonymous)}
            className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${anonymous ? 'bg-blue-500' : 'bg-gray-300'}`}
          >
            <motion.div
              animate={{ x: anonymous ? 26 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md"
            />
          </button>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-base shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform uppercase tracking-wider"
        >
          <CheckCircle2 className="w-5 h-5" /> Submit Feedback
        </button>
      </div>
    </div>
  );
};
