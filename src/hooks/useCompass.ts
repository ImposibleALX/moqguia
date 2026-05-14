import { useEffect, useState } from "react";

/** Device compass heading (0 = North, clockwise). Returns null if unsupported. */
export function useCompass() {
  const [heading, setHeading] = useState<number | null>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (!("DeviceOrientationEvent" in window)) return;
    setSupported(true);

    const handler = (e: DeviceOrientationEvent) => {
      // iOS: webkitCompassHeading is 0=N, clockwise (already correct)
      const ios = (e as unknown as { webkitCompassHeading?: number }).webkitCompassHeading;
      if (ios !== undefined && ios !== null) {
        setHeading(Math.round(ios));
        return;
      }
      // Android: alpha is 0=N, counter-clockwise → convert
      if (e.absolute && e.alpha !== null) {
        setHeading(Math.round((360 - e.alpha) % 360));
      }
    };

    // iOS 13+ requires explicit permission
    const Evt = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };

    if (typeof Evt.requestPermission === "function") {
      Evt.requestPermission()
        .then((state) => {
          if (state === "granted") {
            window.addEventListener("deviceorientationabsolute", handler, true);
            window.addEventListener("deviceorientation", handler, true);
          }
        })
        .catch(() => {/* permission denied */});
    } else {
      window.addEventListener("deviceorientationabsolute", handler, true);
      window.addEventListener("deviceorientation", handler, true);
    }

    return () => {
      window.removeEventListener("deviceorientationabsolute", handler, true);
      window.removeEventListener("deviceorientation", handler, true);
    };
  }, []);

  return { heading, supported };
}
