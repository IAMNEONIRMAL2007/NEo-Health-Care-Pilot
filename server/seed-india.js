import mongoose from 'mongoose';
import { Hospital } from './models/Hospital.js';
import { Ambulance } from './models/Ambulance.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://nirmalborole49_db_user:LmG9Bx2cB7UWlYit@cluster0.tquqf0z.mongodb.net/?appName=Cluster0";

// Bounding boxes for major Indian cities [minLng, minLat, maxLng, maxLat]
const CITIES = [
  { name: 'Mumbai', bbox: [72.8, 18.9, 73.1, 19.3] },
  { name: 'Bengaluru', bbox: [77.4, 12.8, 77.8, 13.2] },
  { name: 'Delhi', bbox: [76.8, 28.4, 77.3, 28.9] },
  { name: 'Chennai', bbox: [80.1, 12.9, 80.3, 13.2] },
  { name: 'Kolkata', bbox: [88.2, 22.4, 88.5, 22.7] },
  { name: 'Hyderabad', bbox: [78.3, 17.3, 78.6, 17.5] },
  { name: 'Pune', bbox: [73.7, 18.4, 74.0, 18.7] },
  { name: 'Ahmedabad', bbox: [72.4, 22.9, 72.7, 23.1] }
];

const HOSPITAL_PREFIXES = ['City', 'Global', 'National', 'Sunrise', 'Apollo', 'Fortis', 'Max', 'Lifeline', 'Care', 'Metro'];
const HOSPITAL_SUFFIXES = ['Hospital', 'Medical Center', 'Clinic', 'Care Center', 'Multispecialty'];

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function generateFacilities(numHospitals = 10000, numAmbulances = 2000) {
  const hospitals = [];
  const ambulances = [];

  console.log(`Generating ${numHospitals} hospitals and ${numAmbulances} ambulances across India...`);

  for (let i = 0; i < numHospitals; i++) {
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    const lng = randomInRange(city.bbox[0], city.bbox[2]);
    const lat = randomInRange(city.bbox[1], city.bbox[3]);
    
    const prefix = HOSPITAL_PREFIXES[Math.floor(Math.random() * HOSPITAL_PREFIXES.length)];
    const suffix = HOSPITAL_SUFFIXES[Math.floor(Math.random() * HOSPITAL_SUFFIXES.length)];
    const name = `${prefix} ${suffix} ${city.name} - ${i}`;

    hospitals.push({
      name,
      shortName: `${prefix} ${city.name}`,
      rating: Number(randomInRange(3.0, 5.0).toFixed(1)),
      reviewCount: Math.floor(randomInRange(10, 5000)),
      eta: Math.floor(randomInRange(5, 45)),
      distance: randomInRange(1, 15).toFixed(1),
      phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      address: `Random Street, ${city.name}`,
      emergency: Math.random() > 0.2, // 80% have emergency
      departments: ['General Physician', 'Pediatrics'],
      verified: true,
      beds: Math.floor(randomInRange(20, 1000)),
      ambulance: Math.random() > 0.3,
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      }
    });
  }

  const ambTypes = ['BLS', 'ALS', 'ICU', 'NEONATAL'];
  const ambStatuses = ['AVAILABLE', 'DISPATCHED', 'MAINTENANCE'];

  for (let i = 0; i < numAmbulances; i++) {
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    const lng = randomInRange(city.bbox[0], city.bbox[2]);
    const lat = randomInRange(city.bbox[1], city.bbox[3]);

    ambulances.push({
      vehicleNumber: `MH-${Math.floor(randomInRange(10, 50))}-${String.fromCharCode(65 + Math.floor(Math.random()*26))}-${Math.floor(randomInRange(1000, 9999))}`,
      driverName: `Driver ${i}`,
      phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      type: ambTypes[Math.floor(Math.random() * ambTypes.length)],
      status: ambStatuses[Math.floor(Math.random() * ambStatuses.length)],
      hospitalId: null, // Free roaming
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      }
    });
  }

  return { hospitals, ambulances };
}

async function seedIndia() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected');

    // Generate data
    const { hospitals, ambulances } = generateFacilities(10000, 5000);

    console.log('Clearing existing data...');
    await Hospital.deleteMany({});
    await Ambulance.deleteMany({});
    
    console.log(`Inserting ${hospitals.length} hospitals...`);
    // Insert in batches
    const batchSize = 1000;
    for (let i = 0; i < hospitals.length; i += batchSize) {
      await Hospital.insertMany(hospitals.slice(i, i + batchSize));
      process.stdout.write(`\rInserted ${Math.min(i + batchSize, hospitals.length)} hospitals`);
    }
    console.log('\n✅ Hospitals inserted');

    console.log(`Inserting ${ambulances.length} ambulances...`);
    for (let i = 0; i < ambulances.length; i += batchSize) {
      await Ambulance.insertMany(ambulances.slice(i, i + batchSize));
      process.stdout.write(`\rInserted ${Math.min(i + batchSize, ambulances.length)} ambulances`);
    }
    console.log('\n✅ Ambulances inserted');

    // Ensure Indexes are built
    console.log('Ensuring 2dsphere indexes are built...');
    await Hospital.syncIndexes();
    await Ambulance.syncIndexes();

    console.log('🎉 India-wide Scale Testing Database Seed Complete!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    mongoose.connection.close();
  }
}

seedIndia();
