import { useOffline } from "@/context/OfflineContext";
import { MOQUEGUA_PLACES, Place } from "@/data/moquegua";
import { TOURIST_ROUTES } from "@/data/routes";
import { useGPS } from "@/hooks/useGPS";
import { useCompass } from "@/hooks/useCompass";
import { useMapController } from "@/hooks/useMapController";
import { fetchMoqueguaPOIs, fetchWalkingRoute, OverpassPOI } from "@/services/routing";
import { WeatherWidget } from "@/components/WeatherWidget";
import {
  Compass, Navigation,
  MapPin, AlertCircle, Gauge, Map as MapIcon
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapLayerType } from "@/utils/mapStyles";

// Geographic center of Moquegua valley
const MOQUEGUA_CENTER: [number, number] = [-70.932, -17.194];
const INITIAL_ZOOM = 11.5;

export function MapPage() {
  const { isOfflineMode, isDownloaded } = useOffline();
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [gpsActive, setGpsActive] = useState(false);
  const [overpassPOIs, setOverpassPOIs] = useState<OverpassPOI[]>([]);
  const [isRouting, setIsRouting] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const poiMarkersRef = useRef<maplibregl.Marker[]>([]);
  const gpsMarkerRef = useRef<maplibregl.Marker | null>(null);

  const {
    map,
    mapLoaded,
    activeLayer,
    setActiveLayer,
    showRoutes,
    setShowRoutes,
  } = useMapController({
    containerRef: mapContainerRef,
    center: MOQUEGUA_CENTER,
    zoom: INITIAL_ZOOM,
  });

  const gps = useGPS(gpsActive);
  const compass = useCompass();

  // ── Fetch Overpass POIs ──
  useEffect(() => {
    fetchMoqueguaPOIs().then(setOverpassPOIs).catch(console.error);
  }, []);

  // ── Fly to marker on click ──
  const handleMarkerClick = useCallback((place: Place) => {
    setSelectedPlace((prev) => (prev?.id === place.id ? null : place));
    map?.flyTo({
      center: [place.longitude, place.latitude],
      zoom: 14.5,
      duration: 1000,
      essential: true,
      easing: (t) => t * (2 - t),
    });
  }, [map]);

  // ── Render Markers ──
  useEffect(() => {
    if (!map || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    poiMarkersRef.current.forEach((m) => m.remove());
    poiMarkersRef.current = [];

    // Main Tourist Places
    const places = isOfflineMode
      ? MOQUEGUA_PLACES.filter((p) => isDownloaded(p.id))
      : MOQUEGUA_PLACES;

    places.forEach((place) => {
      const el = document.createElement("div");
      el.style.cssText = `
        width: 44px; height: 52px;
        display: flex; align-items: flex-end; justify-content: center;
        cursor: pointer;
      `;
      const inner = document.createElement("div");
      const isMustSee = (place as any).mustSee === true;
      const isDown = isDownloaded(place.id);
      const pinColor = isMustSee ? "#C45A3D" : isDown ? "#A8452B" : "#2D2926";
      inner.style.cssText = `
        width: 36px; height: 36px;
        border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
        background: ${pinColor};
        border: 2.5px solid rgba(255,255,255,0.95);
        box-shadow: 0 4px 14px rgba(0,0,0,0.3);
        transition: transform 0.2s, box-shadow 0.2s;
        display: flex; align-items: center; justify-content: center;
      `;
      const dot = document.createElement("div");
      dot.style.cssText = `
        width: 8px; height: 8px; background: white;
        border-radius: 50%; transform: rotate(45deg); opacity: 0.9;
      `;
      inner.appendChild(dot);
      el.appendChild(inner);

      // pointerenter/pointerleave unifica eventos de mouse Y táctiles en Android
      // mouseenter/mouseleave no se disparan en pantallas táctiles
      el.addEventListener("pointerenter", () => {
        inner.style.transform = "rotate(-45deg) scale(1.15)";
        inner.style.boxShadow = "0 8px 20px rgba(0,0,0,0.4)";
      });
      el.addEventListener("pointerleave", () => {
        inner.style.transform = "rotate(-45deg)";
        inner.style.boxShadow = "0 4px 14px rgba(0,0,0,0.3)";
      });
      // pointerup responde más rápido que click en Android (sin 300ms delay)
      el.addEventListener("pointerup", () => handleMarkerClick(place));

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([place.longitude, place.latitude])
        .addTo(map);
      markersRef.current.push(marker);
    });

    // Overpass POIs (smaller markers)
    if (!isOfflineMode) {
      overpassPOIs.forEach((poi) => {
        const el = document.createElement("div");
        el.style.cssText = `
          width: 12px; height: 12px;
          border-radius: 50%;
          background: ${poi.type === "restaurant" ? "#F59E0B" : poi.type === "historic" ? "#8B5CF6" : "#6B7280"};
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          cursor: pointer;
        `;
        el.title = poi.name;
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([poi.lon, poi.lat])
          .addTo(map);
        poiMarkersRef.current.push(marker);
      });
    }

  }, [map, mapLoaded, isOfflineMode, isDownloaded, handleMarkerClick, overpassPOIs]);

  // ── GPS marker & Compass update ──
  useEffect(() => {
    if (!map || !gps.position) return;

    const { lat, lng } = gps.position;

    if (!gpsMarkerRef.current) {
      const el = document.createElement("div");
      el.style.cssText = `
        width: 20px; height: 20px;
        background: #3B82F6;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 0 4px rgba(59,130,246,0.3), 0 2px 8px rgba(0,0,0,0.3);
        transition: transform 0.1s linear;
      `;
      gpsMarkerRef.current = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([lng, lat])
        .addTo(map);
    } else {
      gpsMarkerRef.current.setLngLat([lng, lat]);
    }

    // Rotate map to compass heading if available and tracking
    if (compass.heading !== null && gps.tracking) {
      map.setBearing(compass.heading);
    } else if (gps.position.heading !== null && gps.position.heading >= 0) {
      map.setBearing(gps.position.heading);
    }
  }, [map, gps.position, compass.heading, gps.tracking]);

  // ── OSRM Routing ──
  const handleCalculateRoute = async () => {
    if (!selectedPlace || !gps.position || !map) {
      setGpsActive(true);
      return;
    }
    
    setIsRouting(true);
    try {
      const route = await fetchWalkingRoute(
        [gps.position.lng, gps.position.lat],
        [selectedPlace.longitude, selectedPlace.latitude]
      );
      
      const sourceId = "dynamic-route";
      if (map.getSource(sourceId)) {
        (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(route.geojson);
      } else {
        map.addSource(sourceId, { type: "geojson", data: route.geojson });
        map.addLayer({
          id: "dynamic-route-line",
          type: "line",
          source: sourceId,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": "#3B82F6", "line-width": 5 },
        });
      }

      // Fit bounds to route
      const coordinates = route.geojson.geometry.coordinates;
      const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord as [number, number]);
      }, new maplibregl.LngLatBounds(coordinates[0] as [number, number], coordinates[0] as [number, number]));
      
      map.fitBounds(bounds, { padding: 80 });
      
    } catch (e) {
      console.error("Routing error:", e);
      // Fallback: just fly there
      map.flyTo({ center: [selectedPlace.longitude, selectedPlace.latitude], zoom: 15 });
    } finally {
      setIsRouting(false);
    }
  };

  const handleResetView = () => {
    map?.flyTo({ center: MOQUEGUA_CENTER, zoom: INITIAL_ZOOM, pitch: 0, bearing: 0, duration: 900, essential: true });
    setSelectedPlace(null);
  };

  const handleFlyToGPS = () => {
    if (gps.position) {
      map?.flyTo({
        center: [gps.position.lng, gps.position.lat],
        zoom: 16,
        duration: 1000,
        essential: true,
      });
    } else {
      setGpsActive(true);
    }
  };

  const altDisplay = gps.position?.altitude != null ? `${Math.round(gps.position.altitude)} m` : "— m";
  const accDisplay = gps.position ? `±${Math.round(gps.position.accuracy)}m` : null;

  return (
    <div className="w-full h-full relative overflow-hidden">
      <div ref={mapContainerRef} className="absolute inset-0 z-0" style={{ width: "100%", height: "100%" }} />

      {/* ── Loading skeleton ── */}
      <AnimatePresence>
        {!mapLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-50 bg-sand-200 flex flex-col items-center justify-center gap-5"
          >
            <div className="w-full px-8 space-y-3">
              <div className="skeleton-shimmer h-12 rounded-2xl w-full" />
              <div className="skeleton-shimmer h-48 rounded-2xl w-full opacity-70" />
              <div className="skeleton-shimmer h-24 rounded-2xl w-3/4 opacity-50" />
            </div>
            <div className="flex flex-col items-center gap-2 mt-4">
              <div className="w-8 h-8 border-2 border-terracotta-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-[9px] uppercase tracking-widest font-bold text-sand-800 opacity-60">
                Iniciando mapa GIS…
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOP HEADER ── */}
      <div className="absolute top-0 left-0 right-0 z-30 px-4 pt-4 pointer-events-none">
        <div className="flex flex-col gap-2">
          {/* Weather Widget */}
          <div className="pointer-events-auto self-end">
            <WeatherWidget />
          </div>

          {/* Main Bar */}
          <div className="glass rounded-2xl shadow-md px-5 py-3 flex justify-between items-center pointer-events-auto">
            <div>
              <h1 className="font-serif italic text-lg text-sand-900 leading-none mb-1">
                {activeLayer === "satellite" ? "Satélite" : "Topografía."}
              </h1>
              <div className="flex items-center gap-2">
                <motion.div
                  animate={isOfflineMode ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className={cn("w-1.5 h-1.5 rounded-full", isOfflineMode ? "bg-terracotta-500" : "bg-green-500")}
                />
                <p className="text-[9px] uppercase tracking-widest font-bold opacity-50 text-sand-900">
                  {isOfflineMode ? "Offline" : "En línea"} · {MOQUEGUA_PLACES.length} lugares
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRoutes((v) => !v)}
                className={cn("w-10 h-10 rounded-full border flex items-center justify-center transition-all active:scale-90", showRoutes ? "bg-terracotta-500 text-white border-terracotta-600 shadow-md" : "glass border-sand-900/10 text-sand-900 opacity-60")}
                aria-label="Rutas turísticas"
              >
                <Navigation size={16} strokeWidth={2} />
              </button>
              <button
                onClick={handleResetView}
                className="w-10 h-10 rounded-full glass border border-sand-900/10 flex items-center justify-center text-sand-900 active:scale-95 transition-transform"
                aria-label="Centrar mapa"
              >
                <Compass size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── LAYER SWITCHER PILL ── */}
      <div className="absolute top-[120px] left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <div className="glass rounded-full p-1 flex shadow-md">
          {(["earthy", "satellite"] as MapLayerType[]).map((layer) => (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest transition-all",
                activeLayer === layer
                  ? layer === "satellite" ? "bg-sand-900 text-sand-50 shadow-sm" : "bg-terracotta-500 text-white shadow-sm"
                  : "text-sand-800 opacity-60"
              )}
            >
              {layer === "earthy" ? <span className="flex items-center gap-1"><MapPin size={10} />Mapa</span> : <span className="flex items-center gap-1"><MapPin size={10} />Satélite</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ── GPS HUD ── */}
      <div className="absolute top-[160px] right-4 z-30 pointer-events-auto">
        <motion.div
          animate={gpsActive && gps.position ? { opacity: 1, scale: 1 } : { opacity: 0.75, scale: 0.97 }}
          className="glass rounded-2xl px-3 py-3 flex flex-col gap-2 shadow-md min-w-[110px]"
        >
          <button
            onClick={() => { setGpsActive((v) => !v); handleFlyToGPS(); }}
            className={cn("flex items-center gap-2 text-[9px] uppercase font-bold tracking-widest rounded-full px-2 py-1 transition-colors", gpsActive && gps.tracking ? "text-blue-600 bg-blue-50" : "text-sand-800 opacity-60")}
          >
            <div className={cn("w-2 h-2 rounded-full", gpsActive && gps.tracking ? "bg-blue-500 animate-pulse" : "bg-sand-400")} />
            {gpsActive && gps.tracking ? "GPS Activo" : "Activar GPS"}
          </button>
          {gps.error && (
            <div className="flex items-center gap-1 text-[8px] text-terracotta-600 font-medium">
              <AlertCircle size={10} /> {gps.error}
            </div>
          )}
          {gps.position && (
            <>
              <div className="flex items-center gap-2">
                <MapPin size={12} className="text-terracotta-500 flex-shrink-0" />
                <div>
                  <p className="text-[7px] uppercase tracking-widest opacity-50 leading-none">Altitud</p>
                  <p className="font-mono text-xs font-bold text-sand-900">{altDisplay}</p>
                </div>
              </div>
              {accDisplay && (
                <div className="flex items-center gap-2">
                  <Gauge size={12} className="text-gold-400 flex-shrink-0" />
                  <div>
                    <p className="text-[7px] uppercase tracking-widest opacity-50 leading-none">Precisión</p>
                    <p className="font-mono text-xs font-bold text-sand-900">{accDisplay}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* ── ROUTE LEGEND ── */}
      <AnimatePresence>
        {showRoutes && mapLoaded && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute top-[160px] left-4 z-30 glass rounded-2xl px-3 py-3 shadow-md max-w-[140px]"
          >
            <p className="text-[7px] uppercase tracking-widest font-black opacity-40 mb-2">Rutas</p>
            {TOURIST_ROUTES.map((route) => (
              <div key={route.id} className="flex items-start gap-2 mb-2 last:mb-0">
                <div className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5" style={{ background: route.color }} />
                <div>
                  <p className="text-[9px] font-bold text-sand-900 leading-tight">{route.name}</p>
                  <p className="text-[7px] text-sand-800 opacity-50">{route.distanceKm} km · {route.difficulty}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SELECTED PLACE CARD ── */}
      <div className="absolute bottom-24 left-4 right-4 z-40 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {selectedPlace && (
            <motion.div
              key={selectedPlace.id}
              initial={{ opacity: 0, y: 28, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="glass rounded-2xl shadow-2xl overflow-hidden flex border-l-4 border-terracotta-500 pointer-events-auto"
            >
              <div className="w-24 flex-shrink-0 relative overflow-hidden bg-sand-900">
                <img src={selectedPlace.image} alt={selectedPlace.name} className="absolute inset-0 w-full h-full object-cover opacity-80" style={{ filter: "saturate(0.75)" }} />
              </div>
              <div className="p-3 flex-1 flex flex-col justify-center bg-white/50">
                <p className="text-[8px] uppercase font-bold text-terracotta-600 tracking-widest mb-0.5">{selectedPlace.category}</p>
                <h3 className="font-serif text-lg text-sand-900 leading-tight mb-1">{selectedPlace.name}</h3>
                <div className="flex gap-2 mt-2">
                   <button
                    onClick={handleCalculateRoute}
                    disabled={isRouting}
                    className="flex-1 bg-blue-600 text-white py-2 px-2 rounded-full text-[9px] uppercase font-bold tracking-widest flex items-center justify-center gap-1 active:scale-95 transition-all shadow-sm"
                  >
                    {isRouting ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MapIcon size={12} />}
                    Ruta
                  </button>
                  <Link
                    to={`/lugar/${selectedPlace.id}`}
                    className="flex-1 bg-sand-900 text-sand-50 py-2 px-2 rounded-full text-[9px] uppercase font-bold tracking-widest flex items-center justify-center gap-1 active:scale-95 transition-all shadow-sm"
                  >
                    Guía
                  </Link>
                  <button
                    onClick={() => { map?.flyTo({ center: [selectedPlace.longitude, selectedPlace.latitude], zoom: 16, pitch: 0, bearing: 0, duration: 1400 }); }}
                    className="w-10 h-10 bg-sand-50 text-sand-900 rounded-full border border-sand-900/10 flex items-center justify-center shadow-sm active:scale-95 transition-all"
                  >
                    <Navigation size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
