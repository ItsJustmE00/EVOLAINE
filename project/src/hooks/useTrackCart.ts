import { useCallback } from 'react';
import { trackAddToCart, trackViewContent } from '../lib/facebookPixel';

// Vérifier si le suivi est activé
const isAnalyticsEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true' || 
                         import.meta.env.VITE_APP_ENV === 'production';

export interface CartItemData {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  currency?: string;
}

/**
 * Hook personnalisé pour suivre les interactions avec le panier
 */
export const useTrackCart = () => {
  // Suivre l'ajout d'un produit au panier
  const trackProductAdded = useCallback((product: CartItemData) => {
    if (!isAnalyticsEnabled) {
      console.log('Suivi Meta Pixel désactivé - Produit ajouté:', product.name);
      return;
    }

    try {
      console.log('Envoi de l\'événement AddToCart pour:', product.name);
      trackAddToCart({
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        content_category: product.category || 'product',
        currency: product.currency || 'MAD',
        value: product.price * product.quantity,
        contents: [{
          id: product.id,
          quantity: product.quantity,
          item_price: product.price
        }],
        num_items: product.quantity
      });
    } catch (error) {
      console.error('Erreur lors du suivi de l\'ajout au panier:', error);
    }
  }, []);

  // Suivre la visualisation d'un produit
  const trackProductView = useCallback((product: Omit<CartItemData, 'quantity'>) => {
    if (!isAnalyticsEnabled) {
      console.log('Suivi Meta Pixel désactivé - Produit visualisé:', product.name);
      return;
    }

    try {
      console.log('Envoi de l\'événement ViewContent pour:', product.name);
      trackViewContent({
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        content_category: product.category || 'product',
        currency: product.currency || 'MAD',
        value: product.price,
        contents: [{
          id: product.id,
          quantity: 1,
          item_price: product.price
        }]
      });
    } catch (error) {
      console.error('Erreur lors du suivi de la visualisation du produit:', error);
    }
  }, []);

  return {
    trackProductAdded,
    trackProductView
  };
};

export default useTrackCart;
