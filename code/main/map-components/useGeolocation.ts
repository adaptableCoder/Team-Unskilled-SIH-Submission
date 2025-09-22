import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Position } from './types';

export function useGeolocation() {
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let subscriber: Location.LocationSubscription | null = null;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission to access location was denied');
          return;
        }

        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
        setPosition({
          coords: {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            accuracy: loc.coords.accuracy ?? undefined,
            speed: loc.coords.speed ?? null,
          },
          timestamp: loc.timestamp,
        });

        subscriber = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Highest, distanceInterval: 5, timeInterval: 2000 },
          (loc) => {
            setPosition({
              coords: {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                accuracy: loc.coords.accuracy ?? undefined,
                speed: loc.coords.speed ?? null,
              },
              timestamp: loc.timestamp,
            });
          }
        );
      } catch (err: any) {
        setError(err?.message ?? 'Location error');
      }
    })();

    return () => {
      if (subscriber) subscriber.remove();
    };
  }, []);

  return { position, error } as const;
}
