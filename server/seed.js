import mongoose from 'mongoose';
import { HealthcareProvider } from './models/HealthcareProvider.js';
import { Ambulance } from './models/Ambulance.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://nirmalborole49_db_user:LmG9Bx2cB7UWlYit@cluster0.tquqf0z.mongodb.net/?appName=Cluster0";

const MOCK_PROVIDERS = [
  {
    name: 'NMMC Hospital Airoli',
    type: 'HOSPITAL',
    emergencyServices: true,
    specialties: ['General Physician', 'Orthopedics', 'Pediatrics', 'Cardiology', 'ENT', 'Gynecology'],
    phone: '+912227688000',
    source: 'SEED',
    address: {
      street: 'Sector 8',
      locality: 'Airoli',
      city: 'Navi Mumbai',
      district: 'Thane',
      state: 'Maharashtra',
      pincode: '400708',
      fullText: 'Sector 8, Airoli, Navi Mumbai 400708'
    },
    location: {
      type: 'Point',
      coordinates: [72.9974, 19.1497] // [lng, lat]
    },
    // Adding some extra properties mapped in the schema dynamically if needed
    rating: 4.6,
    reviewCount: 832,
    beds: 200,
    ambulance: true,
  },
  {
    name: 'Lifeline Multi-Specialty Hospital',
    type: 'HOSPITAL',
    emergencyServices: true,
    specialties: ['General Physician', 'Pediatrics', 'Orthopedics', 'Neurology', 'Dermatology'],
    phone: '+912227661234',
    source: 'SEED',
    address: {
      street: 'Sector 15',
      locality: 'Airoli',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      fullText: 'Sector 15, Airoli, Navi Mumbai 400708'
    },
    location: {
      type: 'Point',
      coordinates: [73.0031, 19.1563]
    },
    rating: 4.4,
    beds: 150
  },
  {
    name: 'Sunrise Care Clinic',
    type: 'CLINIC',
    emergencyServices: false,
    specialties: ['General Physician', 'Pediatrics'],
    phone: '+919821001234',
    source: 'SEED',
    address: {
      locality: 'Airoli',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      fullText: 'Sector 19, Airoli, Navi Mumbai'
    },
    location: {
      type: 'Point',
      coordinates: [72.9955, 19.1553]
    }
  },
  {
    name: 'Apollo Pharmacy Airoli',
    type: 'PHARMACY',
    emergencyServices: false,
    phone: '+919821009999',
    source: 'SEED',
    address: {
      locality: 'Airoli',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      fullText: 'Sector 3, Airoli'
    },
    location: {
      type: 'Point',
      coordinates: [72.9985, 19.1500]
    }
  },
  {
    name: 'Thane Civil Hospital',
    type: 'HOSPITAL',
    emergencyServices: true,
    specialties: ['General Physician', 'Surgery', 'Pediatrics', 'Orthopedics'],
    phone: '+912225342181',
    source: 'SEED',
    address: {
      locality: 'Thane West',
      city: 'Thane',
      state: 'Maharashtra',
      fullText: 'Thane West, Maharashtra'
    },
    location: {
      type: 'Point',
      coordinates: [72.9800, 19.1400]
    },
    beds: 500
  },
  {
    name: 'MGM Hospital Vashi',
    type: 'HOSPITAL',
    emergencyServices: true,
    specialties: ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics'],
    phone: '+912227564900',
    source: 'SEED',
    address: {
      locality: 'Vashi',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      fullText: 'Sector 1A, Vashi, Navi Mumbai'
    },
    location: {
      type: 'Point',
      coordinates: [73.0125, 19.0725]
    }
  }
];

const MOCK_AMBULANCES = [
  {
    vehicleNumber: 'MH43-AB-1234',
    driverName: 'Ramesh Kumar',
    phone: '+919876543210',
    category: 'ALS',
    status: 'AVAILABLE',
    location: { type: 'Point', coordinates: [72.9975, 19.1498] }
  },
  {
    vehicleNumber: 'MH04-XY-9876',
    driverName: 'Suresh Patil',
    phone: '+919876543211',
    category: 'ICU',
    status: 'AVAILABLE',
    location: { type: 'Point', coordinates: [73.0030, 19.1560] }
  },
  {
    vehicleNumber: 'MH43-MN-4567',
    driverName: 'Amit Singh',
    phone: '+919876543212',
    category: 'BLS',
    status: 'AVAILABLE',
    location: { type: 'Point', coordinates: [72.9805, 19.1405] }
  }
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected");

    console.log("Clearing existing HealthcareProvider and Ambulance data...");
    await HealthcareProvider.deleteMany({});
    await Ambulance.deleteMany({});
    
    console.log("Inserting mock healthcare providers...");
    await HealthcareProvider.insertMany(MOCK_PROVIDERS);
    
    console.log("Inserting mock ambulances...");
    await Ambulance.insertMany(MOCK_AMBULANCES);
    
    console.log("✅ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seeding error:", error);
  } finally {
    mongoose.disconnect();
  }
}

seed();
