'use client';

import { useCallback, useEffect, useState } from 'react';
import { getDistance, getBearing } from '@/utils/math';

interface Location {
  latitude: number;
  longitude: number;
}

export interface Retailer {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  distance: number;
}

export function useCompass() {
  const [enabled, setEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [zipCode, setZipCode] = useState<string | null>(null);
  const [manualZipCode, setManualZipCode] = useState<string | null>(null);

  const nearestRetailer = retailers[activeIndex] ?? null;
  const geolocationUnsupported =
    enabled && typeof window !== 'undefined' && !navigator.geolocation;

  // 1. Get User Location (only when enabled)
  useEffect(() => {
    if (!enabled) return;

    if (typeof window === 'undefined' || !navigator.geolocation) {
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (_err) => { // eslint-disable-line @typescript-eslint/no-unused-vars
        setError('Location permission denied');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, [enabled]);

  // 2. Reverse Geocode (GPS to Zip) - only when enabled
  useEffect(() => {
    if (!enabled || !userLocation) return;

    const fetchZip = async () => {
      try {
        const response = await fetch('/api/zip-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? 'Zip lookup failed');
        }

        if (data.zipCode) {
          setZipCode(data.zipCode);
        }
      } catch (err) {
        console.error('Failed to resolve Zip Code:', err);
        setError('Location resolution failed.');
      }
    };

    if (!zipCode && !manualZipCode) {
      fetchZip();
    }
  }, [enabled, userLocation, zipCode, manualZipCode]);

  // 3. Fetch Retailers (Single High-Radius Search) - only when enabled
  useEffect(() => {
    if (!enabled) return;
    const activeZip = manualZipCode || zipCode;
    if (!activeZip || retailers.length > 0) return;

    const fetchRetailers = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/locate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zipCode: activeZip }),
        });
        const data = await response.json();

        if (data.data?.locateRetailers?.retailers && data.data.locateRetailers.retailers.length > 0) {
          const fetched: Retailer[] = data.data.locateRetailers.retailers;
          const sorted = fetched.sort((a, b) => a.distance - b.distance);
          setRetailers(sorted);
          setActiveIndex(0);
          setLoading(false);
        } else {
          setError('No Busch Apple found in your area :(');
          setLoading(false);
        }
      } catch (err) {
        console.error('Fetch failed:', err);
        setError('Failed to load store data');
        setLoading(false);
      }
    };

    fetchRetailers();
  }, [enabled, zipCode, manualZipCode, retailers.length]);

  // 4. Track Heading (Compass Orientation) - only when enabled
  useEffect(() => {
    if (!enabled) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if ('webkitCompassHeading' in event) {
        setHeading(event.webkitCompassHeading as number);
      } else if (event.alpha !== null) {
        setHeading(360 - event.alpha);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [enabled]);

  // 5. Calculate Target Bearing & Real-time Distance
  const getTargetData = useCallback(() => {
    if (!userLocation || !nearestRetailer) return null;

    const bearing = getBearing(
      userLocation.latitude,
      userLocation.longitude,
      nearestRetailer.latitude,
      nearestRetailer.longitude
    );

    const distance = getDistance(
      userLocation.latitude,
      userLocation.longitude,
      nearestRetailer.latitude,
      nearestRetailer.longitude
    );

    return {
      bearing,
      distance,
      relativeHeading: (bearing - heading + 360) % 360,
    };
  }, [userLocation, nearestRetailer, heading]);

  const goNext = useCallback(() => {
    setActiveIndex((i) => Math.min(i + 1, retailers.length - 1));
  }, [retailers.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => Math.max(i - 1, 0));
  }, []);

  return {
    enabled,
    setEnabled,
    userLocation,
    nearestRetailer,
    retailers,
    activeIndex,
    setActiveIndex,
    goNext,
    goPrev,
    heading,
    loading,
    error: error ?? (geolocationUnsupported ? 'Geolocation is not supported by your browser' : null),
    setManualZipCode,
    ...getTargetData(),
  };
}
