const API_BASE = 'http://localhost:5000/api/emergency';

class LiveEmergencyService {
  async startSession(lat: number, lng: number, target: { hospitalId?: string; ambulanceId?: string }) {
    try {
      const response = await fetch(`${API_BASE}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat,
          lng,
          hospitalId: target.hospitalId,
          ambulanceId: target.ambulanceId
        })
      });

      if (!response.ok) throw new Error('Failed to start emergency session');
      const data = await response.json();
      return data.sessionId;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async updateLocation(sessionId: string, lat: number, lng: number) {
    try {
      await fetch(`${API_BASE}/${sessionId}/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng })
      });
    } catch (e) {
      console.error(e);
    }
  }

  async resolveSession(sessionId: string) {
    try {
      await fetch(`${API_BASE}/${sessionId}/resolve`, {
        method: 'POST',
      });
    } catch (e) {
      console.error(e);
    }
  }
}

export const liveEmergencyService = new LiveEmergencyService();
