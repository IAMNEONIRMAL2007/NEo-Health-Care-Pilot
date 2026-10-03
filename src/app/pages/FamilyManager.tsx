import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAppState } from '../contexts/AppStateContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserPlus, ChevronLeft, User, Phone, 
  Trash2, Plus, Check, ShieldCheck 
} from 'lucide-react';
import { toast } from 'sonner';

export const FamilyManager = () => {
  const navigate = useNavigate();
  const { familyMembers, addFamilyMember } = useAppState();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState<'Spouse' | 'Child' | 'Parent' | 'Other'>('Child');
  const [newAvatar, setNewAvatar] = useState('👤');

  const avatars = ['👨', '👩', '👦', '👧', '👵', '👴', '👶', '👤'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    addFamilyMember({
      name: newName,
      relationship: newRelation,
      avatar: newAvatar,
      phone: '',
      email: '',
      bloodGroup: 'Unknown',
    });

    setNewName('');
    setShowAdd(false);
    toast.success(`${newName} added to family!`);
  };

  return (
    <div className="flex flex-col flex-1 bg-gray-50 pb-20">
      <div className="bg-white px-5 pt-5 pb-4 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-black text-gray-900">Manage Family</h2>
      </div>

      <div className="p-5 space-y-4">
        {familyMembers.map((member) => (
          <motion.div 
            key={member.id}
            layout
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4"
          >
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-2xl border border-red-100">
              {member.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-gray-900 text-base">{member.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                  {member.relationship}
                </span>
                {member.abhaId && (
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> ABDM Linked
                  </span>
                )}
              </div>
            </div>
            <button className="w-9 h-9 text-gray-300 hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        ))}

        <AnimatePresence>
          {showAdd ? (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl p-6 border-2 border-dashed border-red-200 space-y-4"
            >
              <h3 className="font-black text-gray-900 text-center">Add Member</h3>
              
              <div className="flex justify-center gap-2 flex-wrap">
                {avatars.map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setNewAvatar(a)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                      newAvatar === a ? 'bg-red-500 scale-110 shadow-lg' : 'bg-gray-100'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <input
                  placeholder="Full Name"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-sm focus:border-red-500 transition-colors"
                />
                <select 
                  value={newRelation}
                  onChange={e => setNewRelation(e.target.value as any)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-sm focus:border-red-500 transition-colors"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Parent">Parent</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-black uppercase tracking-wider text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black uppercase tracking-wider text-xs shadow-lg shadow-red-600/20"
                >
                  Save Member
                </button>
              </div>
            </motion.form>
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              className="w-full py-5 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 font-bold flex flex-col items-center gap-2 hover:border-red-300 hover:text-red-400 transition-all"
            >
              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              Add New Family Member
            </button>
          )}
        </AnimatePresence>
      </div>

      <div className="px-5">
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            <p className="font-bold text-blue-700 text-sm">ABDM Compliance</p>
          </div>
          <p className="text-xs text-blue-600 leading-relaxed font-medium">
            Linking family members allows you to manage their health records centrally under the Ayushman Bharat Digital Mission (ABDM).
          </p>
        </div>
      </div>
    </div>
  );
};
