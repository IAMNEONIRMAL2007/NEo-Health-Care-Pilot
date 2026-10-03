import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  shortName: { type: String },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  eta: { type: Number, default: 15 }, // Fallback mock eta
  distance: { type: String, default: "0.0" }, // Fallback mock distance
  phone: { type: String },
  address: { type: String },
  emergency: { type: Boolean, default: false },
  departments: [{ type: String }],
  verified: { type: Boolean, default: false },
  beds: { type: Number, default: 0 },
  ambulance: { type: Boolean, default: false },
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
hospitalSchema.index({ location: "2dsphere" });

export const Hospital = mongoose.model('Hospital', hospitalSchema);
