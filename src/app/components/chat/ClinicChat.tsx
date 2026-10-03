import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Send, User, Building2, 
  CheckCheck, MessageSquare 
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'clinic';
  timestamp: string;
}

interface ClinicChatProps {
  isOpen: boolean;
  onClose: () => void;
  clinicName: string;
}

export const ClinicChat: React.FC<ClinicChatProps> = ({ isOpen, onClose, clinicName }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hello! This is ${clinicName} reception. How can we help you today?`,
      sender: 'clinic',
      timestamp: '10:00 AM'
    }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate clinic reply
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thank you for your message. A staff member will get back to you shortly.",
        sender: 'clinic',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[400]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-white z-[401] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-blue-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-sm">{clinicName}</h3>
                  <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Online
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center hover:bg-black/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/50">
              {messages.map((m) => (
                <div 
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm font-medium shadow-sm ${
                    m.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                  }`}>
                    {m.text}
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[9px] font-bold text-gray-400">{m.timestamp}</span>
                    {m.sender === 'user' && <CheckCheck className="w-3 h-3 text-blue-500" />}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <form 
              onSubmit={handleSend}
              className="p-4 bg-white border-t border-gray-100 flex items-center gap-2"
            >
              <input
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400"
              />
              <button 
                type="submit"
                disabled={!inputText.trim()}
                className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 active:scale-90 disabled:opacity-50 disabled:active:scale-100 transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
