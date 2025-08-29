/**
 * Utilitaire pour générer des liens directs vers le panier avec des produits pré-sélectionnés
 */

/**
 * Génère un lien direct vers le panier avec un produit spécifique
 * @param productId - ID du produit à ajouter au panier
 * @param quantity - Quantité du produit (par défaut: 1)
 * @param direct - Si true, active le mode "direct checkout" qui fait défiler vers le formulaire
 * @returns URL complète pour accéder directement au panier avec le produit
 */
export const generateDirectCheckoutLink = (
  productId: number, 
  quantity: number = 1,
  direct: boolean = true
): string => {
  // URL de base de l'application
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/cart` 
    : 'https://evolaine.vercel.app/cart';
  
  // Création du lien avec les paramètres de requête
  const url = new URL(baseUrl);
  url.searchParams.append('productId', productId.toString());
  
  if (quantity > 1) {
    url.searchParams.append('quantity', quantity.toString());
  }
  
  if (direct) {
    url.searchParams.append('direct', 'true');
  }
  
  return url.toString();
};

/**
 * Obtient le lien direct vers le panier avec le pack complet
 * @param quantity - Quantité du pack complet (par défaut: 1)
 * @returns URL pour accéder directement au panier avec le pack complet
 */
export const getCompletePackCheckoutLink = (quantity: number = 1): string => {
  // ID du pack complet (vérifiez que c'est le bon ID dans vos données)
  const COMPLETE_PACK_ID = 1;
  return generateDirectCheckoutLink(COMPLETE_PACK_ID, quantity, true);
};

/**
 * Lien direct vers le panier avec le pack complet (pour utilisation dans les liens statiques)
 */
export const COMPLETE_PACK_LINK = 'https://evolaine.vercel.app/cart?productId=1&quantity=1&direct=true';
