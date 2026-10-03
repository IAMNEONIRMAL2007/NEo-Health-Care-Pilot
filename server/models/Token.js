import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  deviceProfileId: { type: String, required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'HealthcareProvider' },
  tokenNumber: { type: String, required: true },
  status: { type: String, enum: ['active', 'missed', 'completed'], default: 'active' },
  appointmentTime: { type: Date },
}, { timestamps: true });

export const Token = mongoose.model('Token', tokenSchema);
