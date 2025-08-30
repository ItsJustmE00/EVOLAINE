// src/lib/facebookPixel.ts

// Activer le mode débogage
const DEBUG = true;

const log = (...args: any[]) => {
  if (DEBUG) {
    console.log('[Facebook Pixel]', ...args);
  }
};

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

/**
 * Vérifie si le navigateur est compatible
 */
const canUseDOM = (): boolean => {
  const isAvailable = !!(typeof window !== 'undefined' && window.document && window.document.createElement);
  if (!isAvailable) {
    log('Environnement DOM non disponible');
  }
  return isAvailable;
};

/**
 * Vérifie si le pixel est prêt
 */
export const ensureFBQ = (): boolean => {
  if (!canUseDOM()) {
    log('Environnement DOM non disponible');
    return false;
  }
  
  if (!window.fbq) {
    log('fbq non trouvé dans window');
    // Essayer de récupérer fbq depuis window._fbq
    if (window._fbq) {
      log('_fbq trouvé, tentative de récupération de fbq');
      window.fbq = window._fbq;
    } else {
      log('_fbq non trouvé non plus');
      return false;
    }
  }
  
  log('Pixel prêt');
  return true;
};

/**
 * Envoie un événement de visualisation de contenu à Facebook Pixel
 */
export const trackViewContent = (parameters: {
  content_ids?: (string | number)[];
  content_name?: string;
  content_type?: string;
  content_category?: string;
  value?: number;
  currency?: string;
}): void => {
  log('trackViewContent', parameters);
  
  if (!ensureFBQ()) {
    log('Impossible d\'envoyer l\'événement ViewContent: fbq non disponible');
    return;
  }
  
  const eventData = {
    content_ids: parameters.content_ids,
    content_name: parameters.content_name,
    content_type: parameters.content_type || 'product',
    content_category: parameters.content_category,
    value: parameters.value,
    currency: parameters.currency || 'MAD'
  };
  
  log('Envoi de ViewContent:', eventData);
  
  try {
    window.fbq('track', 'ViewContent', eventData);
    log('Événement ViewContent envoyé avec succès');
  } catch (error) {
    console.error('[Facebook Pixel] Erreur lors de l\'envoi de ViewContent:', error);
  }
};

/**
 * Suivi de l'ajout au panier
 */
export const trackAddToCart = (cartData: any): void => {
  log('trackAddToCart', cartData);
  
  if (!ensureFBQ()) {
    log('Impossible d\'envoyer l\'événement AddToCart: fbq non disponible');
    return;
  }
  
  const eventData: any = {
    content_ids: cartData.content_ids || [cartData.id],
    content_name: cartData.content_name || 'Produit ajouté au panier',
    content_type: cartData.content_type || 'product',
    value: cartData.value || 0,
    currency: cartData.currency || 'MAD',
    contents: cartData.contents || [{
      id: cartData.id,
      quantity: cartData.quantity || 1,
      item_price: cartData.item_price || 0
    }],
    num_items: cartData.num_items || 1
  };
  
  log('Envoi de AddToCart:', eventData);
  
  try {
    window.fbq('track', 'AddToCart', eventData);
    log('Événement AddToCart envoyé avec succès');
  } catch (error) {
    console.error('[Facebook Pixel] Erreur lors de l\'envoi de AddToCart:', error);
  }
};

/**
 * Suivi d'un achat complété
 */
