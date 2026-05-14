import { useEffect, useRef, useState, RefObject } from "react";
import maplibregl from "maplibre-gl";
import { buildEarthyStyle, buildSatelliteStyle, MapLayerType } from "@/utils/mapStyles";
import { TOURIST_ROUTES } from "@/data/routes";
import { prefetchTouristRoutes } from "@/services/routing";

interface MapControllerProps {
  containerRef: RefObject<HTMLDivElement | null>;
  center: [number, number];
  zoom: number;
}

type RealRouteCache = Record<string, GeoJSON.Feature<GeoJSON.LineString>>;

function addRouteLayers(
  map: maplibregl.Map,
  routeCache: RealRouteCache,
  visible: boolean
) {
  TOURIST_ROUTES.forEach((route) => {
    const sourceId = `route-${route.id}`;
    // Use real OSRM geometry if available, fall back to straight-line
    const geojson = routeCache[route.id] ?? route.geojson;

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, { type: "geojson", data: geojson });
    } else {
      (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(geojson);
    }

    if (!map.getLayer(`route-glow-${route.id}`)) {
      map.addLayer({
        id: `route-glow-${route.id}`,
        type: "line",
        source: sourceId,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": route.color,
          "line-width": 12,
          "line-opacity": visible ? 0.18 : 0,
          "line-blur": 4,
        },
      });
    }

    if (!map.getLayer(`route-line-${route.id}`)) {
      map.addLayer({
        id: `route-line-${route.id}`,
        type: "line",
        source: sourceId,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": route.color,
          "line-width": 4,
          "line-opacity": visible ? 1 : 0,
        },
      });
    }
  });
}

export function useMapController({ containerRef, center, zoom }: MapControllerProps) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const routeCacheRef = useRef<RealRouteCache>({});
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeLayer, setActiveLayer] = useState<MapLayerType>("earthy");
  const [showRoutes, setShowRoutes] = useState(true);

  // Initialize Map — runs once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: buildEarthyStyle(),
      center,
      zoom,
      // @ts-ignore: antialias no está en las definiciones tipadas pero es válido
      antialias: false, // CRÍTICO para rendimiento en gama baja
      attributionControl: false,
      cooperativeGestures: false,
      touchZoomRotate: true,
      touchPitch: false,   // No 3D pitch on mobile by default
      dragRotate: false,   // Simpler for tourists
      maxPitch: 0,         // Flat map — better for navigation
      minZoom: 7,
      maxZoom: 19,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    map.on("load", async () => {
      setMapLoaded(true);
      map.resize();

      // Use the actual coordinates from each route's waypoints via MOQUEGUA_PLACES
      const { MOQUEGUA_PLACES } = await import("@/data/moquegua");
      const realPairs = TOURIST_ROUTES.map((route) => ({
        id: route.id,
        waypoints: route.waypoints
          .map((wid) => {
            const p = MOQUEGUA_PLACES.find((pl) => pl.id === wid);
            return p ? ([p.longitude, p.latitude] as [number, number]) : null;
          })
          .filter((c): c is [number, number] => c !== null),
      })).filter((r) => r.waypoints.length >= 2);

      // Background fetch — doesn't block map load
      prefetchTouristRoutes(realPairs).then((cache) => {
        routeCacheRef.current = cache;
        // Update route sources with real geometry
        TOURIST_ROUTES.forEach((route) => {
          const sourceId = `route-${route.id}`;
          if (cache[route.id] && map.getStyle() && map.getSource(sourceId)) {
            (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(cache[route.id]);
          }
        });
      });

      addRouteLayers(map, routeCacheRef.current, true);
    });

    map.on("remove", () => setMapLoaded(false));
    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Layer switching (earthy ↔ satellite)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const newStyle = activeLayer === "satellite" ? buildSatelliteStyle() : buildEarthyStyle();
    map.setStyle(newStyle);

    map.once("styledata", () => {
      addRouteLayers(map, routeCacheRef.current, showRoutes);
    });
  }, [activeLayer, mapLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Route visibility toggle
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    TOURIST_ROUTES.forEach((route) => {
      const lid = `route-line-${route.id}`;
      const glid = `route-glow-${route.id}`;
      if (map.getLayer(lid)) map.setPaintProperty(lid, "line-opacity", showRoutes ? 1 : 0);
      if (map.getLayer(glid)) map.setPaintProperty(glid, "line-opacity", showRoutes ? 0.18 : 0);
    });
  }, [showRoutes, mapLoaded]);

  return {
    map: mapRef.current,
    mapLoaded,
    activeLayer,
    setActiveLayer,
    showRoutes,
    setShowRoutes,
  };
}
