// src/lib/facebookPixel.ts

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
  return !!(typeof window !== 'undefined' && window.document && window.document.createElement);
};

/**
 * Vérifie si le pixel est prêt
 */
export const ensureFBQ = (): boolean => {
  if (!canUseDOM()) return false;
  
  if (!window.fbq) {
    console.warn('Facebook Pixel non initialisé');
    return false;
  }
  
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
  if (!ensureFBQ()) return;
  
  window.fbq('track', 'ViewContent', {
    content_ids: parameters.content_ids,
    content_name: parameters.content_name,
    content_type: parameters.content_type,
    content_category: parameters.content_category,
    value: parameters.value,
    currency: parameters.currency
  });
};

/**
 * Suivi de l'ajout au panier
 */
export const trackAddToCart = (cartData: any): void => {
  if (!ensureFBQ()) return;
  
  const eventData: any = {
    content_ids: cartData.content_ids || [cartData.id],
    content_name: cartData.content_name,
    content_type: cartData.content_type || 'product',
    value: cartData.value,
    currency: cartData.currency || 'EUR',
    contents: cartData.contents || [{
      id: cartData.id,
      quantity: cartData.quantity || 1,
      item_price: cartData.item_price
    }]
  };
  
  window.fbq('track', 'AddToCart', eventData);
};

/**
 * Suivi d'un achat complété
 */
export const trackPurchase = (purchaseData: any): void => {
  if (!ensureFBQ()) return;
  
  window.fbq('track', 'Purchase', {
    value: purchaseData.value,
    currency: purchaseData.currency || 'EUR',
    content_type: purchaseData.content_type || 'product',
    contents: purchaseData.contents,
    order_id: purchaseData.order_id,
    content_ids: purchaseData.content_ids,
    content_name: purchaseData.content_name,
    content_category: purchaseData.content_category,
    num_items: purchaseData.num_items
  });
};

/**
 * Envoie un événement personnalisé à Facebook Pixel
 */
export const trackEvent = (eventName: string, parameters?: Record<string, any>): void => {
  if (!canUseDOM() || !window.fbq) return;
  window.fbq('trackCustom', eventName, parameters);
};

/**
 * Suivi de l'initiation du processus de paiement
 */
export const trackInitiateCheckout = (parameters: any): void => {
  if (!ensureFBQ()) return;
  
  const eventData: any = {
    content_ids: parameters.content_ids,
    content_name: parameters.content_name,
    content_type: parameters.content_type || 'product',
    content_category: parameters.content_category,
    value: parameters.value,
    currency: parameters.currency || 'EUR',
    contents: parameters.contents,
    num_items: parameters.num_items
  };
  
  window.fbq('track', 'InitiateCheckout', eventData);
};
