// src/components/FacebookPixel.tsx
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { initFacebookPixel, trackEvent, ensureFBQ } from '../lib/facebookPixel';

// Vérifier si le suivi est activé
const isAnalyticsEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true' || 
                         import.meta.env.VITE_APP_ENV === 'production';

const FacebookPixel = () => {
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialisation du pixel uniquement si le suivi est activé
    const initializePixel = async () => {
      if (isAnalyticsEnabled) {
        try {
          console.log('Initialisation du Pixel Meta...');
          await initFacebookPixel();
          console.log('Pixel Meta initialisé avec succès');
          setIsInitialized(true);
        } catch (error) {
          console.error('Erreur lors de l\'initialisation du Pixel Meta:', error);
          setIsInitialized(false);
        }
      } else {
        console.log('Suivi Meta Pixel désactivé (mode développement)');
        setIsInitialized(false);
      }
    };
    
    initializePixel();
    
    return () => {
      // Nettoyage si nécessaire
    };
  }, []);

  // Suivi des changements de page
  useEffect(() => {
    if (!isInitialized || !isAnalyticsEnabled) return;
    
    // Petit délai pour s'assurer que la page est complètement chargée
    const timer = setTimeout(() => {
      try {
        if (ensureFBQ()) {
          console.log('Envoi de PageView pour:', location.pathname);
          trackEvent('PageView', {
            page_path: location.pathname,
            page_title: document.title
          });
        }
      } catch (error) {
        console.error('Erreur lors du suivi de la page:', error);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [location.pathname, isInitialized, isAnalyticsEnabled]);

  return null; // Ce composant ne rend rien
};

export default FacebookPixel;
