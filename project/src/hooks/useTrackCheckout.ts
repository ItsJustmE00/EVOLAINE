import { useEffect } from 'react';
import { trackInitiateCheckout, trackPurchase } from '../lib/facebookPixel';

export interface CheckoutData {
  content_ids: (string | number)[];
  value: number;
  currency?: string;
  contents: Array<{
    id: string | number;
    quantity: number;
    item_price: number;
  }>;
  order_id?: string | number;
  content_name?: string;
  content_type?: string;
  num_items?: number;
  content_category?: string;
}

/**
 * Hook personnalisé pour suivre le processus de paiement
 * @param checkoutData - Les données du panier pour le suivi
 * @param isCheckout - Si vrai, suit l'initiation du paiement
 * @param isPurchase - Si vrai, suit un achat complété
 */
export const useTrackCheckout = (
  checkoutData: CheckoutData | null,
  isCheckout: boolean = false,
  isPurchase: boolean = false
): void => {
  useEffect(() => {
    if (!checkoutData) return;

    // Calculer le nombre total d'articles dans le panier
    const calculateNumItems = (): number => {
      if (checkoutData.num_items) return checkoutData.num_items;
      if (!checkoutData.contents) return 1;
      
      return checkoutData.contents.reduce((sum: number, item) => {
        return sum + (item.quantity || 1);
      }, 0) || 1;
    };

    // Préparer les données de base
    const baseData = {
      content_ids: checkoutData.content_ids || [],
      content_type: checkoutData.content_type || 'product',
      content_name: checkoutData.content_name || 'Commande',
      currency: checkoutData.currency || 'MAD',
      value: checkoutData.value || 0,
      contents: checkoutData.contents || [],
      num_items: calculateNumItems(),
      content_category: checkoutData.content_category || 'product'
    };

    // Suivre l'initiation du paiement
    if (isCheckout) {
      trackInitiateCheckout({
        ...baseData,
        content_name: baseData.content_name || 'Passage en caisse',
        content_category: 'checkout'
      });
    }

    // Suivre l'achat complété
    if (isPurchase && checkoutData.order_id) {
      trackPurchase({
        ...baseData,
        order_id: checkoutData.order_id,
        content_name: baseData.content_name || 'Achat effectué',
        content_category: 'purchase'
      });
    }
  }, [checkoutData, isCheckout, isPurchase]);
};

export default useTrackCheckout;
