import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

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
    // Configuration pour le routage côté client (SPA)
    // Cette configuration permet de rediriger toutes les requêtes vers index.html
    // pour permettre le routage côté client avec React Router
    proxy: {
      // Redirection des requêtes API vers le serveur backend sur le port 3004
      '/api': {
        target: 'http://localhost:3004',
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path,
        configure: (proxy: any) => {
          proxy.on('error', (err: Error) => {
            console.error('Erreur du proxy:', err);
          });
          proxy.on('proxyReq', (proxyReq: any) => {
            console.log('Requête proxy vers:', proxyReq.method, proxyReq.path);
            // Forcer les en-têtes pour éviter les problèmes CORS
            proxyReq.setHeader('host', 'localhost:3004');
            proxyReq.setHeader('origin', 'http://localhost:3000');
            proxyReq.setHeader('referer', 'http://localhost:3000');
          });
        }
      }
    }
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
