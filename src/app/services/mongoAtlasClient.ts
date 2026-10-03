/**
 * MongoDB Atlas Data API Client
 * This allows the React frontend to securely execute queries against MongoDB Atlas 
 * without exposing raw connection strings or requiring a Node.js backend proxy.
 */

const DATA_API_URL = import.meta.env.VITE_MONGO_DATA_API_URL;
const DATA_API_KEY = import.meta.env.VITE_MONGO_DATA_API_KEY;
const CLUSTER_NAME = import.meta.env.VITE_MONGO_CLUSTER_NAME || 'Cluster0';
const DB_NAME = import.meta.env.VITE_MONGO_DB_NAME || 'neocare';

export const isMongoConfigured = Boolean(DATA_API_URL && DATA_API_KEY);

interface MongoRequestPayload {
  dataSource: string;
  database: string;
  collection: string;
  [key: string]: any;
}

/**
 * Execute a query against MongoDB Atlas Data API
 */
async function executeMongoAction(action: string, payloadOverrides: Partial<MongoRequestPayload> = {}) {
  if (!isMongoConfigured) {
    throw new Error("MongoDB Data API is not configured in .env");
  }

  const payload = {
    dataSource: CLUSTER_NAME,
    database: DB_NAME,
    ...payloadOverrides
  };

  const response = await fetch(`${DATA_API_URL}/action/${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': DATA_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`MongoDB API Error (${response.status}): ${errText}`);
  }

  return response.json();
}

/**
 * Find hospitals near a specific geospatial point using a 2dsphere index
 * @param lat User's latitude
 * @param lng User's longitude
 * @param maxDistanceMeters Maximum search radius in meters (default 20km)
 */
export async function findNearbyHospitals(lat: number, lng: number, maxDistanceMeters = 20000) {
  // Using MongoDB Atlas Data API "aggregate" action to run a $geoNear pipeline
  const data = await executeMongoAction('aggregate', {
    collection: 'hospitals',
    pipeline: [
      {
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] }, // MongoDB expects [longitude, latitude]
          distanceField: "calculatedDistance", // Distance in meters
          maxDistance: maxDistanceMeters,
          query: { emergency: true },
          spherical: true
        }
      },
      {
        $limit: 15
      }
    ]
  });

  return data.documents || [];
}
