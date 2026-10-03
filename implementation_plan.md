# 🇮🇳 India-Wide Implementation Plan (Phase 4)

This document outlines the technical implementation strategy for expanding **NEo Care (formerly Airoli Care Connect)** from a local pilot into an India-wide Location-Aware Emergency Intelligence platform.

---

## 🏗️ 1. Technical Stack Additions

To handle India-wide scaling and real-time geospatial intelligence, the following technologies should be integrated into our existing React + Vite stack:

- **Location & Geocoding**: HTML5 `navigator.geolocation` API.
- **Mapping & Routing**: **Google Maps Platform** (Maps JavaScript API, Places API, Distance Matrix API, and Routes API) for accurate ETA calculations and facility discovery.
- **Geospatial Database**: 
  - If using Firebase: **Firestore with GeoFire / GeoHashes** for fast, scalable location-based queries.
  - If using PostgreSQL: **PostGIS** extension for advanced geospatial queries (State/City bounds).
- **Real-Time Data**: Firebase Realtime Database or WebSockets for live SOS tracking.

---

## 🗺️ 2. Database Schema (India-wide Directory - ACC-15)

Instead of a flat list, the database will move to a geospatial indexed model. 

### Facility Model (Hospitals, Clinics, Ambulances)
```typescript
interface HealthcareFacility {
  id: string;
  name: string;
  type: 'HOSPITAL' | 'CLINIC' | 'PHARMACY';
  emergencyCapacity: boolean;
  address: {
    state: string;
    city: string;
    neighborhood: string;
    fullText: string;
  };
  location: {
    lat: number;
    lng: number;
    geohash: string; // Crucial for fast regional queries
  };
  contact: string;
}
```

---

## 🚀 3. Step-by-Step Execution Plan

### Step 1: Core Location Service (ACC-11)
**Goal:** Create a reliable, privacy-first location manager.
1. Implement a `useLocationService` React hook.
2. Build the **Normal Mode**: Triggers `getCurrentPosition()` only when a user clicks "Find Nearby".
3. Build the **Emergency Mode**: Triggers `watchPosition()` to continuously poll location when SOS is active.
4. Implement fallback UI (manual address input) if location permissions are denied.

### Step 2: Emergency Hospital Discovery (ACC-12)
**Goal:** Query and sort hospitals by ETA.
1. When SOS is triggered, query the database for `HealthcareFacility` documents where `emergencyCapacity == true` and the `geohash` is within a 10-20km radius.
2. Pass the results to the **Google Maps Distance Matrix API** to calculate real-time driving ETAs based on current traffic.
3. Sort and render the "Emergency Hospital List" showing distance and ETA.

### Step 3: Location-Aware Ambulance Discovery (ACC-14)
**Goal:** Discover and dispatch nearby ambulances.
1. Create a live tracking pool of active ambulances (similar to Uber/Ola drivers).
2. Query nearby ambulances based on the user's SOS coordinates.
3. Filter by required category (BLS / ALS / ICU).
4. Display ETA and allow the user/dispatcher to trigger a request.

### Step 4: Live SOS Location Sharing (ACC-13)
**Goal:** Secure, real-time location stream to the selected hospital/ambulance.
1. Generate an `EmergencySession` document in the database with a unique, secure token.
2. The user's device pushes coordinates to this document every 3-5 seconds using `watchPosition()`.
3. The selected hospital/ambulance subscribes to this document (via WebSockets/Firebase) to render the patient on a live map.
4. **Privacy trigger:** The session auto-deletes when marked as "Resolved" or after 2 hours.

---

## 🛡️ 4. Security & Privacy Controls

- **Ephemeral Sessions**: Live SOS coordinates must be stored in a temporary state/collection and purged immediately after the emergency is resolved.
- **Consent Tracking**: The UI must display a persistent pulsing red banner: *"Live Location Sharing Active"* with a clear "Stop Sharing" button.
- **Rate Limiting**: Map API calls must be debounced and rate-limited to avoid runaway costs (e.g., updating routing ETA only once a minute instead of every second).

---

## 🧪 5. Testing Strategy

- **Location Mocking**: Use Chrome DevTools (Sensors tab) to mock locations in different states (e.g., Mumbai, Bengaluru, Delhi) to verify regional scaling.
- **Permission States**: Write E2E tests simulating `granted`, `prompt`, and `denied` geolocation permissions.
- **Scale Testing**: Populate the database with 10,000+ mock facilities across India to ensure GeoHash queries remain under 200ms.
