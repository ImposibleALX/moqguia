// Real-world routing and POI services for Moquegua Explorer
// Uses OSRM (free, no API key) + Overpass API (OpenStreetMap data)

// ─── Types ─────────────────────────────────────────────────

export interface RouteResult {
  geojson: GeoJSON.Feature<GeoJSON.LineString>;
  distanceM: number;
  durationSec: number;
}

export interface OverpassPOI {
  id: number;
  lat: number;
  lon: number;
  name: string;
  type: "restaurant" | "historic" | "tourism" | "viewpoint" | "other";
  tags: Record<string, string>;
}

// ─── OSRM — Real Street Routing ────────────────────────────

// Primary: public OSRM. Fallback: straight-line if offline/unreachable.
const OSRM_BASE = "https://router.project-osrm.org/route/v1";

/** Straight-line fallback geometry between two points */
function straightLineRoute(
  from: [number, number],
  to: [number, number]
): RouteResult {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const distM = Math.round(Math.sqrt(dx * dx + dy * dy) * 111320);
  return {
    geojson: {
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates: [from, to] },
    },
    distanceM: distM,
    durationSec: Math.round(distM / 1.4), // avg walking speed 1.4 m/s
  };
}

/** Calculate a real walking route between two points using OSRM.
 *  Falls back to a straight-line if OSRM is unreachable (offline mode). */
export async function fetchWalkingRoute(
  from: [number, number], // [lng, lat]
  to: [number, number]    // [lng, lat]
): Promise<RouteResult> {
  try {
    const coords = `${from[0]},${from[1]};${to[0]},${to[1]}`;
    const url = `${OSRM_BASE}/foot/${coords}?overview=full&geometries=geojson&steps=false`;

    const signal = AbortSignal.timeout(8000);
    const resp = await fetch(url, { signal });
    if (!resp.ok) throw new Error(`OSRM ${resp.status}`);

    const data = await resp.json();
    if (data.code !== "Ok" || !data.routes?.length) throw new Error("No route");

    const route = data.routes[0];
    return {
      geojson: {
        type: "Feature",
        properties: {},
        geometry: route.geometry as GeoJSON.LineString,
      },
      distanceM: Math.round(route.distance),
      durationSec: Math.round(route.duration),
    };
  } catch {
    // Offline or OSRM unreachable → straight line fallback
    return straightLineRoute(from, to);
  }
}

/** Calculate a driving route (for places outside the city) */
export async function fetchDrivingRoute(
  from: [number, number],
  to: [number, number]
): Promise<RouteResult> {
  try {
    const coords = `${from[0]},${from[1]};${to[0]},${to[1]}`;
    const url = `${OSRM_BASE}/car/${coords}?overview=full&geometries=geojson&steps=false`;

    const signal = AbortSignal.timeout(8000);
    const resp = await fetch(url, { signal });
    if (!resp.ok) throw new Error(`OSRM ${resp.status}`);

    const data = await resp.json();
    if (data.code !== "Ok" || !data.routes?.length) throw new Error("No route");

    const route = data.routes[0];
    return {
      geojson: {
        type: "Feature",
        properties: {},
        geometry: route.geometry as GeoJSON.LineString,
      },
      distanceM: Math.round(route.distance),
      durationSec: Math.round(route.duration),
    };
  } catch {
    return straightLineRoute(from, to);
  }
}

/** Pre-fetch tourist circuit routes via OSRM and return real GeoJSON LineStrings.
 *  Called on app start so routes are ready when offline. */
export async function prefetchTouristRoutes(
  waypointPairs: Array<{ id: string; waypoints: Array<[number, number]> }>
): Promise<Record<string, GeoJSON.Feature<GeoJSON.LineString>>> {
  const results: Record<string, GeoJSON.Feature<GeoJSON.LineString>> = {};

  for (const circuit of waypointPairs) {
    try {
      const coords = circuit.waypoints.map((p) => `${p[0]},${p[1]}`).join(";");
      const url = `${OSRM_BASE}/foot/${coords}?overview=full&geometries=geojson&steps=false`;
      const resp = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!resp.ok) throw new Error("OSRM error");
      const data = await resp.json();
      if (data.code === "Ok" && data.routes?.length) {
        results[circuit.id] = {
          type: "Feature",
          properties: {},
          geometry: data.routes[0].geometry as GeoJSON.LineString,
        };
      }
    } catch {
      // Keep the straight-line geometry as fallback (already in TOURIST_ROUTES)
    }
  }

  return results;
}

// ─── Overpass API — Real Moquegua POIs ─────────────────────

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

/** Bounding box centered on Moquegua city (south,west,north,east) */
const MOQUEGUA_BBOX = "-17.215,-70.960,-17.165,-70.905";

function classifyPOI(tags: Record<string, string>): OverpassPOI["type"] {
  if (tags.tourism === "viewpoint") return "viewpoint";
  if (tags.tourism || tags.museum) return "tourism";
  if (tags.historic) return "historic";
  if (tags.amenity === "restaurant" || tags.amenity === "bar") return "restaurant";
  return "other";
}

/** Fetch real local POIs from OpenStreetMap Overpass API.
 *  Cached in sessionStorage; returns empty array if offline. */
export async function fetchMoqueguaPOIs(): Promise<OverpassPOI[]> {
  const CACHE_KEY = "moquegua-overpass-pois";
  const cached = sessionStorage.getItem(CACHE_KEY);
  if (cached) {
    try { return JSON.parse(cached) as OverpassPOI[]; } catch { /* ignore */ }
  }

  const query = `
    [out:json][timeout:20];
    (
      node["amenity"="restaurant"](${MOQUEGUA_BBOX});
      node["historic"~"monument|building|ruins"](${MOQUEGUA_BBOX});
      node["tourism"~"attraction|museum|viewpoint|artwork"](${MOQUEGUA_BBOX});
      node["amenity"="bar"]["name"~"picante|uchu|chupe",i](${MOQUEGUA_BBOX});
    );
    out body;
  `.trim();

  try {
    const signal = AbortSignal.timeout(15000);
    const resp = await fetch(OVERPASS_URL, {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal,
    });

    if (!resp.ok) throw new Error(`Overpass ${resp.status}`);

    const data = await resp.json();
    const pois: OverpassPOI[] = (data.elements ?? [])
      .filter((el: { lat?: number; lon?: number; tags?: Record<string, string> }) =>
        el.lat && el.lon && el.tags?.name)
      .map((el: { id: number; lat: number; lon: number; tags: Record<string, string> }) => ({
        id: el.id,
        lat: el.lat,
        lon: el.lon,
        name: el.tags.name ?? "Sin nombre",
        type: classifyPOI(el.tags),
        tags: el.tags,
      }));

    sessionStorage.setItem(CACHE_KEY, JSON.stringify(pois));
    return pois;
  } catch {
    return []; // Offline: no POIs, graceful degradation
  }
}

// ─── Formatting Helpers ─────────────────────────────────────

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} seg`;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}min`;
}
