"use client";

import { useState } from "react";

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function requestLocation() {
    if (!navigator.geolocation) {
      setError("Location is not supported in this browser.");
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setIsLoading(false);
      },
      (geoError) => {
        setError(geoError.message || "Could not get location.");
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12_000,
        maximumAge: 30_000
      }
    );
  }

  return { location, isLoading, error, requestLocation };
}
