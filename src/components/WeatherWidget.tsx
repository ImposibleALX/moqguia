import { useEffect, useState } from "react";
import { fetchMoqueguaWeather, MoqueguaWeather } from "@/services/weather";
import { motion, AnimatePresence } from "motion/react";
import { CloudRainWind, ThermometerSun, AlertTriangle } from "lucide-react";

export function WeatherWidget() {
  const [weather, setWeather] = useState<MoqueguaWeather | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchMoqueguaWeather()
      .then((data) => {
        if (mounted) {
          setWeather(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading || !weather) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl px-3 py-2 flex items-center gap-3 shadow-sm"
      >
        <div className="flex flex-col items-center justify-center bg-sand-900/5 rounded-full w-8 h-8">
          <span className="text-sm">{weather.emoji}</span>
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <ThermometerSun size={10} className="text-terracotta-500" />
            <span className="text-xs font-bold text-sand-900 leading-none">
              {weather.tempC}°C
            </span>
          </div>
          <span className="text-[8px] uppercase tracking-widest text-sand-800 opacity-60 mt-0.5">
            Sensación {weather.feelsLikeC}°C
          </span>
        </div>

        <div className="w-px h-6 bg-sand-900/10 mx-1" />

        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <CloudRainWind size={10} className="text-blue-500" />
            <span className="text-[10px] font-mono text-sand-900 leading-none">
              {weather.windKmph} <span className="text-[8px]">km/h</span>
            </span>
          </div>
          <span className="text-[8px] uppercase tracking-widest text-sand-800 opacity-60 mt-0.5">
            Humedad {weather.humidity}%
          </span>
        </div>

        {weather.isAlertWorthy && (
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="ml-1 bg-red-500/10 p-1.5 rounded-full"
            title="Alerta: Condiciones extremas en zonas altas (Cerro Baúl)"
          >
            <AlertTriangle size={12} className="text-red-600" />
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
