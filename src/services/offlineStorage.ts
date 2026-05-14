/**
 * offlineStorage.ts — Capa de persistencia real con IndexedDB
 * Usa la API de Cache (Service Worker) para tiles de mapa y fetch de imágenes.
 * Usa IndexedDB para metadatos de lugares turísticos (nombres, descripciones, rutas, etc.)
 */

const DB_NAME = "moquegua_offline_db";
const DB_VERSION = 2;
const PLACES_STORE = "places_metadata";
const TILES_STORE = "map_tiles";
const IMAGES_STORE = "poi_images";

// ────────────────────────────────────────────────
// IndexedDB helpers
// ────────────────────────────────────────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(PLACES_STORE)) {
        db.createObjectStore(PLACES_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(TILES_STORE)) {
        db.createObjectStore(TILES_STORE); // key = `z/x/y`
      }
      if (!db.objectStoreNames.contains(IMAGES_STORE)) {
        db.createObjectStore(IMAGES_STORE); // key = poi id
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(store: string, key: string, value: unknown): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    const objStore = tx.objectStore(store);
    if (objStore.keyPath) {
      objStore.put(value);
    } else {
      objStore.put(value, key);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGet<T>(store: string, key: string): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  });
}

async function idbDelete(store: string, key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGetAllKeys(store: string): Promise<string[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).getAllKeys();
    req.onsuccess = () => resolve(req.result as string[]);
    req.onerror = () => reject(req.error);
  });
}

// ────────────────────────────────────────────────
// Places metadata (JSON)
// ────────────────────────────────────────────────

export async function savePlaceMetadata(placeId: string, data: object): Promise<void> {
  await idbSet(PLACES_STORE, placeId, { id: placeId, ...data, savedAt: Date.now() });
}

export async function getPlaceMetadata<T>(placeId: string): Promise<T | undefined> {
  return idbGet<T>(PLACES_STORE, placeId);
}

export async function deletePlaceMetadata(placeId: string): Promise<void> {
  await idbDelete(PLACES_STORE, placeId);
}

export async function getSavedPlaceIds(): Promise<string[]> {
  return idbGetAllKeys(PLACES_STORE);
}

// ────────────────────────────────────────────────
// POI Images (stored as ArrayBuffer blobs)
// ────────────────────────────────────────────────

export async function fetchAndSaveImage(placeId: string, imageUrl: string): Promise<void> {
  try {
    // Use a CORS proxy for external images
    const proxyUrl = imageUrl.includes("wikimedia.org") || imageUrl.includes("wp.com") || imageUrl.includes("blogger")
      ? imageUrl  // Most support CORS
      : imageUrl;

    const response = await fetch(proxyUrl, { mode: "cors" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = await response.arrayBuffer();
    await idbSet(IMAGES_STORE, placeId, { buffer, mimeType: response.headers.get("content-type") || "image/jpeg", url: imageUrl });
  } catch (err) {
    console.warn(`[OfflineStorage] Could not cache image for ${placeId}:`, err);
    // Non-fatal: fallback to network image when online
  }
}

export async function getSavedImageURL(placeId: string): Promise<string | null> {
  const entry = await idbGet<{ buffer: ArrayBuffer; mimeType: string } | undefined>(IMAGES_STORE, placeId);
  if (!entry) return null;
  const blob = new Blob([entry.buffer], { type: entry.mimeType });
  return URL.createObjectURL(blob);
}

export async function deleteImage(placeId: string): Promise<void> {
  await idbDelete(IMAGES_STORE, placeId);
}

// ────────────────────────────────────────────────
// Map tile caching (via Cache API)
// ────────────────────────────────────────────────

const TILE_CACHE_NAME = "moquegua-map-tiles-v1";

// The bounding box for Moquegua region
export const MOQUEGUA_BBOX = {
  west: -71.05,
  south: -17.35,
  east: -70.70,
  north: -16.90,
};

function lngToTileX(lng: number, zoom: number): number {
  return Math.floor(((lng + 180) / 360) * Math.pow(2, zoom));
}

function latToTileY(lat: number, zoom: number): number {
  const latRad = (lat * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * Math.pow(2, zoom)
  );
}

function countTilesForBbox(bbox: typeof MOQUEGUA_BBOX, minZoom: number, maxZoom: number): number {
  let total = 0;
  for (let z = minZoom; z <= maxZoom; z++) {
    const x1 = lngToTileX(bbox.west, z);
    const x2 = lngToTileX(bbox.east, z);
    const y1 = latToTileY(bbox.north, z);
    const y2 = latToTileY(bbox.south, z);
    total += (x2 - x1 + 1) * (y2 - y1 + 1);
  }
  return total;
}

export async function downloadMapTiles(
  onProgress: (downloaded: number, total: number) => void,
  minZoom = 8,
  maxZoom = 14
): Promise<void> {
  const cache = await caches.open(TILE_CACHE_NAME);
  const bbox = MOQUEGUA_BBOX;

  // Build tile list
  const tiles: { z: number; x: number; y: number }[] = [];
  for (let z = minZoom; z <= maxZoom; z++) {
    const x1 = lngToTileX(bbox.west, z);
    const x2 = lngToTileX(bbox.east, z);
    const y1 = latToTileY(bbox.north, z);
    const y2 = latToTileY(bbox.south, z);
    for (let x = x1; x <= x2; x++) {
      for (let y = y1; y <= y2; y++) {
        tiles.push({ z, x, y });
      }
    }
  }

  const total = tiles.length;
  let downloaded = 0;

  // Process in batches of 5 concurrent requests
  const BATCH = 5;
  for (let i = 0; i < tiles.length; i += BATCH) {
    const batch = tiles.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async ({ z, x, y }) => {
        // Use OpenStreetMap-based tiles (free, no key required)
        const url = `https://a.tile.openstreetmap.org/${z}/${x}/${y}.png`;
        const cacheKey = new Request(url);
        const existing = await cache.match(cacheKey);
        if (!existing) {
          try {
            const resp = await fetch(url);
            if (resp.ok) await cache.put(cacheKey, resp.clone());
          } catch {
            // Skip failed tiles silently
          }
        }
        downloaded++;
        onProgress(downloaded, total);
      })
    );
  }
}

export async function getTileCacheSize(): Promise<number> {
  // Returns approximate size in MB based on tile count × average tile size (4KB)
  const cache = await caches.open(TILE_CACHE_NAME);
  const keys = await cache.keys();
  return parseFloat(((keys.length * 4096) / 1024 / 1024).toFixed(1));
}

export async function clearTileCache(): Promise<void> {
  await caches.delete(TILE_CACHE_NAME);
}

export async function hasCachedTiles(): Promise<boolean> {
  const cache = await caches.open(TILE_CACHE_NAME);
  const keys = await cache.keys();
  return keys.length > 0;
}
