// src/utils/verifyPixel.ts
import { useEffect } from 'react';
import { ensureFBQ } from '../lib/facebookPixel';

/**
 * Hook pour vérifier que le Pixel Meta est correctement initialisé
 */
export const useVerifyPixel = () => {
  useEffect(() => {
    // Vérifier après 2 secondes pour laisser le temps au pixel de s'initialiser
    const timer = setTimeout(() => {
      const isFBQLoaded = ensureFBQ();
      console.log('Vérification du Pixel Meta:');
      console.log('- FBQ chargé:', isFBQLoaded);
      
      if (isFBQLoaded) {
        console.log('- Pixel ID:', window.fbq?.getState()?.pixelId);
        console.log('- Événements en attente:', window.fbq?.getState()?.queue?.length || 0);
      }
      
      // Vérifier si le pixel est correctement initialisé
      if (!isFBQLoaded) {
        console.error('ERREUR: Le Pixel Meta n\'est pas correctement initialisé');
      } else {
        console.log('SUCCÈS: Le Pixel Meta est correctement initialisé');
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
};

/**
 * Fonction utilitaire pour vérifier manuellement le Pixel Meta
 */
export const verifyPixelManually = () => {
  console.log('=== VÉRIFICATION MANUELLE DU PIXEL META ===');
  console.log('Fenêtre chargée:', typeof window !== 'undefined');
  console.log('FBQ disponible:', typeof window.fbq !== 'undefined');
  
  if (typeof window.fbq !== 'undefined') {
    console.log('FBQ État:', window.fbq.getState());
    console.log('FBQ Queue:', window.fbq.queue);
  }
  
  console.log('Variables d\'environnement:');
  console.log('- VITE_APP_ENV:', import.meta.env.VITE_APP_ENV);
  console.log('- VITE_META_PIXEL_ID:', import.meta.env.VITE_META_PIXEL_ID);
  console.log('- VITE_ENABLE_ANALYTICS:', import.meta.env.VITE_ENABLE_ANALYTICS);
  console.log('==========================================');
};
