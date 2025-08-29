import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackViewContent } from '../lib/facebookPixel';

/**
 * Hook personnalisé pour suivre la visualisation d'un produit
 * @param product - Les données du produit à suivre
 */
export const useTrackProductView = (product?: {
  id: string | number;
  name: string;
  price: number;
  category?: string;
  currency?: string;
}) => {
  const location = useLocation();

  useEffect(() => {
    if (product) {
      trackViewContent({
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        content_category: product.category,
        value: product.price,
        currency: product.currency || 'MAD',
      });
    }
  }, [location.pathname, product]);
};
