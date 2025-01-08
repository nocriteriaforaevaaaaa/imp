"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { 
  AlertCircle, 
  Share2, 
  Navigation2, 
  Compass, 
  Copy, 
  MapPin, 
  Radio, 
  Clock
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: string;
  lastUpdate: number;
}

interface GeolocationError {
  code: number;
  message: string;
}

const HIGH_ACCURACY_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 5000
};

const SOSLocationSharer: React.FC = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [updateCount, setUpdateCount] = useState<number>(0);

  const handleSuccess = (position: GeolocationPosition) => {
    setLocation({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      speed: position.coords.speed,
      heading: position.coords.heading,
      timestamp: new Date(position.timestamp).toLocaleString(),
      lastUpdate: Date.now()
    });
    setLoading(false);
    setUpdateCount(prev => prev + 1);
  };

  const handleError = (error: GeolocationError) => {
    let errorMessage = 'Location error: ';
    switch (error.code) {
      case 1:
        errorMessage += 'Permission denied. Please enable location services.';
        break;
      case 2:
        errorMessage += 'Position unavailable. Try moving to a more open area.';
        break;
      case 3:
        errorMessage += 'Timeout. Please try again.';
        break;
      default:
        errorMessage += error.message;
    }
    setError(errorMessage);
    setLoading(false);
  };

  const startLocationTracking = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    // First get immediate location
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      HIGH_ACCURACY_OPTIONS
    );

    // Then start continuous tracking
    const id = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      HIGH_ACCURACY_OPTIONS
    );
    setWatchId(id);
  }, []);

  useEffect(() => {
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  const shareLocation = async () => {
    if (!location) return;

    const mapsUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    const shareText = `🆘 EMERGENCY SOS!\n📍 My current location (±${Math.round(location.accuracy)}m):\n${mapsUrl}\n⏰ ${location.timestamp}${
      location.speed ? `\n🏃 Speed: ${Math.round(location.speed * 3.6)}km/h` : ''
    }${location.altitude ? `\n⛰️ Altitude: ${Math.round(location.altitude)}m` : ''}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: '🆘 Emergency SOS Location',
          text: shareText,
          url: mapsUrl
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        alert('Location copied to clipboard!');
      }
    } catch (error) {
      setError('Failed to share location. Location copied to clipboard instead.');
      await navigator.clipboard.writeText(shareText);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Emergency SOS</h1>
        <p className="text-sm text-gray-600">
          {updateCount > 0 ? `Location updated ${updateCount} times` : 'Press button to start tracking'}
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="animate-shake">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <button
        onClick={startLocationTracking}
        className={`w-full p-6 rounded-lg ${
          loading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
        } text-white font-bold text-lg flex items-center justify-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl ${
          loading ? 'animate-pulse' : ''
        }`}
        disabled={loading}
      >
        <Navigation2 className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} />
        <span>{loading ? 'Getting Precise Location...' : 'START TRACKING'}</span>
      </button>

      {location && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-3">
            <div className="flex items-center space-x-2 text-gray-700">
              <MapPin className="h-5 w-5 text-red-500" />
              <p className="font-semibold">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
            </div>

            <div className="flex items-center space-x-2 text-gray-600">
              <Radio className="h-5 w-5 text-blue-500" />
              <p>Accuracy: ±{Math.round(location.accuracy)}m</p>
            </div>

            {location.speed && (
              <div className="flex items-center space-x-2 text-gray-600">
                <Compass className="h-5 w-5 text-green-500" />
                <p>Speed: {Math.round(location.speed * 3.6)}km/h</p>
              </div>
            )}

            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="h-5 w-5 text-purple-500" />
              <p>Updated: {location.timestamp}</p>
            </div>
          </div>

          <button
            onClick={shareLocation}
            className="w-full p-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg flex items-center justify-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Share2 className="h-6 w-6" />
            <span>SHARE LOCATION</span>
          </button>

          <button
            onClick={() => {
              const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
              navigator.clipboard.writeText(url);
              alert('Maps link copied!');
            }}
            className="w-full p-4 rounded-lg border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold text-lg flex items-center justify-center space-x-3 transition-all duration-200"
          >
            <Copy className="h-6 w-6" />
            <span>COPY MAPS LINK</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SOSLocationSharer;