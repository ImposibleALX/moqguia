// Service Worker — Moquegua Explorer Offline
// Intercepts map tile requests and caches them for offline use
const TILE_CACHE = "moquegua-tiles-v1";
const APP_CACHE = "moquegua-app-v1";

// Tile URL patterns to cache
const TILE_PATTERNS = [
  /tile\.openstreetmap\.org/,
  /elevation-tiles-prod\.s3\.amazonaws\.com/,
  /server\.arcgisonline\.com/,
];

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// ---- Fetch interception: Cache-First for tiles ----
self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  const isTile = TILE_PATTERNS.some((p) => p.test(url));

  if (!isTile) return; // Let non-tile requests through normally

  event.respondWith(
    caches.open(TILE_CACHE).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;

      try {
        const response = await fetch(event.request.clone());
        if (response.ok) {
          cache.put(event.request, response.clone());
        }
        return response;
      } catch {
        // Offline and not cached — return a transparent 1px PNG
        return new Response(
          atob(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
          ),
          { headers: { "Content-Type": "image/png" } }
        );
      }
    })
  );
});

// ---- Tile batch downloader ---- 
// Calculates all tile coordinates within a bounding box for given zoom levels
function bboxToTiles(west, south, east, north, zoom) {
  const lng2tile = (lng, z) =>
    Math.floor(((lng + 180) / 360) * Math.pow(2, z));
  const lat2tile = (lat, z) =>
    Math.floor(
      ((1 -
        Math.log(
          Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
        ) /
          Math.PI) /
        2) *
        Math.pow(2, z)
    );

  const tiles = [];
  const xMin = lng2tile(west, zoom);
  const xMax = lng2tile(east, zoom);
  const yMin = lat2tile(north, zoom);
  const yMax = lat2tile(south, zoom);

  for (let x = xMin; x <= xMax; x++) {
    for (let y = yMin; y <= yMax; y++) {
      tiles.push({ x, y, z: zoom });
    }
  }
  return tiles;
}

self.addEventListener("message", async (event) => {
  if (event.data?.type !== "DOWNLOAD_TILES") return;

  const { bbox, maxZoom = 15, clientId } = event.data;
  const { west, south, east, north } = bbox;

  const cache = await caches.open(TILE_CACHE);
  const allTiles = [];

  // Build tile list for zooms 8 to maxZoom
  for (let z = 8; z <= maxZoom; z++) {
    const tiles = bboxToTiles(west, south, east, north, z);
    tiles.forEach((t) => allTiles.push(t));
  }

  const total = allTiles.length;
  let done = 0;
  const errors = [];

  const client = await self.clients.get(clientId);
  const notify = (extra = {}) => {
    client?.postMessage({
      type: "TILE_PROGRESS",
      done,
      total,
      percent: Math.round((done / total) * 100),
      ...extra,
    });
  };

  notify();

  // Download in batches of 6 (respect rate limits)
  const BATCH = 6;
  for (let i = 0; i < allTiles.length; i += BATCH) {
    const batch = allTiles.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async ({ x, y, z }) => {
        const subdomains = ["a", "b", "c"];
        const sub = subdomains[(x + y) % 3];
        const url = `https://${sub}.tile.openstreetmap.org/${z}/${x}/${y}.png`;
        const req = new Request(url);
        const already = await cache.match(req);
        if (already) {
          done++;
          return;
        }
        try {
          const resp = await fetch(req, { signal: AbortSignal.timeout(8000) });
          if (resp.ok) await cache.put(req, resp);
        } catch {
          errors.push(url);
        } finally {
          done++;
        }
      })
    );
    notify();
  }

  notify({ done: total, complete: true, errorCount: errors.length });
});
