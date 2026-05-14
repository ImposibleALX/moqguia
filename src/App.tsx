/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { SplashScreen } from '@capacitor/splash-screen';
import { OfflineProvider } from "./context/OfflineContext";
import { BottomNav } from "./components/BottomNav";
import { Home } from "./pages/Home";
import { PlaceDetail } from "./pages/PlaceDetail";
import { OfflinePage } from "./pages/OfflinePage";

// ── Custom Hooks para Native UI ───────────────────────────────────────────────
function useHardwareBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    
    const sub = CapacitorApp.addListener('backButton', () => {
      if (location.pathname === '/' || location.pathname === '/home') {
        CapacitorApp.exitApp();
      } else {
        navigate(-1);
      }
    });
    
    // addListener devuelve una Promesa con el objeto listener
    let listenerRef: any = null;
    sub.then(listener => { listenerRef = listener; });

    return () => {
      if (listenerRef) listenerRef.remove();
      else sub.then(listener => listener.remove());
    };
  }, [navigate, location]);
}

function useNativeUI() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setOverlaysWebView({ overlay: true }).catch(console.error);
      StatusBar.setStyle({ style: Style.Dark }).catch(console.error);
      
      Keyboard.setAccessoryBarVisible({ isVisible: false }).catch(console.error);
      
      const showSub = Keyboard.addListener('keyboardWillShow', () => {
        document.body.classList.add('keyboard-is-open');
      });
      const hideSub = Keyboard.addListener('keyboardWillHide', () => {
        document.body.classList.remove('keyboard-is-open');
      });
      
      SplashScreen.hide().catch(console.error);

      return () => {
        showSub.then(sub => sub.remove());
        hideSub.then(sub => sub.remove());
      };
    }
  }, []);
}

// ── Carga diferida del MapPage ────────────────────────────────────────────────
// MapLibre GL pesa ~500KB. Con lazy() ese bundle solo se descarga cuando
// el usuario navega a la pestaña "Mapa", mejorando el tiempo de arranque
// en dispositivos de gama baja hasta un 40%.
const MapPage = lazy(() =>
  import("./pages/MapPage").then((m) => ({ default: m.MapPage }))
);

// Pantalla de carga mientras se inicializa el mapa
function MapLoadingFallback() {
  return (
    <div className="fixed inset-0 bg-sand-200 flex flex-col items-center justify-center gap-4">
      <div className="skeleton-shimmer w-full h-full absolute inset-0 opacity-50" />
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-terracotta-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[9px] uppercase tracking-widest font-bold text-sand-800 opacity-60">
          Cargando mapa…
        </p>
      </div>
    </div>
  );
}

// Wrapper que elimina el shell de ancho máximo para la página de mapa completa
function AppShell() {
  const location = useLocation();
  const isMapPage = location.pathname === "/mapa";

  useHardwareBackButton();
  useNativeUI();

  if (isMapPage) {
    return (
      // El mapa ocupa todo el viewport sin restricciones de contenedor
      <div className="fixed inset-0 bg-sand-900 font-sans select-none">
        <Suspense fallback={<MapLoadingFallback />}>
          <MapPage />
        </Suspense>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-sand-100 text-sand-900 min-h-screen border-x border-sand-900/10 relative font-sans select-none pb-24">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lugar/:id" element={<PlaceDetail />} />
        <Route path="/offline" element={<OfflinePage />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <OfflineProvider>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<AppShell />} />
        </Routes>
      </BrowserRouter>
    </OfflineProvider>
  );
}
