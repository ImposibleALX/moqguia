import { useOffline } from "@/context/OfflineContext";
import { MOQUEGUA_PLACES } from "@/data/moquegua";
import { Link } from "react-router-dom";
import { HardDriveDownload, Trash2, WifiOff, Wifi, CheckCircle2, Download } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function OfflinePage() {
  const { isOfflineMode, toggleOfflineMode, downloadedPlaceIds, removeDownload, downloadPlace, isDownloaded } = useOffline();
  const [downloadingIds, setDownloadingIds] = useState<Record<string, number>>({});

  const downloadedPlaces = MOQUEGUA_PLACES.filter(p => downloadedPlaceIds.includes(p.id));
  const notDownloaded = MOQUEGUA_PLACES.filter(p => !downloadedPlaceIds.includes(p.id));
  const totalSize = downloadedPlaces.reduce((acc, place) => acc + parseFloat(place.offlineDataSize || "0"), 0).toFixed(1);

  const handleDownload = async (id: string) => {
    setDownloadingIds(prev => ({ ...prev, [id]: 0 }));
    try {
      await downloadPlace(id, (p) => {
        setDownloadingIds(prev => ({ ...prev, [id]: p }));
      });
    } finally {
      setDownloadingIds(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-sand-100 pb-24">
      {/* Header */}
      <header className="bg-sand-50 px-8 pt-12 pb-10 border-b border-sand-900/5 shadow-[0_4px_40px_-15px_rgba(0,0,0,0.05)]">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif italic text-4xl tracking-tight text-sand-900 mb-2"
        >
          Viaje Offline.
        </motion.h1>
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50 text-sand-800">
          Descarga guías · Explora sin internet
        </p>
      </header>

      <main className="px-6 py-8 space-y-8">

        {/* ---- MODE TOGGLE ---- */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "rounded-2xl p-5 flex items-center justify-between border-l-4 shadow-sm transition-colors",
            isOfflineMode
              ? "bg-sand-900 text-sand-50 border-terracotta-500"
              : "bg-white text-sand-900 border-sand-300"
          )}
        >
          <div className="flex items-start gap-4">
            <div className={cn("mt-0.5 flex-shrink-0", isOfflineMode ? "text-terracotta-400" : "text-sand-800")}>
              {isOfflineMode ? <WifiOff size={20} /> : <Wifi size={20} />}
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide uppercase mb-0.5">
                {isOfflineMode ? "Modo Offline Activo" : "Conexión en línea"}
              </h3>
              <p className={cn("text-[10px] uppercase tracking-widest", isOfflineMode ? "text-sand-300" : "text-sand-800 opacity-60")}>
                {isOfflineMode ? "Solo guías descargadas visibles" : "Toca para simular modo sin internet"}
              </p>
            </div>
          </div>
          {/* Toggle switch */}
          <button
            onClick={toggleOfflineMode}
            className={cn(
              "relative inline-flex h-7 w-14 items-center rounded-full border transition-colors flex-shrink-0",
              isOfflineMode ? "bg-terracotta-500 border-terracotta-600" : "bg-sand-200 border-sand-300"
            )}
            aria-label="Alternar modo offline"
          >
            <motion.span
              animate={{ x: isOfflineMode ? 30 : 4 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="inline-block h-5 w-5 rounded-full bg-white shadow-md"
            />
          </button>
        </motion.div>

        {/* ---- STORAGE STATS ---- */}
        {downloadedPlaces.length > 0 && (
          <div className="glass rounded-2xl px-5 py-4 flex justify-between items-center">
            <div>
              <p className="text-[9px] uppercase tracking-widest font-bold opacity-50 mb-0.5">Caché local</p>
              <p className="font-serif text-2xl text-sand-900">{totalSize} <span className="text-sm font-sans opacity-40">MB</span></p>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-widest font-bold opacity-50 mb-0.5">Lugares guardados</p>
              <p className="font-serif text-2xl text-terracotta-500">{downloadedPlaces.length}</p>
            </div>
          </div>
        )}

        {/* ---- DOWNLOADED PLACES ---- */}
        {downloadedPlaces.length > 0 && (
          <section>
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-black text-sand-800 opacity-50 mb-4">
              Guías Descargadas
            </h2>
            <div className="space-y-3">
              <AnimatePresence>
                {downloadedPlaces.map((place, i) => (
                  <motion.div
                    key={place.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12, height: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="glass rounded-2xl flex items-center overflow-hidden"
                  >
                    <div className="w-16 h-16 flex-shrink-0 relative overflow-hidden bg-sand-200">
                      <img src={place.image} alt={place.name} className="absolute inset-0 w-full h-full object-cover opacity-90" style={{ filter: "saturate(0.8)" }} />
                    </div>
                    <Link to={`/lugar/${place.id}`} className="flex-1 px-4 py-3">
                      <p className="text-[8px] uppercase font-bold text-terracotta-500 tracking-widest mb-0.5">{place.category}</p>
                      <h4 className="text-sm font-bold text-sand-900 leading-tight">{place.name}</h4>
                      <p className="text-[9px] font-mono text-sand-800 opacity-50 mt-0.5">{place.offlineDataSize} MB · GUARDADO</p>
                    </Link>
                    <div className="pr-3 flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-green-500" />
                      <button
                        onClick={() => removeDownload(place.id)}
                        className="p-2 text-sand-800 opacity-30 hover:opacity-80 hover:text-terracotta-500 transition-all rounded-full"
                        aria-label={`Eliminar ${place.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* ---- PLACES TO DOWNLOAD ---- */}
        {notDownloaded.length > 0 && (
          <section>
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-black text-sand-800 opacity-50 mb-4">
              Disponibles para Descargar
            </h2>
            <div className="space-y-3">
              {notDownloaded.map((place, i) => {
                const prog = downloadingIds[place.id];
                const isLoading = prog !== undefined;

                return (
                  <motion.div
                    key={place.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="glass rounded-2xl flex items-center overflow-hidden"
                  >
                    <div className="w-16 h-16 flex-shrink-0 relative overflow-hidden bg-sand-200">
                      <img src={place.image} alt={place.name} className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale" />
                    </div>
                    <div className="flex-1 px-4 py-3">
                      <p className="text-[8px] uppercase font-bold text-sand-800 opacity-50 tracking-widest mb-0.5">{place.category}</p>
                      <h4 className="text-sm font-bold text-sand-900 leading-tight">{place.name}</h4>
                      {isLoading ? (
                        <div className="mt-1.5">
                          <div className="w-full h-1 bg-sand-200 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-terracotta-500 rounded-full"
                              animate={{ width: `${prog}%` }}
                              transition={{ ease: "linear" }}
                            />
                          </div>
                          <p className="text-[8px] font-mono text-terracotta-500 mt-0.5">{prog}%…</p>
                        </div>
                      ) : (
                        <p className="text-[9px] font-mono text-sand-800 opacity-40 mt-0.5">{place.offlineDataSize} MB</p>
                      )}
                    </div>
                    <div className="pr-3">
                      <button
                        onClick={() => handleDownload(place.id)}
                        disabled={isLoading || isOfflineMode}
                        className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90",
                          isLoading
                            ? "bg-sand-200 text-sand-800 opacity-50"
                            : isOfflineMode
                              ? "bg-sand-200 text-sand-800 opacity-30 cursor-not-allowed"
                              : "bg-terracotta-500 text-white shadow-md hover:bg-terracotta-600"
                        )}
                        aria-label={`Descargar ${place.name}`}
                      >
                        {isLoading
                          ? <div className="w-4 h-4 border-2 border-sand-800/30 border-t-terracotta-500 rounded-full animate-spin" />
                          : <Download size={14} />
                        }
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Empty state */}
        {downloadedPlaces.length === 0 && notDownloaded.length === 0 && (
          <div className="text-center py-16 glass rounded-2xl">
            <HardDriveDownload className="w-10 h-10 text-sand-900 opacity-20 mx-auto mb-4" strokeWidth={1} />
            <p className="text-sm font-bold text-sand-800 opacity-40">No hay lugares disponibles.</p>
          </div>
        )}

        {/* Developer credits card — premium version */}
        <div className="glass rounded-2xl p-5 text-center space-y-3">
          <p className="text-[9px] uppercase tracking-[0.25em] font-black text-sand-800 opacity-40">
            Equipo de desarrollo
          </p>
          <div className="flex justify-center gap-3">
            {/* Reyder */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-terracotta-500 to-terracotta-600 flex items-center justify-center shadow-md">
                <span className="text-white text-[10px] font-black">RA</span>
              </div>
              <p className="text-[9px] font-bold text-sand-900 leading-tight text-center max-w-[80px]">
                Reyder Adler<br />
                <span className="font-normal opacity-60">Quispe Cori</span>
              </p>
            </div>
            {/* divider */}
            <div className="w-px bg-sand-300 self-stretch mx-1" />
            {/* Erik */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center shadow-md">
                <span className="text-white text-[10px] font-black">EG</span>
              </div>
              <p className="text-[9px] font-bold text-sand-900 leading-tight text-center max-w-[80px]">
                Erik Gabriel<br />
                <span className="font-normal opacity-60">Lopez Flores</span>
              </p>
            </div>
          </div>
          <p className="text-[8px] font-mono tracking-widest text-sand-800 opacity-25 pt-1">v1.0.0 · Moquegua, Perú</p>
        </div>
      </main>
    </div>
  );
}
