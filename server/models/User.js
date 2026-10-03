import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  deviceProfileId: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  language: { type: String, default: 'en' },
  lastActiveAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
