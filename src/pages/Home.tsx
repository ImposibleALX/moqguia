import { Link } from "react-router-dom";
import { MOQUEGUA_PLACES } from "@/data/moquegua";
import { useOffline } from "@/context/OfflineContext";
import { WifiOff, MapPin, HardDriveDownload } from "lucide-react";
import { motion } from "motion/react";

export function Home() {
  const { isOfflineMode, isDownloaded } = useOffline();

  // If in offline mode, only show downloaded places in the feed
  const displayPlaces = isOfflineMode
    ? MOQUEGUA_PLACES.filter((p) => isDownloaded(p.id))
    : MOQUEGUA_PLACES;

  return (
    <div className="min-h-screen bg-sand-100 pb-20">
      <header className="relative px-8 pt-16 pb-12 overflow-hidden shadow-[0_4px_40px_-15px_rgba(0,0,0,0.15)]">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('https://commons.wikimedia.org/wiki/Special:FilePath/Ciudad_de_Moquegua_-_Plaza_de_armas.jpg?width=1200')" }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-sand-100 via-sand-100/80 to-sand-900/40 mix-blend-multiply" />
        
        <div className="absolute top-0 right-0 opacity-[0.05] z-10">
          <MapPin size={180} className="-mr-16 -mt-16 text-white" />
        </div>
        
        <div className="relative z-20">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2"
          >
            <img src="/header.jpg" alt="MoqGuía Offline" className="h-16 object-contain drop-shadow-sm" />
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50 text-sand-800"
          >
            Tierra de sol, pisco y encanto
          </motion.p>
          
          {isOfflineMode && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 flex items-center gap-3 bg-white/80 backdrop-blur-md border border-terracotta-500/20 px-4 py-2 rounded-full w-max shadow-sm"
            >
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-2 h-2 bg-terracotta-500 rounded-full"
              />
              <span className="text-[9px] uppercase font-bold tracking-widest text-terracotta-600">Modo Offline</span>
            </motion.div>
          )}
        </div>
      </header>

      <main className="px-6 py-8 relative">
        <div className="flex justify-between items-end mb-6 px-2">
          <h2 className="text-[10px] uppercase tracking-[0.2em] font-black text-sand-800 opacity-40">
            {isOfflineMode ? "Tus Guías Descargadas" : "Descubre Atractivos"}
          </h2>
        </div>

        {displayPlaces.length === 0 && isOfflineMode ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-6 glass rounded-2xl"
          >
            <HardDriveDownload className="w-10 h-10 text-sand-900 opacity-20 mx-auto mb-4" strokeWidth={1} />
            <h3 className="font-serif text-2xl text-sand-900 mb-2">Aún no hay descargas</h3>
            <p className="text-xs opacity-60 text-sand-800 font-medium leading-relaxed">
              Desactiva el modo offline y descarga lugares para acceder a su mapa e información sin internet.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {displayPlaces.map((place, i) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, type: "spring", stiffness: 100 }}
              >
                <Link
                  to={`/lugar/${place.id}`}
                  className="block group glass rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="relative h-56 w-full overflow-hidden bg-sand-200">
                    <img
                      src={place.image}
                      alt={place.name}
                      className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="glass text-terracotta-600 text-[9px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full shadow-sm">
                        {place.category}
                      </span>
                    </div>
                    {isDownloaded(place.id) && (
                      <div className="absolute top-4 right-4 bg-sand-900/80 backdrop-blur-sm text-sand-50 p-2 rounded-full shadow-sm">
                        <HardDriveDownload size={14} />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-2xl text-sand-900 mb-2 leading-tight group-hover:text-terracotta-600 transition-colors">{place.name}</h3>
                    <p className="text-[11px] opacity-70 text-sand-800 line-clamp-2 leading-relaxed">{place.shortDescription}</p>
                    <div className="mt-6 flex items-center text-[10px] text-terracotta-500 uppercase font-bold tracking-widest space-x-2">
                      <MapPin size={12} strokeWidth={2.5} />
                      <span>{place.altitude} m s.n.m.</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Developer credits — subtle footer, below scroll content */}
      <footer className="px-6 pb-6 pt-2 flex flex-col items-center gap-1 opacity-30">
        <div className="w-8 h-px bg-sand-800 mb-2" />
        <p className="text-[8px] uppercase tracking-[0.25em] font-black text-sand-800">Desarrollado por</p>
        <p className="text-[10px] font-serif italic text-sand-900 text-center leading-snug">
          Reyder Adler Quispe Cori<br />& Erik Gabriel Lopez Flores
        </p>
      </footer>
    </div>
  );
}
