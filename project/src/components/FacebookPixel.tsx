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
  const cleanupRef = useRef<() => void>();

  // Charger le script Facebook Pixel
  useEffect(() => {
    console.log('[FacebookPixel] Initialisation du composant');
    
    if (pixelLoaded.current) {
      console.log('[FacebookPixel] Pixel déjà chargé');
      return;
    }

    // Vérifier si fbq est déjà disponible
    if (window.fbq) {
      console.log('[FacebookPixel] fbq déjà disponible dans window', window.fbq);
      pixelLoaded.current = true;
      return;
    }
    
    // Créer le script du pixel
    console.log('[FacebookPixel] Création du script du pixel');
    const script = document.createElement('script');
    script.innerHTML = `
      console.log('[FacebookPixel] Début de l\'exécution du script du pixel');
      
      // Vérifier si window est disponible
      if (typeof window === 'undefined') {
        console.error('[FacebookPixel] window n\'est pas disponible');
        return;
      }
      
      // Vérifier si document est disponible
      if (typeof document === 'undefined') {
        console.error('[FacebookPixel] document n\'est pas disponible');
        return;
      }
      
      // Définir la fonction du pixel Facebook
      !function(f,b,e,v,n,t,s) {
        console.log('[FacebookPixel] Exécution de la fonction du pixel');
        
        // Vérifier si fbq est déjà défini
        if(f.fbq) {
          console.log('[FacebookPixel] fbq déjà défini:', f.fbq);
          return;
        }
        
        // Définir la fonction fbq
        n=f.fbq=function(){
          console.log('[FacebookPixel] Appel à fbq avec les arguments:', arguments);
          n.callMethod ? n.callMethod.apply(n,arguments) : n.queue.push(arguments);
        };
        
        // Initialiser la queue si elle n'existe pas
        if(!f._fbq) f._fbq=n;
        n.push=n;
        n.loaded=!0;
        n.version='2.0';
        n.queue=[];
        
        // Créer et insérer le script
        t=b.createElement(e);
        t.async=!0;
        t.src=v;
        
        // Trouver le premier script et insérer avant
        s=b.getElementsByTagName(e)[0];
        console.log('[FacebookPixel] Insertion du script du pixel avant:', s);
        s.parentNode.insertBefore(t,s);
        console.log('[FacebookPixel] Script du pixel inséré avec succès');
        
      }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      
      // Vérifier si fbq a été correctement défini
      if (typeof fbq === 'undefined') {
        console.error('[FacebookPixel] fbq n\'a pas été défini correctement');
        return;
      }
      
      // Initialiser le pixel
      console.log('[FacebookPixel] fbq avant initialisation:', typeof fbq, fbq);
      console.log('[FacebookPixel] Initialisation du pixel avec ID: 743290068698217');
      
      try {
        fbq('init', '743290068698217');
        console.log('[FacebookPixel] Pixel initialisé avec succès');
        
        // Envoyer l'événement PageView
        console.log('[FacebookPixel] Envoi de l\'événement PageView');
        fbq('track', 'PageView');
        console.log('[FacebookPixel] Événement PageView envoyé');
        
        // Vérifier si fbq est correctement défini
        console.log('[FacebookPixel] fbq après initialisation:', typeof fbq, fbq);
      } catch (error) {
        console.error('[FacebookPixel] Erreur lors de l\'initialisation du pixel:', error);
      }
    `;
    
    // Ajouter le script à la fin du body
    console.log('[FacebookPixel] Ajout du script au document');
    document.body.appendChild(script);
    
    // Vérifier si le script a été chargé
    script.onload = () => {
      console.log('[FacebookPixel] Script chargé avec succès');
      console.log('[FacebookPixel] fbq après chargement du script:', typeof window.fbq, window.fbq);
    };
    
    script.onerror = (error) => {
      console.error('[FacebookPixel] Erreur lors du chargement du script:', error);
    };
    
    // Ajouter le code de suivi no-js
    console.log('[FacebookPixel] Ajout du code de suivi noscript');
    const noScript = document.createElement('noscript');
    noScript.innerHTML = `
      <img height="1" width="1" style="display:none" 
           src="https://www.facebook.com/tr?id=743290068698217&ev=PageView&noscript=1"
           alt="" />
    `;
    document.body.appendChild(noScript);
    
    pixelLoaded.current = true;
    console.log('[FacebookPixel] Initialisation du composant terminée');
    
    // Fonction de nettoyage
    cleanupRef.current = () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      if (document.body.contains(noScript)) {
        document.body.removeChild(noScript);
      }
    };
    
    // Nettoyer lors du démontage du composant
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  // Effet pour le suivi des changements de page
  useEffect((): (() => void) | undefined => {
    // Si le pixel n'est pas chargé, on ne fait rien
    if (!pixelLoaded.current) {
      return undefined;
    }
    
    // Fonction pour vérifier si le Pixel est initialisé
    const checkPixelInitialized = (): boolean => {
      try {
        console.log('[FacebookPixel] Vérification de l\'initialisation du pixel...');
        
        // Vérifier si window est disponible et si fbq est une fonction
        if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
          console.log('[FacebookPixel] fbq trouvé dans window');
          
          // Essayer d'envoyer un événement de test
          console.log('[FacebookPixel] Envoi d\'un événement de test');
          window.fbq('track', 'PageView');
          console.log('[FacebookPixel] Événement de test envoyé avec succès');
          return true;
        }
        
        console.log('[FacebookPixel] fbq non disponible ou non fonctionnel');
        return false;
        
      } catch (error) {
        console.error('[FacebookPixel] Erreur lors de la vérification de l\'initialisation du pixel:', error);
        return false;
      }
    };
    
    // Vérifier immédiatement
    const isInitialized = checkPixelInitialized();
    
    // Si non initialisé, vérifier périodiquement
    if (!isInitialized) {
      console.log('[FacebookPixel] Le pixel ne semble pas initialisé, vérification périodique...');
      
      const checkInterval = setInterval(() => {
        const initialized = checkPixelInitialized();
        if (initialized) {
          console.log('[FacebookPixel] Pixel correctement initialisé après vérification périodique');
          clearInterval(checkInterval);
        }
      }, 1000); // Vérifier toutes les secondes
      
      // Nettoyer l'intervalle lors du démontage
      return () => clearInterval(checkInterval);
    }
    
    // Suivre le changement de page si le pixel est initialisé
    if (window.fbq) {
      console.log('[FacebookPixel] Suivi du changement de page:', location.pathname);
      
      // Utiliser setTimeout pour s'assurer que le DOM est complètement chargé
      const timer = setTimeout(() => {
        try {
          window.fbq('track', 'PageView', {
            page_path: location.pathname,
            page_title: document.title
          });
          console.log('[FacebookPixel] PageView tracké pour:', location.pathname);
        } catch (error) {
          console.error('[FacebookPixel] Erreur lors du suivi de la page:', error);
        }
      }, 100);
      
      // Nettoyer le timer lors du démontage
      return () => clearTimeout(timer);
    }
    
    // Retourner une fonction de nettoyage vide par défaut
    return undefined;
  }, [location.pathname]);

  return null; // Ce composant ne rend rien
};

export default FacebookPixel;
