// src/components/FacebookPixel.tsx
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ensureFBQ } from '../lib/facebookPixel';

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

const FacebookPixel = () => {
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Vérifier si le pixel est déjà initialisé
    const checkPixelInitialized = () => {
      if (window.fbq?.loaded) {
        setIsInitialized(true);
        return true;
      }
      return false;
    };

    // Essayer de vérifier immédiatement
    if (checkPixelInitialized()) {
      return;
    }

    // Sinon, attendre un peu et réessayer
    const timer = setTimeout(() => {
      if (checkPixelInitialized()) {
        clearInterval(interval);
      }
    }, 500);

    // Vérifier périodiquement
    const interval = setInterval(() => {
      if (checkPixelInitialized()) {
        clearInterval(interval);
      }
    }, 1000);

    // Nettoyer les intervalles lors du démontage
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Suivi des changements de page
  useEffect(() => {
    if (!isInitialized) return;
    
    const trackPageView = () => {
      if (ensureFBQ()) {
        window.fbq('track', 'PageView', {
          page_path: location.pathname,
          page_title: document.title
        });
      }
    };

    // Délai pour s'assurer que la page est complètement chargée
    const timer = setTimeout(trackPageView, 100);
    
    return () => clearTimeout(timer);
  }, [location.pathname, isInitialized]);

  return null; // Ce composant ne rend rien
};

export default FacebookPixel;
