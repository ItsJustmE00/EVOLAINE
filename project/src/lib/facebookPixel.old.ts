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
 * Envoie un événement de visualisation de contenu à Facebook Pixel
 * @param parameters - Paramètres de l'événement de visualisation
 */
export const trackViewContent = (parameters: {
  content_ids?: (string | number)[];
  content_name?: string;
  content_type?: string;
  content_category?: string;
  value?: number;
  currency?: string;
}): void => {
  if (!canUseDOM() || !window.fbq) return;
  
  window.fbq('track', 'ViewContent', {
    ...parameters,
    content_ids: parameters.content_ids?.map(String) // S'assure que les IDs sont des strings
  });
};

/**
 * Suivi de l'ajout au panier
 * @param cartData - Données du panier
 */
export const trackAddToCart = (cartData: ContentData | {
  content_ids?: (string | number)[];
  content_name?: string;
  content_type?: string;
  content_category?: string;
  value?: number;
  currency?: string;
  contents?: Array<{
    id: string | number;
    quantity: number;
    item_price?: number;
  }>;
  id?: string | number;
  quantity?: number;
  item_price?: number;
}): void => {
  if (!ensureFBQ()) return;
  
  try {
    const contentIds = cartData.content_ids || 
      (cartData.contents ? cartData.contents.map(item => item.id) : 
      (cartData as any).id ? [(cartData as any).id] : undefined);
    
    const contents = cartData.contents || 
      ((cartData as any).id ? [{
        id: (cartData as any).id,
        quantity: (cartData as any).quantity || 1,
        item_price: (cartData as any).item_price
      }] : undefined);
    
    const eventData: Record<string, any> = {
      content_ids: contentIds,
      content_type: cartData.content_type || 'product',
      value: cartData.value,
      currency: cartData.currency || 'MAD',
      contents: contents
    };
    
    // Ajouter les champs optionnels uniquement s'ils sont définis
    if (cartData.content_name) eventData.content_name = cartData.content_name;
    if (cartData.content_category) eventData.content_category = cartData.content_category;
    
    window.fbq('track', 'AddToCart', eventData);
    console.log('Événement AddToCart envoyé:', eventData);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'événement AddToCart:', error);
  }
};

/**
 * Suivi d'un achat complété
 * @param purchaseData - Données de l'achat
 */
export const trackPurchase = (purchaseData: ContentData | {
  value: number;
  currency: string;
  content_type?: string;
  contents?: Array<{
    id: string | number;
    quantity: number;
    item_price: number;
  }>;
  order_id?: string | number;
  content_ids?: (string | number)[];
  content_name?: string;
  content_category?: string;
  num_items?: number;
}): void => {
  if (!ensureFBQ()) return;
  
  try {
    const contentIds = purchaseData.content_ids || 
      (purchaseData.contents ? purchaseData.contents.map(item => item.id) : 
      (purchaseData as any).id ? [(purchaseData as any).id] : undefined);
    
    window.fbq('track', 'Purchase', {
      content_ids: contentIds,
      content_type: purchaseData.content_type || 'product',
      contents: (purchaseData as any).contents,
      num_items: (purchaseData as any).num_items || 
        (purchaseData.contents ? purchaseData.contents.reduce((sum, item) => sum + item.quantity, 0) : 1),
      value: purchaseData.value,
      currency: purchaseData.currency || 'MAD',
      order_id: purchaseData.order_id,
      content_name: (purchaseData as any).content_name,
      content_category: (purchaseData as any).content_category,
    });
    
    console.log('Événement Purchase envoyé:', purchaseData);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'événement Purchase:', error);
  }
};

/**
 * Envoie un événement personnalisé à Facebook Pixel
 * @param eventName - Nom de l'événement personnalisé
 * @param parameters - Paramètres de l'événement
 */
export const trackEvent = (eventName: string, parameters?: Record<string, any>): void => {
  if (!canUseDOM() || !window.fbq) return;
  window.fbq('trackCustom', eventName, parameters);
};

/**
 * Suivi de l'initiation du processus de paiement
 * @param parameters - Paramètres de l'événement d'initiation au paiement
 */
export const trackInitiateCheckout = (parameters: {
  content_ids?: (string | number)[];
  content_name?: string;
  content_type?: string;
  content_category?: string;
  value?: number;
  currency?: string;
  contents?: Array<{
    id: string | number;
    quantity: number;
    item_price?: number;
  }>;
  num_items?: number;
}): void => {
  if (!ensureFBQ()) return;
  
  try {
    const eventData: Record<string, any> = {
      content_ids: parameters.content_ids || 
        (parameters.contents ? parameters.contents.map(item => item.id) : undefined),
      content_type: parameters.content_type || 'product',
      value: parameters.value,
      currency: parameters.currency || 'MAD',
      contents: parameters.contents,
      num_items: parameters.num_items || 
        (parameters.contents ? parameters.contents.reduce((sum, item) => sum + (item.quantity || 1), 0) : 1)
    };
    
    // Ajouter les champs optionnels uniquement s'ils sont définis
    if (parameters.content_name) eventData.content_name = parameters.content_name;
    if (parameters.content_category) eventData.content_category = parameters.content_category;
    
    window.fbq('track', 'InitiateCheckout', eventData);
    console.log('Événement InitiateCheckout envoyé:', eventData);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'événement InitiateCheckout:', error);
  }
};


