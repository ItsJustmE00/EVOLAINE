import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

// Chargement des variables d'environnement
const env = loadEnv('all', process.cwd(), '');

// Configuration pour le mode développement et production
const isDevelopment = env.VITE_APP_ENV === 'development' || env.NODE_ENV === 'development';
const isProduction = env.VITE_APP_ENV === 'production' || env.NODE_ENV === 'production';
const apiUrl = isDevelopment 
  ? 'http://localhost:3004' 
  : 'https://evolaine-backend.onrender.com';

// Log des variables d'environnement pour le débogage
console.log('Mode:', isProduction ? 'Production' : 'Développement');
console.log('API URL:', apiUrl);
console.log('Meta Pixel ID:', env.VITE_META_PIXEL_ID || 'Non défini');
console.log('Analytics activé:', env.VITE_ENABLE_ANALYTICS || 'false');

export default defineConfig({
  plugins: [react()],
  // Configuration de base pour les chemins d'accès
  base: isProduction ? '/' : '/',
  
  // Configuration du build
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: isDevelopment,
    minify: isProduction ? 'esbuild' : false,
    emptyOutDir: true,
    // Configuration pour éviter les problèmes de routage
    manifest: true,
    // Configuration pour le chargement des assets
    assetsInlineLimit: 0,
    // Configuration pour le build
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      }
    },
    // Configuration pour le support SPA (Single Page Application)
    target: 'esnext',
    modulePreload: {
      polyfill: false,
    },
    // Activer le code splitting
    cssCodeSplit: true
  },

  // Configuration du serveur de développement
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
    open: true,
    // Configuration du système de fichiers
    fs: {
      strict: false,
      allow: ['..']
    },
    // Configuration des en-têtes
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
    // Configuration du proxy pour le développement
    proxy: isDevelopment ? {
      // Redirection des requêtes API vers le serveur backend en développement
      '/api': {
        target: apiUrl,
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path,
        configure: (proxy, _options) => {
          proxy.on('error', (err: Error) => {
            console.error('Erreur du proxy:', err);
          });
          proxy.on('proxyReq', (proxyReq) => {
            console.log('Requête proxy vers:', proxyReq.method, proxyReq.path);
            // Forcer les en-têtes pour éviter les problèmes CORS
            proxyReq.setHeader('host', new URL(apiUrl).host);
            proxyReq.setHeader('origin', 'http://localhost:3000');
            proxyReq.setHeader('referer', 'http://localhost:3000');
          });
        }
      }
    } : undefined
  },
  
  // Configuration du serveur de prévisualisation
  preview: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true
  },
  
  // Configuration des alias de chemins
  resolve: {
    alias: [
      {
        find: '@',
        replacement: fileURLToPath(new URL('./src', import.meta.url))
      }
    ]
  }
});
