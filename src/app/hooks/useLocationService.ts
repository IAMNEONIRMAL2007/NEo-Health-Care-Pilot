import { useState, useEffect, useCallback, useRef } from 'react';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export type PermissionState = 'prompt' | 'granted' | 'denied' | 'unknown';

export interface UseLocationServiceReturn {
  location: LocationData | null;
  error: string | null;
  isTracking: boolean;
  permissionStatus: PermissionState;
  getSingleLocation: () => Promise<LocationData>;
  startEmergencyTracking: () => void;
  stopEmergencyTracking: () => void;
  requestPermission: () => Promise<PermissionState>;
}

export function useLocationService(): UseLocationServiceReturn {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState>('unknown');
  
  const watcherIdRef = useRef<number | null>(null);

  // Check initial permission status if the browser supports it
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionStatus(result.state as PermissionState);
        result.onchange = () => {
          setPermissionStatus(result.state as PermissionState);
        };
      }).catch(() => {
        // Fallback for browsers that don't support permission query
        setPermissionStatus('unknown');
      });
    }
  }, []);

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    setError(null);
    const newLoc = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    };
    setLocation(newLoc);
    setPermissionStatus('granted');
    return newLoc;
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    let errorMessage = 'An unknown error occurred.';
    switch (err.code) {
      case err.PERMISSION_DENIED:
        errorMessage = 'Location permission denied. Please enable it in your browser settings.';
        setPermissionStatus('denied');
        break;
      case err.POSITION_UNAVAILABLE:
        errorMessage = 'Location information is unavailable.';
        break;
      case err.TIMEOUT:
        errorMessage = 'The request to get user location timed out.';
        break;
    }
    setError(errorMessage);
    throw new Error(errorMessage);
  }, []);

  // Request a single location (Normal Mode)
  const getSingleLocation = useCallback(async (): Promise<LocationData> => {
    if (!navigator.geolocation) {
      const err = 'Geolocation is not supported by this browser.';
      setError(err);
      return Promise.reject(new Error(err));
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(handleSuccess(pos)),
        (err) => {
          handleError(err);
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }, [handleSuccess, handleError]);

  // Start continuous tracking (Emergency Mode)
  const startEmergencyTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    if (watcherIdRef.current !== null) {
      // Already tracking
      return;
    }

    setError(null);
    setIsTracking(true);
    
    // Watch position fires every time the device location changes
    watcherIdRef.current = navigator.geolocation.watchPosition(
      (pos) => handleSuccess(pos),
      (err) => handleError(err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [handleSuccess, handleError]);

  // Stop continuous tracking
  const stopEmergencyTracking = useCallback(() => {
    if (watcherIdRef.current !== null) {
      navigator.geolocation.clearWatch(watcherIdRef.current);
      watcherIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watcherIdRef.current !== null) {
        navigator.geolocation.clearWatch(watcherIdRef.current);
      }
    };
  }, []);

  const requestPermission = useCallback(async (): Promise<PermissionState> => {
    try {
      await getSingleLocation();
      return 'granted';
    } catch (e) {
      return permissionStatus === 'denied' ? 'denied' : 'unknown';
    }
  }, [getSingleLocation, permissionStatus]);

  return {
    location,
    error,
    isTracking,
    permissionStatus,
    getSingleLocation,
    startEmergencyTracking,
    stopEmergencyTracking,
    requestPermission,
  };
}
