import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

// Configuration pour le mode développement et production
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const apiUrl = isDevelopment 
  ? 'http://localhost:3004' 
  : 'https://evolaine-backend.onrender.com';

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
    manifest: true,
    // Configuration du build
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/[name]-[hash][extname]';
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (ext === 'json') return 'assets/[name][extname]';
          return 'assets/[name]-[hash][extname]';
        },
      }
    },
    // Cibler des navigateurs modernes
    target: 'es2015',
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
