import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Hospital } from './models/Hospital.js';
import { Ambulance } from './models/Ambulance.js';
import { EmergencySession } from './models/EmergencySession.js';
import { User } from './models/User.js';
import { HealthcareProvider } from './models/HealthcareProvider.js';
import { Token } from './models/Token.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Add this line to the .env file if it isn't there, or pass it directly.
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://nirmalborole49_db_user:LmG9Bx2cB7UWlYit@cluster0.tquqf0z.mongodb.net/?appName=Cluster0&compressors=zlib";

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// API Endpoint to find nearby emergency hospitals
app.get('/api/hospitals/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 20000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng are required query parameters' });
    }

    const maxDistanceMeters = parseInt(radius, 10);
    const longitude = parseFloat(lng);
    const latitude = parseFloat(lat);

    const hospitals = await Hospital.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [longitude, latitude] },
          distanceField: 'calculatedDistance', // Adds distance in meters to result
          maxDistance: maxDistanceMeters,
          query: { emergency: true },
          spherical: true
        }
      },
      {
        $limit: 15
      }
    ]);

    res.json({ success: true, count: hospitals.length, data: hospitals });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// NEW: API Endpoint to find any nearby healthcare provider (HOSPITAL, CLINIC, PHARMACY)
app.get('/api/healthcare/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 20000, type } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng are required query parameters' });
    }

    const maxDistanceMeters = parseInt(radius, 10);
    const longitude = parseFloat(lng);
    const latitude = parseFloat(lat);

    let matchQuery = {};
    if (type) {
      matchQuery.type = type.toUpperCase();
    }

    const providers = await HealthcareProvider.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [longitude, latitude] },
          distanceField: 'calculatedDistance', 
          maxDistance: maxDistanceMeters,
          query: matchQuery,
          spherical: true
        }
      },
      {
        $limit: 20
      }
    ]);

    res.json({ success: true, count: providers.length, data: providers });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// NEW: API Endpoint to create or get a device profile
app.post('/api/users/device-profile', async (req, res) => {
  try {
    const { deviceProfileId, displayName, language } = req.body;
    
    if (!deviceProfileId) {
       return res.status(400).json({ error: 'deviceProfileId is required' });
    }

    let user = await User.findOne({ deviceProfileId });
    
    if (user) {
      // Update existing
      user.lastActiveAt = new Date();
      if (displayName) user.displayName = displayName;
      if (language) user.language = language;
      await user.save();
    } else {
      // Create new
      if (!displayName) {
         return res.status(400).json({ error: 'displayName is required for new profiles' });
      }
      user = new User({
        deviceProfileId,
        displayName,
        language: language || 'en'
      });
      await user.save();
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET Healthcare Provider by ID
app.get('/api/healthcare/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await HealthcareProvider.findById(id);
    if (!provider) {
      return res.status(404).json({ success: false, error: 'Provider not found' });
    }
    res.json({ success: true, data: provider });
  } catch (err) {
    console.error('Error fetching healthcare provider by ID:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// API Endpoint to find nearby ambulances
app.get('/api/ambulances/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 20000, category } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng are required query parameters' });
    }

    const maxDistanceMeters = parseInt(radius, 10);
    const longitude = parseFloat(lng);
    const latitude = parseFloat(lat);
    
    let matchQuery = { status: 'AVAILABLE' };
    if (category) {
      matchQuery.category = category;
    }

    const ambulances = await Ambulance.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [longitude, latitude] },
          distanceField: 'calculatedDistance', 
          maxDistance: maxDistanceMeters,
          query: matchQuery,
          spherical: true
        }
      },
      {
        $limit: 10
      }
    ]);

    res.json({ success: true, count: ambulances.length, data: ambulances });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start an Emergency Session
app.post('/api/emergency/start', async (req, res) => {
  try {
    const { hospitalId, ambulanceId, lat, lng } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Initial lat and lng are required' });
    }

    const session = new EmergencySession({
      hospitalId,
      ambulanceId,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      }
    });

    await session.save();
    res.json({ success: true, sessionId: session._id });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Live Location
app.post('/api/emergency/:id/location', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const { id } = req.params;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng are required' });
    }

    const session = await EmergencySession.findByIdAndUpdate(id, {
      $set: {
        location: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        }
      }
    }, { new: true });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resolve Emergency
app.post('/api/emergency/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    
    const session = await EmergencySession.findByIdAndUpdate(id, {
      $set: { status: 'RESOLVED' }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
});