export const trackPurchase = (purchaseData: any): void => {
  log('trackPurchase', purchaseData);
  
  // Préparer les données de l'événement
  const eventData = {
    value: purchaseData.value || 0,
    currency: purchaseData.currency || 'MAD',
    content_type: purchaseData.content_type || 'product',
    contents: purchaseData.contents || [],
    order_id: purchaseData.order_id || `ORDER_${Date.now()}`,
    content_ids: purchaseData.content_ids || [],
    content_name: purchaseData.content_name || 'Achat effectué',
    content_category: purchaseData.content_category || 'purchase',
    num_items: purchaseData.num_items || 1
  };
  
  // Vérifier si le pixel est prêt
  if (!ensureFBQ()) {
    log('Impossible d\'envoyer l\'événement Purchase: fbq non disponible');
    storePendingEvent('Purchase', eventData);
    return;
  }
  
  log('Envoi de Purchase:', eventData);
  
  try {
    // Envoyer l'événement d'achat
    window.fbq('track', 'Purchase', eventData);
    log('Événement Purchase envoyé avec succès');
    
    // Traiter les événements en attente
    processPendingEvents();
    
  } catch (error) {
    console.error('[Facebook Pixel] Erreur lors de l\'envoi de Purchase:', error);
    // En cas d'erreur, stocker l'événement pour réessayer plus tard
    storePendingEvent('Purchase', eventData);
  }
};

/**
 * Envoie un événement personnalisé à Facebook Pixel
 */
export const trackEvent = (eventName: string, parameters?: Record<string, any>): void => {
  log('trackEvent', eventName, parameters);
  
  if (!ensureFBQ()) {
    log(`Impossible d'envoyer l'événement personnalisé ${eventName}: fbq non disponible`);
    return;
  }
  
  try {
    window.fbq('trackCustom', eventName, parameters);
    log(`Événement personnalisé ${eventName} envoyé avec succès`);
  } catch (error) {
    console.error(`[Facebook Pixel] Erreur lors de l'envoi de l'événement personnalisé ${eventName}:`, error);
  }
};

/**
 * Stocke un événement en attente dans le localStorage
 */
const storePendingEvent = (eventName: string, eventData: any): void => {
  try {
    const pendingEvents = JSON.parse(localStorage.getItem('fbq_pending_events') || '[]');
    pendingEvents.push({
      event: eventName,
      data: eventData,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('fbq_pending_events', JSON.stringify(pendingEvents));
    log(`Événement ${eventName} enregistré pour envoi ultérieur`);
  } catch (error) {
    console.error(`[Facebook Pixel] Erreur lors de l'enregistrement de l'événement ${eventName} en attente:`, error);
  }
};

/**
 * Traite les événements en attente
 */
const processPendingEvents = (): void => {
  try {
    const pendingEvents = JSON.parse(localStorage.getItem('fbq_pending_events') || '[]');
    if (pendingEvents.length === 0) return;
    
    log(`Traitement de ${pendingEvents.length} événements en attente`);
    
    pendingEvents.forEach((event: any) => {
      try {
        if (window.fbq) {
          window.fbq('track', event.event, event.data);
          log(`Événement ${event.event} en attente envoyé avec succès`);
        }
      } catch (error) {
        console.error(`[Facebook Pixel] Erreur lors de l'envoi de l'événement ${event.event} en attente:`, error);
      }
    });
    
    // Vider la liste des événements en attente
    localStorage.removeItem('fbq_pending_events');
  } catch (error) {
    console.error('[Facebook Pixel] Erreur lors du traitement des événements en attente:', error);
  }
};

/**
 * Suivi de l'initiation du processus de paiement
 */
export const trackInitiateCheckout = (parameters: any): void => {
  log('trackInitiateCheckout', parameters);
  
  if (!ensureFBQ()) {
    log('Impossible d\'envoyer l\'événement InitiateCheckout: fbq non disponible');
    storePendingEvent('InitiateCheckout', parameters);
    return;
  }
  
  const eventData: any = {
    content_ids: parameters.content_ids || [],
    content_name: parameters.content_name || 'Passage en caisse',
    content_type: parameters.content_type || 'product',
    content_category: parameters.content_category || 'checkout',
    value: parameters.value || 0,
    currency: parameters.currency || 'MAD',
    contents: parameters.contents || [],
    num_items: parameters.num_items || 1
  };
  
  log('Envoi de InitiateCheckout:', eventData);
  
  try {
    window.fbq('track', 'InitiateCheckout', eventData);
    log('Événement InitiateCheckout envoyé avec succès');
  } catch (error) {
    console.error('[Facebook Pixel] Erreur lors de l\'envoi de InitiateCheckout:', error);
  }
};
