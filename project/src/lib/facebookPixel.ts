// src/lib/facebookPixel.ts

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

// ID du pixel Meta (Facebook)
const PIXEL_ID = '743290068698217';

// Désactiver les fonctionnalités expérimentales
const DISABLE_FEATURES = ['attribution-reporting', 'browsing-topics'];

/**
 * Vérifie si le navigateur est compatible
 */
const canUseDOM = (): boolean => {
  return !!(typeof window !== 'undefined' && window.document && window.document.createElement);
};

/**
 * Initialise le pixel Facebook
 * @returns Une promesse qui se résout lorsque le pixel est initialisé
 */
export const initFacebookPixel = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!canUseDOM()) {
      console.warn('Facebook Pixel: Environnement non compatible');
      resolve(false);
      return;
    }
    
    // Si le pixel est déjà initialisé
    if (window.fbq?.loaded) {
      console.log('Facebook Pixel: Déjà initialisé');
      resolve(true);
      return;
    }

    // Si le script est déjà en cours de chargement
    if (window.fbq) {
      window.fbq('init', PIXEL_ID);
      window.fbq('track', 'PageView');
      console.log('Facebook Pixel: Initialisation rapide');
      resolve(true);
      return;
    }

    // Chargement du script Facebook Pixel avec désactivation des fonctionnalités expérimentales
    (function(f: Window, b: Document, e: string, v: string) {
      if (f.fbq) return;
      
      // Désactiver les fonctionnalités expérimentales
      DISABLE_FEATURES.forEach(feature => {
        try {
          // @ts-ignore
          window[`_${feature}`] = false;
        } catch (e) {
          console.warn(`Impossible de désactiver la fonctionnalité ${feature}:`, e);
        }
      });
      
      const n: any = f.fbq = function() {
        n.callMethod ? 
          n.callMethod.apply(n, arguments) : 
          n.queue.push(arguments);
      };
      
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = false;
      n.version = '2.0';
      n.queue = [];
      
      const t = b.createElement('script');
      t.async = true;
      t.src = v;
      t.onload = () => {
        console.log('Facebook Pixel: Script chargé');
        n.loaded = true;
      };
      
      const s = b.getElementsByTagName(e)[0];
      if (s?.parentNode) {
        s.parentNode.insertBefore(t, s);
      }
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    
    // Vérification périodique du chargement
    const maxAttempts = 10;
    let attempts = 0;
    
    const checkFBQ = () => {
      attempts++;
      
      if (window.fbq?.loaded) {
        window.fbq('init', PIXEL_ID);
        window.fbq('track', 'PageView', {
          page_path: window.location.pathname,
          page_title: document.title
        });
        console.log('Facebook Pixel: Initialisation réussie');
        resolve(true);
        return;
      }
      
      if (attempts >= maxAttempts) {
        console.error('Facebook Pixel: Échec du chargement après plusieurs tentatives');
        resolve(false);
        return;
      }
      
      setTimeout(checkFBQ, 200);
    };
    
    // Démarrer la vérification
    setTimeout(checkFBQ, 100);
  });
};

// Types pour les événements
export interface ButtonClickData extends Record<string, any> {
  event_name: string;
  button_text: string;
  [key: string]: any;
}

interface EventData {
  [key: string]: any;
}

interface ContentData extends EventData {
  content_ids?: (string | number)[];
  content_type?: string;
  currency?: string;
  value?: number;
  contents?: Array<{
    id: string | number;
    quantity: number;
    item_price?: number;
  }>;
  num_items?: number;
  order_id?: string | number;
  content_name?: string;
  content_category?: string;
}

/**
 * Vérifie si le pixel est prêt
 */
export const ensureFBQ = (): boolean => {
  if (!canUseDOM()) return false;
  
  if (!window.fbq) {
    console.warn('Facebook Pixel non initialisé, tentative d\'initialisation...');
    initFacebookPixel();
    return false;
  }
  
  return true;
};

/**
 * Envoie un événement personnalisé au pixel Facebook
 */
export const trackEvent = (eventName: string, eventData?: EventData): void => {
  if (!ensureFBQ()) {
    console.warn(`Événement ${eventName} non envoyé: Facebook Pixel non initialisé`);
    return;
  }
  
  try {
    window.fbq('track', eventName, eventData);
    console.log(`Événement ${eventName} envoyé:`, eventData);
  } catch (error) {
    console.error(`Erreur lors de l'envoi de l'événement ${eventName}:`, error);
  }
};

// Événements standards

/**
 * Suivi de la visualisation de contenu
 */
export const trackViewContent = (contentData: ContentData): void => {
  trackEvent('ViewContent', {
    content_ids: contentData.content_ids || [],
    content_type: contentData.content_type || 'product',
    content_name: contentData.content_name || '',
    content_category: contentData.content_category,
    currency: contentData.currency || 'EUR',
    value: contentData.value || 0,
    contents: contentData.contents
  });
};

/**
 * Suivi de l'ajout au panier
 */
export const trackAddToCart = (cartData: ContentData): void => {
  trackEvent('AddToCart', {
    content_ids: cartData.content_ids || [],
    content_type: cartData.content_type || 'product',
    content_name: cartData.content_name || '',
    currency: cartData.currency || 'EUR',
    value: cartData.value || 0,
    contents: cartData.contents || [{
      id: cartData.content_ids?.[0] || '',
      quantity: cartData.num_items || 1,
      item_price: cartData.value || 0
    }],
    num_items: cartData.num_items || 1
  });
};

/**
 * Suivi du début du processus de paiement
 */
export const trackInitiateCheckout = (checkoutData: ContentData): void => {
  trackEvent('InitiateCheckout', {
    content_ids: checkoutData.content_ids || [],
    content_type: checkoutData.content_type || 'product',
    currency: checkoutData.currency || 'EUR',
    value: checkoutData.value || 0,
    num_items: checkoutData.num_items || 1,
    contents: checkoutData.contents,
    content_name: checkoutData.content_name
  });
};

/**
 * Suivi d'un achat complété
 */
export const trackPurchase = (purchaseData: ContentData): void => {
  if (!ensureFBQ()) return;
  
  const eventData: ContentData = {
    content_ids: purchaseData.content_ids,
    content_type: purchaseData.content_type || 'product',
    content_name: purchaseData.content_name || 'Purchase',
    content_category: purchaseData.content_category || 'ecommerce',
    currency: purchaseData.currency || 'MAD',
    value: purchaseData.value || 0,
    num_items: purchaseData.num_items,
    order_id: purchaseData.order_id,
    contents: purchaseData.contents
  };

  window.fbq('track', 'Purchase', eventData);
};

/**
 * Suivi des clics sur les boutons
 * @param buttonData - Données du bouton cliqué
 */
export const trackButtonClick = (buttonData: ButtonClickData): void => {
  if (!ensureFBQ()) return;
  
  // Créer un nouvel objet sans la propriété button_text pour éviter la duplication
  const { button_text, ...restData } = buttonData;
  
  const eventData = {
    button_text,
    ...restData
  };

  // Envoyer un événement personnalisé avec le nom fourni
  window.fbq('trackCustom', buttonData.event_name, eventData);
  
  // Envoyer également un événement standard de clic
  window.fbq('track', 'Lead', {
    content_name: buttonData.button_text,
    content_category: 'button_click',
    ...buttonData
  });
};
