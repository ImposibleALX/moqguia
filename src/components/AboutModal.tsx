/**
 * AboutModal.tsx
 * Moquegua Explorer — Credits & Developer Info
 *
 * @developers
 *   Reyder Adler Quispe Cori
 *   Erik Gabriel Lopez Flores
 */

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Heart, Code2, Smartphone, Star } from "lucide-react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEVELOPERS = [
  {
    name: "Reyder Adler Quispe Cori",
    role: "Desarrollador Principal",
    initials: "RA",
    color: "from-terracotta-500 to-terracotta-600",
  },
  {
    name: "Erik Gabriel Lopez Flores",
    role: "Desarrollador Frontend",
    initials: "EG",
    color: "from-gold-400 to-gold-500",
  },
];

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-sand-900/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto"
          >
            <div className="bg-sand-50 rounded-t-3xl shadow-2xl overflow-hidden">
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-sand-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-sand-200/60">
                <div>
                  <h2 className="font-serif italic text-2xl text-sand-900 leading-tight">
                    Moquegua Explorer
                  </h2>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-sand-800 opacity-40 mt-0.5">
                    Versión 1.0.0 · Moquegua, Perú
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-sand-200/60 flex items-center justify-center text-sand-800 active:scale-90 transition-transform"
                  aria-label="Cerrar"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="px-6 py-5 space-y-5 pb-8">
                {/* App description */}
                <p className="text-xs text-sand-800 opacity-60 leading-relaxed">
                  Guía turística digital de la región Moquegua con funcionalidad
                  offline, mapas interactivos y rutas en tiempo real.
                </p>

                {/* Developers card */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Code2 size={12} className="text-terracotta-500" />
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-sand-800 opacity-50">
                      Equipo de Desarrollo
                    </p>
                  </div>

                  <div className="space-y-3">
                    {DEVELOPERS.map((dev, i) => (
                      <motion.div
                        key={dev.name}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 + 0.2 }}
                        className="glass rounded-2xl p-4 flex items-center gap-4"
                      >
                        {/* Avatar */}
                        <div
                          className={`w-11 h-11 rounded-full bg-gradient-to-br ${dev.color} flex items-center justify-center flex-shrink-0 shadow-md`}
                        >
                          <span className="text-white text-xs font-black tracking-wide">
                            {dev.initials}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-sand-900 leading-tight truncate">
                            {dev.name}
                          </p>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-terracotta-500 mt-0.5">
                            {dev.role}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Footer branding */}
                <div className="flex items-center justify-center gap-1.5 pt-2 opacity-40">
                  <Smartphone size={11} className="text-sand-800" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-sand-800">
                    Hecho con
                  </p>
                  <Heart size={10} className="text-terracotta-500 fill-terracotta-500" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-sand-800">
                    en Moquegua
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Easter Egg: Version Tap Counter ────────────────────────────────────────
interface VersionBadgeProps {
  onEasterEgg?: () => void;
}

export function VersionBadge({ onEasterEgg }: VersionBadgeProps) {
  const [taps, setTaps] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTap = () => {
    const next = taps + 1;
    setTaps(next);

    // Reset tap counter after 1.5s of inactivity
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setTaps(0), 1500);

    if (next >= 5) {
      setTaps(0);
      setShowToast(true);
      onEasterEgg?.();
      setTimeout(() => setShowToast(false), 3500);
    }
  };

  return (
    <div className="relative inline-flex flex-col items-center">
      <button
        onClick={handleTap}
        className="text-[9px] font-mono tracking-widest text-sand-800 opacity-30 hover:opacity-50 transition-opacity active:scale-95 select-none"
        aria-label="Versión de la aplicación"
      >
        v1.0.0
      </button>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.9 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 glass rounded-xl px-4 py-2.5 shadow-lg border border-terracotta-500/20 whitespace-nowrap z-50"
          >
            <div className="flex items-center gap-1.5">
              <Star size={10} className="text-gold-500 fill-gold-400" />
              <p className="text-[10px] font-bold text-sand-900 tracking-wide">
                ¡Gracias de parte de Reyder & Erik! 🙏
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
