/**
 * BottomNav.tsx
 * Moquegua Explorer — Main Navigation Bar
 *
 * @developers
 *   Reyder Adler Quispe Cori
 *   Erik Gabriel Lopez Flores
 */

import { NavLink } from "react-router-dom";
import { Compass, Map as MapIcon, HardDriveDownload, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useState } from "react";
import { AboutModal, VersionBadge } from "./AboutModal";

export function BottomNav() {
  const [showAbout, setShowAbout] = useState(false);

  const navItems = [
    { to: "/", icon: Compass, label: "Explorar" },
    { to: "/mapa", icon: MapIcon, label: "Mapa" },
    { to: "/offline", icon: HardDriveDownload, label: "Offline" },
  ];

  return (
    <>
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />

      {/* Barra de navegación con compensación de safe area para Android */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Premium Glassmorphic Navigation Bar */}
        <div className="glass mx-4 mb-4 rounded-2xl border border-white/60 shadow-lg overflow-hidden relative">
          <div className="flex justify-around items-center h-16 relative">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="relative flex flex-col items-center justify-center w-full h-full space-y-1"
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="bottom-nav-active"
                        className="absolute inset-0 bg-sand-200/50 mix-blend-multiply rounded-xl m-1"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <item.icon
                      className={cn(
                        "w-5 h-5 mb-0.5 relative z-10 transition-colors duration-300",
                        isActive ? "text-terracotta-500" : "text-sand-800 opacity-50"
                      )}
                      strokeWidth={isActive ? 2.5 : 1.5}
                    />
                    <span
                      className={cn(
                        "text-[9px] uppercase tracking-widest font-bold relative z-10 transition-all duration-300",
                        isActive ? "text-terracotta-500" : "text-sand-800 opacity-50"
                      )}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}

            {/* Acerca de — taps abre el modal, taps en versión activa easter egg */}
            <button
              onClick={() => setShowAbout(true)}
              className="relative flex flex-col items-center justify-center w-full h-full space-y-1 group"
              aria-label="Acerca de Moquegua Explorer"
            >
              <Info
                className="w-5 h-5 mb-0.5 text-sand-800 opacity-50 group-active:text-terracotta-500 transition-colors duration-300"
                strokeWidth={1.5}
              />
              <VersionBadge onEasterEgg={() => setShowAbout(true)} />
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
