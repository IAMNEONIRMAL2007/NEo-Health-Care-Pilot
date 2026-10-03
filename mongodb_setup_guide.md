# MongoDB Atlas Setup Guide for NEo Care

To enable India-wide hospital discovery based on geospatial coordinates, we use MongoDB Atlas with a `2dsphere` index.

## 1. Create the Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free tier (M0) cluster.
2. Create a Database named `neocare` and a Collection named `hospitals`.

## 2. Insert Sample Data
You can insert hospitals into the `hospitals` collection. Make sure the `location` field follows the GeoJSON format:

```json
{
  "name": "NMMC Hospital Airoli",
  "shortName": "NMMC Airoli",
  "rating": 4.6,
  "reviewCount": 832,
  "phone": "+912227688000",
  "address": "Sector 8, Airoli, Navi Mumbai 400708",
  "emergency": true,
  "verified": true,
  "beds": 200,
  "ambulance": true,
  "departments": ["General Physician", "Orthopedics", "Pediatrics", "Cardiology"],
  "location": {
    "type": "Point",
    "coordinates": [72.9974, 19.1497] 
  }
}
```
*(Note: MongoDB `coordinates` must be in `[longitude, latitude]` order!)*

## 3. Create the 2dsphere Index
To allow `$near` and `$geoWithin` queries, you MUST create an index on the `location` field.

In the Atlas Data Explorer or mongosh, run:
```javascript
use neocare;
db.hospitals.createIndex({ location: "2dsphere" });
```

## 4. Setup Atlas Data API
Since this is a Vite React frontend app, directly exposing the MongoDB connection string (`mongodb+srv://...`) is a security risk. Instead, we use the **Atlas Data API**:
1. Go to **Data API** under "Services" in the Atlas sidebar.
2. Enable the Data API.
3. Select your cluster and create an API Key.
4. Add these variables to your `.env` file at the root of the project:

```env
VITE_MONGO_DATA_API_URL=https://data.mongodb-api.com/app/<your-app-id>/endpoint/data/v1
VITE_MONGO_DATA_API_KEY=your_secure_api_key_here
VITE_MONGO_CLUSTER_NAME=Cluster0
VITE_MONGO_DB_NAME=neocare
```

The app's `mongoAtlasClient.ts` is pre-configured to use these variables if they exist.
