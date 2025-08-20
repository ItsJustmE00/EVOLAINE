import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

// Configuration pour le mode développement et production
const isDevelopment = process.env.NODE_ENV === 'development';
const apiUrl = isDevelopment 
  ? 'http://localhost:3004' 
  : 'https://evolaine-backend.onrender.com';

export default defineConfig({
  plugins: [react()],
  // Configuration de base pour les chemins d'accès
  base: '/',
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
  // Configuration pour le routage côté client
  // Redirige toutes les requêtes vers index.html sauf pour les fichiers statiques
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
        // Configuration pour copier les fichiers statiques dans le dossier de build
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    // Copier les fichiers statiques du dossier public dans le dossier de build
    assetsInlineLimit: 0,
    copyPublicDir: true,
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
