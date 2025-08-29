import { useCallback } from 'react';
import { trackAddToCart } from '../lib/facebookPixel';

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
  }, []);

  // Suivre la visualisation d'un produit
  const trackProductView = useCallback((product: Omit<CartItemData, 'quantity'>) => {
    trackAddToCart({
      id: product.id,
      content_name: product.name,
      content_type: 'product',
      content_category: product.category || 'product',
      currency: product.currency || 'MAD',
      value: product.price,
      quantity: 1,
      item_price: product.price
    });
  }, []);

  return {
    trackProductAdded,
    trackProductView
  };
};

export default useTrackCart;
