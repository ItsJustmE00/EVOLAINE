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

  // Charger le script Facebook Pixel
  useEffect(() => {
    if (pixelLoaded.current) return;

    // Créer un script pour charger le pixel
    const loadPixel = () => {
      // Charger le script principal
      const script = document.createElement('script');
      script.src = '/facebook-pixel.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('Facebook Pixel chargé avec succès');
        pixelLoaded.current = true;
      };
      
      script.onerror = (error) => {
        console.error('Erreur lors du chargement du Pixel Facebook:', error);
      };
      
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
    };

    // Charger le pixel après un court délai
    const timer = setTimeout(loadPixel, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Suivi des changements de page
  useEffect(() => {
    if (!pixelLoaded.current) return;
    
    // Utiliser un setTimeout pour s'assurer que le DOM est mis à jour
    const timer = setTimeout(() => {
      if (window.fbq) {
        window.fbq('track', 'PageView', {
          page_path: location.pathname,
          page_title: document.title
        });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return null; // Ce composant ne rend rien
};

export default FacebookPixel;
