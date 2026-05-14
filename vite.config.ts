import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isProduction = mode === 'production';

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      // ── División de bundles (chunking estratégico) ─────────────────────
      // Separa las dependencias pesadas en chunks independientes.
      // El navegador los carga en paralelo y los cachea por separado.
      rollupOptions: {
        output: {
          manualChunks: {
            // MapLibre pesa ~500KB: se carga solo cuando el usuario va al mapa
            'maplibre': ['maplibre-gl'],
            // Núcleo de React: se cachea entre versiones de la app
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            // Animaciones: chunk separado para páginas sin animaciones
            'motion': ['motion'],
          },
        },
      },
      // Alerta si algún chunk supera 600KB (señal de bundle inflado)
      chunkSizeWarningLimit: 600,

      // ── Minificación con Terser ────────────────────────────────────────
      // Terser es más agresivo que esbuild: reduce más el tamaño del APK
      minify: isProduction ? 'terser' : 'esbuild',
      terserOptions: isProduction ? {
        compress: {
          // Eliminar todos los logs en producción (reduce tamaño y evita fugas de info)
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.warn', 'console.error', 'console.info'],
        },
        mangle: {
          // Ofuscar nombres de variables (dificulta ingeniería inversa)
          safari10: false,
        },
      } : undefined,

      // ── Configuración de assets ────────────────────────────────────────
      // Imágenes < 2KB se incrustan como base64 (evita requests HTTP extra)
      assetsInlineLimit: 2048,
      // Sin sourcemaps en producción (reduce tamaño del APK ~30%)
      sourcemap: false,
      // Target ES2020: compatible con Android WebView 90+ (Chrome 85+)
      target: 'es2020',
    },
    server: {
      // HMR deshabilitado si así lo configura el entorno de desarrollo
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
