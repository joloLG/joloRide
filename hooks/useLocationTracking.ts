"use client";

import { useEffect, useState, useRef } from "react";

interface Location {
  lat: number;
  lng: number;
  address?: string;
  accuracy?: number;
  timestamp?: number;
}

interface LocationTrackingOptions {
  updateInterval?: number; // in milliseconds
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export function useLocationTracking(
  isTracking: boolean = false,
  options: LocationTrackingOptions = {}
) {
  const {
    updateInterval = 5000, // 5 seconds default
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
  } = options;

  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  const getCurrentPosition = (): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          resolve(newLocation);
        },
        (error) => {
          reject(new Error(getGeolocationErrorMessage(error)));
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        }
      );
    });
  };

  const getGeolocationErrorMessage = (error: GeolocationPositionError): string => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return "Location permission denied. Please enable location access.";
      case error.POSITION_UNAVAILABLE:
        return "Location information is unavailable.";
      case error.TIMEOUT:
        return "Location request timed out.";
      default:
        return "An unknown error occurred while retrieving location.";
    }
  };

  const startTracking = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get initial position
      const initialLocation = await getCurrentPosition();
      setLocation(initialLocation);

      // Set up continuous tracking
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          setLocation(newLocation);
          setError(null);
          setIsLoading(false);
        },
        (error) => {
          const errorMessage = getGeolocationErrorMessage(error);
          setError(errorMessage);
          setIsLoading(false);
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        }
      );

      // Also set up interval for more frequent updates (5 seconds)
      intervalIdRef.current = setInterval(async () => {
        try {
          const latestLocation = await getCurrentPosition();
          setLocation(latestLocation);
          setError(null);
        } catch (err) {
          // Don't update error state on interval failures to avoid spam
          console.error("Interval location update failed:", err);
        }
      }, updateInterval);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get location");
      setIsLoading(false);
    }
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    setIsLoading(false);
  };

  // Start/stop tracking based on isTracking prop
  useEffect(() => {
    if (isTracking) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [isTracking, updateInterval, enableHighAccuracy, timeout, maximumAge]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  return {
    location,
    error,
    isLoading,
    startTracking,
    stopTracking,
  };
}

// Hook for rider-specific location tracking with database updates
export function useRiderLocationTracking(riderId?: string, orderId?: string) {
  const locationTracking = useLocationTracking(true, {
    updateInterval: 5000, // 5 seconds
    enableHighAccuracy: true,
  });

  const updateRiderLocationInDB = async (location: Location) => {
    if (!riderId) return;

    try {
      // Update rider's current location in the database
      const response = await fetch('/api/riders/update-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riderId,
          orderId,
          location: {
            lat: location.lat,
            lng: location.lng,
            timestamp: location.timestamp || Date.now(),
          },
        }),
      });

      if (!response.ok) {
        console.error('Failed to update rider location:', await response.text());
      }
    } catch (error) {
      console.error("Failed to update rider location in DB:", error);
    }
  };

  // Update database whenever location changes
  useEffect(() => {
    if (locationTracking.location && riderId) {
      updateRiderLocationInDB(locationTracking.location);
    }
  }, [locationTracking.location, riderId]);

  return locationTracking;
}
