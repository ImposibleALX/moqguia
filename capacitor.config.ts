import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'com.moquegua.explorer',
  appName: 'MoqGuía Offline',
  webDir: 'dist',

  // ─── Configuración específica de Android ──────────────────────────
  android: {
    // NUNCA true en producción — riesgo de ataque MITM
    allowMixedContent: false,
    // Evita que el teclado consuma eventos táctiles del WebView
    captureInput: true,
    // Solo activar en builds de depuración
    webContentsDebuggingEnabled: false,
    // WebView 80+ = mayor compatibilidad con dispositivos antiguos
    minWebViewVersion: 80,
    // Elimina logs en la versión de producción
    loggingBehavior: 'none',
    // User-agent personalizado para diagnóstico en servidores
    appendUserAgent: 'MoqueguaExplorer/1.0',
  },

  // ─── Servidor WebView ─────────────────────────────────────────────
  server: {
    // HTTPS scheme: necesario para Service Workers, Cache API e IndexedDB en Android
    androidScheme: 'https',
    hostname: 'moquegua-explorer.local',
    // Fuerza HTTPS, elimina advertencias de seguridad en Play Store
    cleartext: false,
  },

  // ─── Plugins nativos ──────────────────────────────────────────────
  plugins: {

    // ── Barra de estado ───────────────────────────────────────────
    StatusBar: {
      // Iconos oscuros sobre el fondo claro (arena) de la app
      style: 'DARK',
      backgroundColor: '#00000000', // Transparente para inmersión real
      // CRÍTICO: permite que el contenido se extienda bajo la status bar
      overlaysWebView: true,
    },


    // ── Pantalla de inicio ────────────────────────────────────────
    SplashScreen: {
      // Menos de 2s: recomendado por las políticas de UX de Play Store
      launchShowDuration: 1800,
      // Control manual: ocultamos en main.tsx tras inicializar React
      launchAutoHide: false,
      backgroundColor: '#F6F4EE',
      androidSplashResourceName: 'splash',
      showSpinner: false,
      // Modo inmersivo durante el splash: oculta todas las barras del sistema
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: 'launch_screen', // Usar layout nativo de Android 12+
    },

    // ── Teclado virtual ───────────────────────────────────────────
    Keyboard: {
      // resizeOnFullScreen: teclado se ajusta correctamente en pantallas fullscreen
      resizeOnFullScreen: true,
      resize: KeyboardResize.Body, // Evita que el teclado aplaste el WebView abruptamente
      style: KeyboardStyle.Dark,
    },

    // ── Geolocalización ───────────────────────────────────────────
    Geolocation: {
      // Solo 'location' (FINE) — necesario para GPS de precisión
      permissions: ['location'],
    },
  },
};

export default config;
