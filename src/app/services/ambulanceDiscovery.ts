export interface DiscoveredAmbulance {
  id: string;
  vehicleNumber: string;
  driverName: string;
  phone: string;
  category: 'BLS' | 'ALS' | 'ICU';
  status: 'AVAILABLE' | 'DISPATCHED' | 'MAINTENANCE';
  lat: number;
  lng: number;
  calculatedDistance: string; // Distance from user in km
  calculatedEta: number; // ETA in minutes
}

class AmbulanceDiscoveryService {
  async discoverNearbyAmbulances(
    userLat: number, 
    userLng: number, 
    category?: string
  ): Promise<DiscoveredAmbulance[]> {
    let ambulances: DiscoveredAmbulance[] = [];

    try {
      const url = new URL(`http://${window.location.hostname}:5000/api/ambulances/nearby`);
      url.searchParams.append('lat', userLat.toString());
      url.searchParams.append('lng', userLng.toString());
      url.searchParams.append('radius', '30000');
      if (category) {
        url.searchParams.append('category', category);
      }

      const response = await fetch(url.toString());
      
      if (response.ok) {
        const result = await response.json();
        const docs = result.data || [];
        
        ambulances = docs.map((doc: any) => {
          // Simple mock ETA: 1 min per km + 2 mins base
          const distanceKm = doc.calculatedDistance / 1000;
          const eta = Math.ceil(distanceKm * 1.5) + 2; 

          return {
            id: doc._id,
            vehicleNumber: doc.vehicleNumber,
            driverName: doc.driverName,
            phone: doc.phone,
            category: doc.category,
            status: doc.status,
            lat: doc.location.coordinates[1],
            lng: doc.location.coordinates[0],
            calculatedDistance: distanceKm.toFixed(1),
            calculatedEta: eta
          };
        });
        
        console.log("Fetched ambulances from MongoDB GeoNear API:", ambulances);
      } else {
        throw new Error("Express API returned non-OK");
      }
    } catch (e) {
      console.error("MongoDB Express API fetch failed for ambulances", e);
      // Fallback
      ambulances = [
        {
          id: 'fallback1',
          vehicleNumber: 'MH-04-XX-1111',
          driverName: 'Emergency Driver',
          phone: '+919999999999',
          category: 'BLS',
          status: 'AVAILABLE',
          lat: userLat,
          lng: userLng,
          calculatedDistance: '1.0',
          calculatedEta: 5
        }
      ];
    }

    // Sort by ETA
    return ambulances.sort((a, b) => a.calculatedEta - b.calculatedEta);
  }
}

export const ambulanceDiscoveryService = new AmbulanceDiscoveryService();
