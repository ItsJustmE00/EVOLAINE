// src/components/FacebookPixel.tsx
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { initFacebookPixel, trackEvent, ensureFBQ } from '../lib/facebookPixel';

const FacebookPixel = () => {
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialisation du pixel
    const initializePixel = async () => {
      await initFacebookPixel();
      setIsInitialized(true);
    };
    
    initializePixel();
    
    return () => {
      // Nettoyage si nécessaire
    };
  }, []);

  // Suivi des changements de page
  useEffect(() => {
    if (!isInitialized) return;
    
    // Petit délai pour s'assurer que la page est complètement chargée
    const timer = setTimeout(() => {
      if (ensureFBQ()) {
        trackEvent('PageView', {
          page_path: location.pathname,
          page_title: document.title
        });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [location.pathname, isInitialized]);

  return null; // Ce composant ne rend rien
};

export default FacebookPixel;
