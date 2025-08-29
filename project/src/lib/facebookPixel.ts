// src/lib/facebookPixel.ts

// Déclaration des types pour fbq
type FbqFunction = {
  (command: 'track', event: string, parameters?: Record<string, any>): void;
  (command: 'trackCustom', event: string, parameters?: Record<string, any>): void;
  (command: 'init', pixelId: string): void;
};

declare global {
  interface Window {
    fbq: FbqFunction & {
      pushed?: Array<any>;
      loaded?: boolean;
      version?: string;
      queue?: Array<any>;
    };
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

// Types pour les événements
export interface ContentData {
  content_ids?: (string | number)[];
  content_type?: string;
  currency?: string;
  value?: number;
  contents?: Array<{
    id: string | number;
    quantity: number;
    item_price?: number;
  }>;
  id?: string | number;
  quantity?: number;
  item_price?: number;
  num_items?: number;
  order_id?: string | number;
  content_name?: string;
  content_category?: string;
  [key: string]: any;
}

/**
 * Suivi de l'ajout au panier
 * @param cartData - Données du panier
 */
export const trackAddToCart = (cartData: ContentData): void => {
  if (!ensureFBQ()) return;
  
  try {
    window.fbq('track', 'AddToCart', {
      content_ids: cartData.content_ids || [cartData.id],
      content_type: cartData.content_type || 'product',
      content_name: cartData.content_name,
      content_category: cartData.content_category,
      value: cartData.value,
      currency: cartData.currency || 'EUR',
      contents: cartData.contents || [{
        id: cartData.id,
        quantity: cartData.quantity || 1,
        item_price: cartData.item_price
      }],
    });
    console.log('Événement AddToCart envoyé:', cartData);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'événement AddToCart:', error);
  }
};

/**
 * Suivi d'un achat complété
 * @param purchaseData - Données de l'achat
 */
export const trackPurchase = (purchaseData: ContentData): void => {
  if (!ensureFBQ()) return;
  
  try {
    window.fbq('track', 'Purchase', {
      content_ids: purchaseData.content_ids || [purchaseData.id],
      content_type: purchaseData.content_type || 'product',
      contents: purchaseData.contents,
      num_items: purchaseData.num_items,
      value: purchaseData.value,
      currency: purchaseData.currency || 'EUR',
      order_id: purchaseData.order_id,
    });
    console.log('Événement Purchase envoyé:', purchaseData);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'événement Purchase:', error);
  }
};

/**
 * Suivi d'un événement personnalisé
 * @param eventName - Nom de l'événement à suivre
 * @param eventData - Données supplémentaires pour l'événement
 */
export const trackEvent = (eventName: string, eventData: Record<string, any> = {}): void => {
  if (!ensureFBQ()) return;
  
  try {
    window.fbq('trackCustom', eventName, eventData);
    console.log(`Événement personnalisé ${eventName} envoyé:`, eventData);
  } catch (error) {
    console.error(`Erreur lors de l'envoi de l'événement personnalisé ${eventName}:`, error);
  }
};
