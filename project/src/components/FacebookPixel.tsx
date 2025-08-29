// src/components/FacebookPixel.tsx
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

const FacebookPixel = () => {
  const location = useLocation();
  const pixelLoaded = useRef(false);

  // Fonction pour charger le pixel de manière asynchrone
  const loadPixel = () => {
    // Vérifier si le pixel est déjà chargé
    if (window.fbq?.loaded) {
      pixelLoaded.current = true;
      return true;
    }

    try {
      // Créer un script pour charger le pixel
      const script = document.createElement('script');
      script.src = '/facebook-pixel.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        console.log('Facebook Pixel chargé avec succès');
        pixelLoaded.current = true;
        
        // Forcer un événement PageView après le chargement
        if (window.fbq) {
          window.fbq('track', 'PageView', {
            page_path: location.pathname,
            page_title: document.title
          });
        }
      };
      
      script.onerror = (error) => {
        console.warn('Erreur lors du chargement du Pixel Facebook. Vérifiez votre bloqueur de publicités.');
        console.error(error);
      };
      
      // Ajouter le script au document
      document.head.appendChild(script);
      
      // Ajouter le code de suivi no-js
      const noScript = document.createElement('noscript');
      noScript.innerHTML = `
        <img height="1" width="1" style="display:none" 
             src="https://www.facebook.com/tr?id=743290068698217&ev=PageView&noscript=1"
             alt="" />
      `;
      document.body.appendChild(noScript);
      
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
        if (document.body.contains(noScript)) {
          document.body.removeChild(noScript);
        }
      };
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du Pixel Facebook:', error);
      return false;
    }
  };

  // Charger le pixel au montage du composant
  useEffect(() => {
    if (pixelLoaded.current) return;
    
    // Délai pour éviter de bloquer le rendu initial
    const timer = setTimeout(() => {
      loadPixel();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Suivi des changements de page
  useEffect(() => {
    if (!pixelLoaded.current) return;
    
    const trackPageView = () => {
      if (window.fbq) {
        window.fbq('track', 'PageView', {
          page_path: location.pathname,
          page_title: document.title
        });
      }
    };
    
    // Délai pour s'assurer que le DOM est mis à jour
    const timer = setTimeout(trackPageView, 100);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Rien à afficher
  return null;
};

export default FacebookPixel;
