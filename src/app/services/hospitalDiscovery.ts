import { Hospital, MOCK_HOSPITALS } from '../constants/mockData';
import { isMongoConfigured, findNearbyHospitals } from './mongoAtlasClient';

export interface DiscoveredHospital extends Hospital {
  calculatedEta: number; // dynamically calculated ETA in minutes
  calculatedDistance: string; // dynamically calculated distance in km
}

/**
 * Service to discover nearby emergency hospitals and calculate ETAs using the free OSRM public API.
 */
export const hospitalDiscoveryService = {
  /**
   * Discovers emergency-capable hospitals and sorts them by live driving ETA.
   * @param userLat Current user latitude
   * @param userLng Current user longitude
   * @returns Promise<DiscoveredHospital[]>
   */
  async discoverEmergencyHospitals(userLat: number, userLng: number): Promise<DiscoveredHospital[]> {
    let emergencyHospitals: Hospital[] = [];

    // 1. Filter for emergency capable facilities
    if (isMongoConfigured) {
      try {
        const docs = await findNearbyHospitals(userLat, userLng);
        
        // Map MongoDB docs to Hospital type
        emergencyHospitals = docs.map((doc: any) => ({
          id: doc._id,
          name: doc.name,
          shortName: doc.shortName || doc.name,
          lat: doc.location.coordinates[1],
          lng: doc.location.coordinates[0],
          rating: doc.rating,
          reviewCount: doc.reviewCount,
          eta: doc.eta || 15,
          distance: doc.distance || (doc.calculatedDistance / 1000).toFixed(1),
          phone: doc.phone,
          address: doc.address,
          emergency: doc.emergency,
          departments: doc.departments || [],
          verified: doc.verified,
          beds: doc.beds || 0,
          ambulance: doc.ambulance
        }));
        
        console.log("Fetched hospitals from MongoDB GeoNear:", emergencyHospitals);
      } catch (e) {
        console.error("MongoDB fetch failed, falling back to local mocks", e);
        emergencyHospitals = MOCK_HOSPITALS.filter(h => h.emergency);
      }
    } else {
      // Fallback to local data
      emergencyHospitals = MOCK_HOSPITALS.filter(h => h.emergency);
    }

    // 2. Fetch driving ETAs for all hospitals concurrently using OSRM
    const promises = emergencyHospitals.map(async (hospital) => {
      try {
        // OSRM expects coordinates in lon,lat format
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${hospital.lng},${hospital.lat}?overview=false`
        );
        const data = await response.json();

        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          // route.duration is in seconds, route.distance is in meters
          const calculatedEta = Math.ceil(route.duration / 60);
          const calculatedDistance = (route.distance / 1000).toFixed(1);

          return {
            ...hospital,
            calculatedEta,
            calculatedDistance,
          } as DiscoveredHospital;
        }
      } catch (err) {
        console.warn(`Failed to fetch ETA for ${hospital.name} via OSRM, falling back to static data`, err);
      }

      // Fallback to static mock data if API fails or rate-limits
      return {
        ...hospital,
        calculatedEta: hospital.eta,
        calculatedDistance: hospital.distance,
      } as DiscoveredHospital;
    });

    const discovered = await Promise.all(promises);

    // 3. Sort by live calculated ETA
    return discovered.sort((a, b) => a.calculatedEta - b.calculatedEta);
  }
};
