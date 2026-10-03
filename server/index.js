import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Hospital } from './models/Hospital.js';
import { Ambulance } from './models/Ambulance.js';
import { EmergencySession } from './models/EmergencySession.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Add this line to the .env file if it isn't there, or pass it directly.
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://nirmalborole49_db_user:LmG9Bx2cB7UWlYit@cluster0.tquqf0z.mongodb.net/?appName=Cluster0";

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
