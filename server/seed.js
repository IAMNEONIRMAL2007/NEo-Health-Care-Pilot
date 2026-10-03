import mongoose from 'mongoose';
import { Hospital } from './models/Hospital.js';
import dotenv from 'dotenv';
dotenv.config();

// The connection string provided by the user
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://nirmalborole49_db_user:LmG9Bx2cB7UWlYit@cluster0.tquqf0z.mongodb.net/?appName=Cluster0";

// Standard mock hospitals used in the frontend converted to GeoJSON schema
const MOCK_HOSPITALS = [
  {
    name: 'NMMC Hospital Airoli',
    shortName: 'NMMC Airoli',
    rating: 4.6,
    reviewCount: 832,
    eta: 5,
    distance: '1.2',
    phone: '+912227688000',
    address: 'Sector 8, Airoli, Navi Mumbai 400708',
    emergency: true,
    departments: ['General Physician', 'Orthopedics', 'Pediatrics', 'Cardiology', 'ENT', 'Gynecology'],
    verified: true,
    beds: 200,
    ambulance: true,
    location: {
      type: 'Point',
      coordinates: [72.9974, 19.1497] // [lng, lat]
    }
  },
  {
    name: 'Lifeline Multi-Specialty Hospital',
    shortName: 'Lifeline Hospital',
    rating: 4.4,
    reviewCount: 524,
    eta: 8,
    distance: '2.4',
    phone: '+912227661234',
    address: 'Sector 15, Airoli, Navi Mumbai 400708',
    emergency: true,
    departments: ['General Physician', 'Pediatrics', 'Orthopedics', 'Neurology', 'Dermatology'],
    verified: true,
    beds: 150,
    ambulance: true,
    location: {
      type: 'Point',
      coordinates: [73.0031, 19.1563]
    }
  },
  {
    name: 'Thane Civil Hospital',
    shortName: 'Thane Civil',
    rating: 4.1,
    reviewCount: 1204,
    eta: 12,
    distance: '3.8',
    phone: '+912225342181',
    address: 'Sector 5, Kopar Khairane, Navi Mumbai 400709',
    emergency: true,
    departments: ['General Physician', 'Surgery', 'Pediatrics', 'Orthopedics', 'Ophthalmology', 'ENT'],
    verified: true,
    beds: 500,
    ambulance: true,
    location: {
      type: 'Point',
      coordinates: [72.9800, 19.1400]
    }
  },
  {
    name: 'Sunrise Care Clinic',
    shortName: 'Sunrise Clinic',
    rating: 4.0,
    reviewCount: 189,
    eta: 15,
    distance: '4.5',
    phone: '+919821001234',
    address: 'Sector 19, Airoli, Navi Mumbai 400708',
    emergency: false,
    departments: ['General Physician', 'Pediatrics', 'Gynecology', 'Dermatology'],
    verified: true,
    beds: 40,
    ambulance: false,
    location: {
      type: 'Point',
      coordinates: [72.9955, 19.1553]
    }
  },
  {
    name: 'MGM Hospital Vashi',
    shortName: 'MGM Vashi',
    rating: 4.7,
    reviewCount: 2103,
    eta: 22,
    distance: '8.1',
    phone: '+912227564900',
    address: 'Sector 1A, Vashi, Navi Mumbai 400703',
    emergency: true,
    departments: ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'Nephrology', 'General Physician', 'Gynecology'],
    verified: true,
    beds: 750,
    ambulance: true,
    location: {
      type: 'Point',
      coordinates: [73.0125, 19.0725]
    }
  }
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected");

    console.log("Clearing existing hospitals...");
    await Hospital.deleteMany({});
    
    console.log("Inserting mock hospitals...");
    await Hospital.insertMany(MOCK_HOSPITALS);
    
    console.log("✅ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seeding error:", error);
  } finally {
    mongoose.disconnect();
  }
}

seed();
