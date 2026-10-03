import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Hospital } from './models/Hospital.js';

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
});
