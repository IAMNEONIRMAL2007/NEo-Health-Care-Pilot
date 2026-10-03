import mongoose from 'mongoose';

const emergencySessionSchema = new mongoose.Schema({
  patientId: { type: String, default: 'guest' }, // In a real app, authenticated user ID
  hospitalId: { type: String, required: false },
  ambulanceId: { type: String, required: false },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'RESOLVED'], 
    default: 'ACTIVE' 
  },
  // GeoJSON Point for the patient's live location
  location: {
    type: {
      type: String, 
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  createdAt: { type: Date, default: Date.now, expires: '2h' } // Auto-delete after 2 hours (Privacy trigger)
});

// For fast querying by hospital or ambulance if they want to monitor active cases
emergencySessionSchema.index({ hospitalId: 1, status: 1 });
emergencySessionSchema.index({ ambulanceId: 1, status: 1 });

export const EmergencySession = mongoose.model('EmergencySession', emergencySessionSchema);
