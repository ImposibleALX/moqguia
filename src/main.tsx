/**
 * main.tsx — Punto de entrada de Moquegua Explorer
 *
 * @developers
 *   Reyder Adler Quispe Cori
 *   Erik Gabriel Lopez Flores
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// ── Easter Egg de Consola (solo visible en DevTools) ──────────────────────────
console.log(
  '%c🏔 Moquegua Explorer',
  'color:#C45A3D;font-size:18px;font-weight:900;font-family:Georgia,serif;'
);
console.log(
  '%c  Desarrollado con ❤️  por:\n  · Reyder Adler Quispe Cori\n  · Erik Gabriel Lopez Flores',
  'color:#4A463E;font-size:11px;line-height:1.8;font-family:monospace;'
);
console.log(
  '%c  Moquegua, Perú · v1.0.0',
  'color:#C5A028;font-size:10px;font-style:italic;font-family:monospace;'
);

// ── Service Worker para caché de tiles offline ────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('[SW] Registrado:', reg.scope))
      .catch((err) => console.warn('[SW] Error de registro:', err));
  });
}

// ── Inicialización de plugins nativos de Capacitor ───────────────────────────
// Solo se ejecuta cuando la app corre como APK/AAB nativo en Android
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';

async function initNativePlugins(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  // Import dinámico para no cargar estas dependencias en el browser web
  const { StatusBar, Style } = await import('@capacitor/status-bar');
  const { Keyboard, KeyboardResize } = await import('@capacitor/keyboard');
  const { App } = await import('@capacitor/app');

  // Barra de estado: iconos oscuros sobre el fondo arena, se superpone al contenido
  await StatusBar.setStyle({ style: Style.Dark });
  await StatusBar.setBackgroundColor({ color: '#F6F4EE' });
  await StatusBar.setOverlaysWebView({ overlay: true });

  // Teclado: redimensiona el body (no el viewport) para que el mapa no se deforme
  await Keyboard.setResizeMode({ mode: KeyboardResize.Body });
  await Keyboard.setScroll({ isDisabled: false });

  // Botón atrás de Android: navegar al historial o minimizar (nunca cerrar abruptamente)
  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      // Minimizar la app en lugar de cerrarla — mejor experiencia de usuario
      App.minimizeApp();
    }
  });
}

// Inicializar plugins y luego ocultar el splash con fundido suave
initNativePlugins()
  .catch((err) => console.error('[Capacitor] Error al iniciar plugins:', err))
  .finally(() => {
    // Ocultamos el splash DESPUÉS de que React esté montado y listo
    SplashScreen.hide({ fadeOutDuration: 300 }).catch(() => {
      // Ignorar si no es plataforma nativa
    });
  });

// ── Montar la aplicación React ────────────────────────────────────────────────
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
