import { useState, useEffect, useRef } from "react";
import { KalmanFilter } from "@/utils/KalmanFilter";
import { Geolocation, Position } from "@capacitor/geolocation";
import { Capacitor } from "@capacitor/core";

export interface GPSPosition {
  lat: number;
  lng: number;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  accuracy: number;
  timestamp: number;
}

export interface GPSState {
  position: GPSPosition | null;
  rawPosition: GPSPosition | null;
  error: string | null;
  supported: boolean;
  tracking: boolean;
  isNative: boolean; // Tells us if we're using real hardware GPS
}

export function useGPS(active = false): GPSState {
  const isNative = Capacitor.isNativePlatform();
  const [state, setState] = useState<GPSState>({
    position: null,
    rawPosition: null,
    error: null,
    supported: isNative || "geolocation" in navigator,
    tracking: false,
    isNative,
  });

  const watchIdRef = useRef<string | number | null>(null);
  const latFilter = useRef(new KalmanFilter(0.00001, 0.01));
  const lngFilter = useRef(new KalmanFilter(0.00001, 0.01));

  useEffect(() => {
    if (!active) {
      if (watchIdRef.current !== null) {
        if (isNative) {
          Geolocation.clearWatch({ id: watchIdRef.current as string });
        } else {
          navigator.geolocation.clearWatch(watchIdRef.current as number);
        }
        watchIdRef.current = null;
        latFilter.current.reset();
        lngFilter.current.reset();
      }
      setState((s) => ({ ...s, tracking: false, position: null, rawPosition: null }));
      return;
    }

    setState((s) => ({ ...s, tracking: true, error: null }));

    const handlePosition = (pos: any) => {
      const coords = pos.coords;
      const raw: GPSPosition = {
        lat: coords.latitude,
        lng: coords.longitude,
        altitude: coords.altitude,
        heading: coords.heading,
        speed: coords.speed,
        accuracy: coords.accuracy,
        timestamp: pos.timestamp,
      };

      const smoothedLat = latFilter.current.filter(raw.lat, raw.accuracy);
      const smoothedLng = lngFilter.current.filter(raw.lng, raw.accuracy);

      setState((s) => ({
        ...s,
        supported: true,
        tracking: true,
        error: null,
        rawPosition: raw,
        position: { ...raw, lat: smoothedLat, lng: smoothedLng },
      }));
    };

    const handleError = (err: any) => {
      let msg = "Error desconocido de GPS";
      if (err.code === 1) msg = "Permiso de ubicación denegado";
      if (err.code === 2) msg = "Señal GPS no disponible";
      if (err.code === 3) msg = "Tiempo de espera agotado";
      setState((s) => ({ ...s, tracking: false, error: msg }));
    };

    const startWatching = async () => {
      if (isNative) {
        try {
          const perm = await Geolocation.checkPermissions();
          if (perm.location !== "granted") {
            const req = await Geolocation.requestPermissions();
            if (req.location !== "granted") throw new Error("Permission Denied");
          }
          watchIdRef.current = await Geolocation.watchPosition(
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 2000 },
            (pos, err) => {
              if (err) handleError({ code: 2 });
              else if (pos) handlePosition(pos);
            }
          );
        } catch (e) {
          handleError({ code: 1 });
        }
      } else {
        watchIdRef.current = navigator.geolocation.watchPosition(
          handlePosition,
          handleError,
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 2000 }
        );
      }
    };

    startWatching();

    return () => {
      if (watchIdRef.current !== null) {
        if (isNative) Geolocation.clearWatch({ id: watchIdRef.current as string });
        else navigator.geolocation.clearWatch(watchIdRef.current as number);
        watchIdRef.current = null;
      }
    };
  }, [active, isNative]);

  return state;
}
