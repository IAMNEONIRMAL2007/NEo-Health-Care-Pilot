import mongoose from 'mongoose';

const healthcareProviderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['HOSPITAL', 'CLINIC', 'PHARMACY', 'AMBULANCE'], required: true },
  emergencyServices: { type: Boolean, default: false },
  specialties: [{ type: String }],
  phone: { type: String },
  source: { type: String },
  lastVerifiedAt: { type: Date },
  
  // Structured Address
  address: {
    street: String,
    locality: String,
    city: String,
    district: String,
    state: String,
    pincode: String,
    fullText: String
  },

  // GeoJSON Point for 2dsphere indexing
  location: {
    type: {
      type: String, 
      enum: ['Point'], 
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
}, { timestamps: true });

// Ensure the 2dsphere index exists for fast geospatial queries
healthcareProviderSchema.index({ location: "2dsphere" });
healthcareProviderSchema.index({ type: 1 });
healthcareProviderSchema.index({ 'address.state': 1, 'address.city': 1 });

export const HealthcareProvider = mongoose.model('HealthcareProvider', healthcareProviderSchema);
