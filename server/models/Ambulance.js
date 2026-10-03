import mongoose from 'mongoose';

const ambulanceSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true },
  driverName: { type: String, required: true },
  phone: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['BLS', 'ALS', 'ICU'], 
    default: 'BLS' 
  }, // BLS = Basic Life Support, ALS = Advanced, ICU = Mobile ICU
  status: {
    type: String,
    enum: ['AVAILABLE', 'DISPATCHED', 'MAINTENANCE'],
    default: 'AVAILABLE'
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

ambulanceSchema.index({ location: "2dsphere" });

export const Ambulance = mongoose.model('Ambulance', ambulanceSchema);
