import React, { useState } from 'react';
import { useLocationService } from '../../hooks/useLocationService';
import { MapPin, Navigation, AlertTriangle, Play, Square, MapPinOff } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function LocationPermissionManager() {
  const {
    location,
    error,
    isTracking,
    permissionStatus,
    getSingleLocation,
    startEmergencyTracking,
    stopEmergencyTracking,
    requestPermission
  } = useLocationService();

  const [manualAddress, setManualAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGetLocation = async () => {
    setLoading(true);
    try {
      await getSingleLocation();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualAddress.trim()) {
      alert(`Manual address saved: ${manualAddress}`);
      // Here you would dispatch this address to your geocoding service
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Location Services
        </CardTitle>
        <CardDescription>
          Required for nearby hospitals and ambulance routing
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Indicators */}
        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
          <span className="text-sm font-medium">Permission Status:</span>
          <span className={`text-sm font-bold uppercase tracking-wide ${
            permissionStatus === 'granted' ? 'text-green-500' :
            permissionStatus === 'denied' ? 'text-red-500' : 'text-yellow-500'
          }`}>
            {permissionStatus}
          </span>
        </div>

        {location && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm">
            <div className="font-semibold text-green-700 dark:text-green-400 mb-1">Current Coordinates</div>
            <div className="text-muted-foreground font-mono">
              Lat: {location.latitude.toFixed(6)}
              <br/>
              Lng: {location.longitude.toFixed(6)}
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Normal Mode Controls */}
        <div className="space-y-2 pt-2">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Normal Mode</h4>
          <Button 
            onClick={handleGetLocation} 
            disabled={loading || isTracking}
            variant="outline"
            className="w-full"
          >
            <Navigation className="w-4 h-4 mr-2" />
            {loading ? 'Finding you...' : 'Find My Location Once'}
          </Button>
        </div>

        {/* Emergency Mode Controls */}
        <div className="space-y-2 pt-2">
          <h4 className="text-sm font-semibold text-destructive uppercase tracking-wider">Emergency Mode</h4>
          {isTracking ? (
            <div className="space-y-2">
              <Alert className="bg-destructive/10 text-destructive border-destructive/20 animate-pulse">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Live SOS Tracking Active</AlertTitle>
                <AlertDescription>Your location is being shared continuously.</AlertDescription>
              </Alert>
              <Button 
                onClick={stopEmergencyTracking} 
                variant="destructive"
                className="w-full"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop SOS Tracking
              </Button>
            </div>
          ) : (
            <Button 
              onClick={startEmergencyTracking} 
              variant="default"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Live SOS Tracking
            </Button>
          )}
        </div>

        {/* Fallback for Denied Permission */}
        {permissionStatus === 'denied' && (
          <div className="pt-4 border-t space-y-3">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
              <MapPinOff className="w-4 h-4" />
              <h4 className="text-sm font-semibold">Location Access Denied</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Since you've denied location permissions, please enter your address manually so we can find nearby hospitals.
            </p>
            <form onSubmit={handleManualSubmit} className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="address">Manual Address</Label>
                <Input 
                  id="address"
                  placeholder="e.g. Airoli Sector 8, Navi Mumbai" 
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                />
              </div>
              <Button type="submit" size="sm" className="w-full">
                Use this Address
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
