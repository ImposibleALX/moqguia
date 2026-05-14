import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import {
  savePlaceMetadata,
  deletePlaceMetadata,
  getSavedPlaceIds,
  fetchAndSaveImage,
  deleteImage,
  downloadMapTiles,
  clearTileCache,
  hasCachedTiles,
} from "@/services/offlineStorage";
import { MOQUEGUA_PLACES } from "@/data/moquegua";

interface OfflineContextType {
  isOfflineMode: boolean;
  isOnline: boolean;
  toggleOfflineMode: () => void;
  downloadedPlaceIds: string[];
  downloadPlace: (id: string, progressCallback: (progress: number) => void) => Promise<void>;
  removeDownload: (id: string) => Promise<void>;
  isDownloaded: (id: string) => boolean;
  mapsDownloaded: boolean;
  downloadMaps: (onProgress: (downloaded: number, total: number) => void) => Promise<void>;
  clearMaps: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [downloadedPlaceIds, setDownloadedPlaceIds] = useState<string[]>([]);
  const [mapsDownloaded, setMapsDownloaded] = useState(false);

  // ── Cargar estado persistido desde IndexedDB al iniciar ──────────────────
  useEffect(() => {
    getSavedPlaceIds().then((ids) => {
      setDownloadedPlaceIds(ids);
    });
    hasCachedTiles().then((has) => {
      setMapsDownloaded(has);
    });
  }, []);

  // ── Monitoreo de conectividad ─────────────────────────────────────────────
  // En plataforma nativa (Android) usamos @capacitor/network que es significativamente
  // más confiable que navigator.onLine dentro del WebView de Android.
  // En web usamos los eventos estándar del navegador como fallback.
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // ── Modo nativo: detección real del estado de red ─────────────────
      let listenerHandle: { remove: () => void } | null = null;

      import("@capacitor/network").then(({ Network }) => {
        // Estado inicial al arrancar la app
        Network.getStatus().then((status) => {
          setIsOnline(status.connected);
          if (!status.connected) setIsOfflineMode(true);
        });

        // Listener de cambios en tiempo real
        Network.addListener("networkStatusChange", (status) => {
          setIsOnline(status.connected);
          // Si se pierde la conexión, activar modo offline automáticamente
          if (!status.connected) setIsOfflineMode(true);
        }).then((handle) => {
          listenerHandle = handle;
        });
      });

      return () => {
        // Limpiar el listener al desmontar para evitar fugas de memoria
        listenerHandle?.remove();
      };
    } else {
      // ── Modo web: eventos estándar del navegador ──────────────────────
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => {
        setIsOnline(false);
        setIsOfflineMode(true);
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      setIsOnline(navigator.onLine);
      if (!navigator.onLine) setIsOfflineMode(true);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  const toggleOfflineMode = useCallback(() => setIsOfflineMode((p) => !p), []);

  // ── Descargar un lugar turístico para uso offline ─────────────────────────
  const downloadPlace = useCallback(
    async (id: string, progressCallback: (p: number) => void): Promise<void> => {
      if (downloadedPlaceIds.includes(id)) {
        progressCallback(100);
        return;
      }

      const place = MOQUEGUA_PLACES.find((p) => p.id === id);
      if (!place) throw new Error(`Lugar no encontrado: ${id}`);

      // Fase 1: Guardar metadatos en IndexedDB (0% → 20%)
      progressCallback(10);
      await savePlaceMetadata(id, place);
      progressCallback(20);

      // Fase 2: Cachear la imagen del lugar en Cache API (20% → 80%)
      await fetchAndSaveImage(id, place.image);
      progressCallback(80);

      // Fase 3: Registrar como descargado (80% → 100%)
      setDownloadedPlaceIds((prev) => {
        if (!prev.includes(id)) return [...prev, id];
        return prev;
      });
      progressCallback(100);
    },
    [downloadedPlaceIds]
  );

  // ── Eliminar un lugar del almacenamiento offline ──────────────────────────
  const removeDownload = useCallback(async (id: string): Promise<void> => {
    await deletePlaceMetadata(id);
    await deleteImage(id);
    setDownloadedPlaceIds((prev) => prev.filter((pId) => pId !== id));
  }, []);

  const isDownloaded = useCallback(
    (id: string) => downloadedPlaceIds.includes(id),
    [downloadedPlaceIds]
  );

  // ── Descargar tiles del mapa para navegación offline ─────────────────────
  const downloadMaps = useCallback(
    async (onProgress: (downloaded: number, total: number) => void): Promise<void> => {
      await downloadMapTiles(onProgress, 8, 14);
      setMapsDownloaded(true);
    },
    []
  );

  const clearMaps = useCallback(async (): Promise<void> => {
    await clearTileCache();
    setMapsDownloaded(false);
  }, []);

  return (
    <OfflineContext.Provider
      value={{
        isOfflineMode,
        isOnline,
        toggleOfflineMode,
        downloadedPlaceIds,
        downloadPlace,
        removeDownload,
        isDownloaded,
        mapsDownloaded,
        downloadMaps,
        clearMaps,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error("useOffline debe usarse dentro de un OfflineProvider");
  }
  return context;
}
