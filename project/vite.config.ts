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
      // Laisser passer les requêtes API vers le serveur backend
      '/api': {
        target: 'https://evolaine-backend.onrender.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path,
        configure: (proxy: any) => {
          proxy.on('error', (err: Error) => {
            console.log('Erreur du proxy:', err);
          });
          proxy.on('proxyReq', (_: any, req: any) => {
            console.log('Requête proxy vers:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes: any, req: any) => {
            console.log('Réponse du serveur:', req.method, req.url, proxyRes.statusCode);
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
