import { useParams, useNavigate } from "react-router-dom";
import { MOQUEGUA_PLACES } from "@/data/moquegua";
import { useOffline } from "@/context/OfflineContext";
import { useState } from "react";
import { ChevronLeft, Headphones, Map, Download, CheckCircle, WifiOff, HardDriveDownload } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { downloadPlace, isDownloaded, removeDownload, isOfflineMode } = useOffline();
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const place = MOQUEGUA_PLACES.find((p) => p.id === id);

  if (!place) return <div className="p-8 text-center text-sand-900 h-screen flex items-center justify-center">Lugar no encontrado</div>;

  const downloaded = isDownloaded(place.id);

  const handleDownload = async () => {
    if (downloaded) {
      if (confirm("¿Deseas eliminar este lugar de tus descargas?")) {
        removeDownload(place.id);
      }
      return;
    }
    
    setIsDownloading(true);
    setDownloadProgress(0);
    try {
      await downloadPlace(place.id, (p) => {
        setDownloadProgress(p);
      });
    } catch (e) {
      console.error(e);
      alert("Error en la descarga. Intente nuevamente.");
    } finally {
      setTimeout(() => setIsDownloading(false), 500);
    }
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    "name": place.name,
    "description": place.description,
    "image": place.image,
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": place.latitude,
      "longitude": place.longitude
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 pb-24">
      {/* JSON-LD Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero Image */}
      <div className="relative h-[45vh] w-full border-b border-sand-900/10 shadow-sm overflow-hidden">
        <img src={place.image} alt={place.name} className="w-full h-full object-cover grayscale-[0.2]" />
        <div className="absolute inset-0 bg-gradient-to-t from-sand-900/90 via-sand-900/40 to-transparent mix-blend-multiply" />
        
        {/* Top actions */}
        <div className="absolute top-safe pt-6 px-6 left-0 w-full flex justify-between items-center z-10">
          <button 
            onClick={() => navigate(-1)}
            className="glass-dark p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Title area */}
        <div className="absolute bottom-0 left-0 w-full p-8 text-sand-50 text-left">
          <span className="inline-block text-[10px] uppercase font-bold tracking-widest text-terracotta-400 mb-3 glass-dark px-2 py-0.5 rounded">
            {place.category}
          </span>
          <h1 className="font-serif italic text-5xl leading-[0.9] text-white text-balance">{place.name}</h1>
          <p className="opacity-80 mt-4 flex items-center text-[11px] uppercase tracking-widest font-semibold text-sand-200">
            <Map size={12} className="mr-2 text-terracotta-400" /> {place.altitude} M S.N.M.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 border-b border-sand-900/10 bg-white">
        
        {/* Download Action */}
        <div className="bg-sand-900 text-sand-50 p-6 flex flex-col gap-4 mb-8 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-5">
            <HardDriveDownload size={150} />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-1">
              <span className="text-[9px] uppercase tracking-widest opacity-60">Status de Data</span>
              <span className="text-[10px] bg-terracotta-500 text-white px-2 py-0.5 rounded-full font-bold shadow-sm">{place.offlineDataSize} MB</span>
            </div>
            <h4 className="font-serif text-2xl text-sand-50">Disponible Offline</h4>
            <p className="text-[11px] opacity-70 mt-1 leading-snug">
              Mapa topográfico en caché, rutas conservadas localmente y audios.
            </p>
          </div>
          
          <div className="flex justify-end pt-4 border-t border-white/10 relative z-10">
          {isDownloading ? (
            <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full">
              <div className="text-[10px] font-mono tracking-widest">DESCARGANDO {downloadProgress}%</div>
              <div className="w-4 h-4 border-2 border-terracotta-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <button
              onClick={handleDownload}
              disabled={isOfflineMode}
              className={cn(
                "px-5 py-2.5 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 transition-all rounded-full shadow-sm",
                downloaded 
                  ? "bg-sand-50 text-sand-900 border border-sand-900/10" 
                  : isOfflineMode 
                    ? "bg-white/10 text-white/40 cursor-not-allowed"
                    : "bg-terracotta-500 text-white hover:bg-terracotta-600 hover:shadow-md hover:-translate-y-0.5"
              )}
            >
              {downloaded ? (
                <><CheckCircle size={14} className="text-green-600" /> DESCARGADO</>
              ) : (
                <><Download size={14} /> DESCARGAR AHORA</>
              )}
            </button>
          )}
          </div>
        </div>

        {/* Offline Warning */}
        {isOfflineMode && !downloaded && (
          <div className="bg-sand-100 text-terracotta-600 p-4 border-l-2 border-terracotta-500 mb-8 flex items-start text-[11px] uppercase font-bold tracking-wide rounded-r-lg">
            <WifiOff className="shrink-0 mr-3 mt-0.5" size={16} />
            <p className="leading-snug">Estás en modo offline y no has descargado este lugar. Parte del contenido no estará disponible.</p>
          </div>
        )}

        <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-sand-800 opacity-50 mb-4">Sobre este lugar</h3>
        <p className="text-sand-900 opacity-90 leading-relaxed text-[15px] font-medium text-balance mb-6">
          {place.fullDescription || place.description}
        </p>

        {place.culturalSignificance && (
          <div className="bg-terracotta-50/50 p-4 border-l-2 border-terracotta-500 mb-6 rounded-r-lg">
            <h4 className="text-[9px] uppercase tracking-widest font-black text-terracotta-600 mb-2">Significado Cultural</h4>
            <p className="text-sand-900 opacity-80 text-sm leading-relaxed">{place.culturalSignificance}</p>
          </div>
        )}

        {place.practicalInfo && (
          <div className="grid grid-cols-3 gap-2 mb-8">
            <div className="bg-white p-3 border border-sand-900/10 rounded-xl text-center">
              <span className="block text-[8px] uppercase tracking-widest opacity-50 text-sand-800 mb-1">Mejor Hora</span>
              <span className="text-xs font-bold text-sand-900 leading-tight">{place.practicalInfo.bestTimeToVisit}</span>
            </div>
            <div className="bg-white p-3 border border-sand-900/10 rounded-xl text-center flex flex-col justify-center">
              <span className="block text-[8px] uppercase tracking-widest opacity-50 text-sand-800 mb-1">Entrada</span>
              <span className="text-xs font-bold text-sand-900">{place.practicalInfo.entryFee === "0" ? "Gratis" : `S/ ${place.practicalInfo.entryFee}`}</span>
            </div>
            <div className="bg-white p-3 border border-sand-900/10 rounded-xl text-center flex flex-col justify-center">
              <span className="block text-[8px] uppercase tracking-widest opacity-50 text-sand-800 mb-1">Dificultad</span>
              <span className="text-xs font-bold text-sand-900">{place.practicalInfo.difficulty}</span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Features */}
      <div className="px-6 py-8 border-t border-sand-900/5">
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-sand-800 opacity-50 mb-6">Experiencia Interactiva</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/mapa')}
            className="flex flex-col items-start p-5 bg-white border border-sand-900/10 hover:border-terracotta-500/30 hover:shadow-md transition-all rounded-2xl group"
          >
            <div className={cn("mb-4 transition-colors", downloaded ? 'text-terracotta-500' : 'text-sand-900/30 group-hover:text-terracotta-400')}>
              <Map size={24} strokeWidth={1.5} />
            </div>
            <span className="text-sm font-bold text-sand-900 leading-tight mb-1 flex-1 text-left">Ver en Mapa</span>
            <span className="text-[9px] uppercase tracking-widest opacity-50 mt-auto pt-2 text-sand-800">{downloaded ? 'Offline Listo' : 'Requiere Descarga'}</span>
          </button>
          
          <button className={cn(
            "flex flex-col items-start p-5 bg-white border transition-all rounded-2xl group",
            !place.audioGuideScript ? 'opacity-40 border-sand-900/10 cursor-not-allowed' : 'border-sand-900/10 hover:border-terracotta-500/30 hover:shadow-md'
          )}>
            <div className={cn("mb-4 transition-colors", downloaded ? 'text-terracotta-500' : 'text-sand-900/30', place.audioGuideScript && 'group-hover:text-terracotta-400')}>
              <Headphones size={24} strokeWidth={1.5} />
            </div>
            <span className="text-sm font-bold text-sand-900 leading-tight mb-1 flex-1 text-left">Audioguía Inteligente</span>
            <span className="text-[9px] uppercase tracking-widest opacity-50 mt-auto pt-2 text-sand-800">{!place.audioGuideScript ? 'No disp.' : downloaded ? 'Offline Listo' : 'Reg. Descarga'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
