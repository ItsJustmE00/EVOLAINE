// @ts-nocheck
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { useEffect, useRef, useCallback, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { products } from '../data/products';
import { useCart } from '../contexts/CartContext';
import { useProductSelection } from '../contexts/ProductSelectionContext';
import { Product } from '../types/product';
import { useNotification } from './ui/Notification';

// Types pour la configuration des cartes de produits
type ProductCardConfig = {
  container: {
    columns: {
      default: number;
      md: number;
      lg: number;
      xl: number;
    };
    gap: string;
    paddingY: string;
    paddingX: string;
  };
  card: {
    borderRadius: string;
    shadow: string;
    hoverShadow: string;
    transition: string;
    height: string;
    backgroundColor: string;
    transform: string;
    transformHover: string;
  };
  image: {
    height: string;
    objectFit: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
    transition: string;
    transform: string;
    transformHover: string;
  };
  content: {
    padding: string;
    flexDirection: 'column' | 'row';
    alignItems: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
  };
  title: {
    size: string;
    marginBottom: string;
  };
  price: {
    color: string;
  };
  button: {
    background: string;
    padding: string;
    borderRadius: string;
    fontSize: string;
    fontWeight: string;
    transition: string;
    opacity: number;
    iconSize: string;
  };
  rating: {
    activeColor: string;
    inactiveColor: string;
    size: string;
  };
};


// Configuration des cartes de produits - Modifiez ces valeurs selon vos besoins
const productCardConfig: ProductCardConfig = {
  // Style du conteneur principal
  container: {
    columns: {
      default: 1,    // Colonnes par défaut (mobile)
      md: 2,         // Colonnes sur écran moyen
      lg: 3,         // Colonnes sur écran large
      xl: 4          // Colonnes sur très grand écran
    },
    gap: '1.5rem',   // Espacement réduit entre les cartes
    paddingY: '2rem', // Espacement vertical réduit
    paddingX: '0.75rem'  // Padding horizontal réduit sur mobile
  },
  
  // Style de la carte
  card: {
    borderRadius: '0.75rem',     // Rayon des coins réduit
    shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    hoverShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    transition: 'all 0.2s ease', // Animation plus rapide
    height: '100%',             // Hauteur de la carte
    backgroundColor: 'white',    // Couleur de fond
    transform: 'translateY(0)',
    transformHover: 'translateY(-0.25rem)'
  } as const,
  
  // Style de l'image
  image: {
    height: '40rem',            // Hauteur de l'image
    objectFit: 'cover' as const, // Comment l'image remplit son conteneur
    transition: 'transform 0.5s ease', // Animation de l'image
    transform: 'scale(1)',
    transformHover: 'scale(1.05)'
  } as const,
  
  // Style du contenu
  content: {
    padding: '2rem',            // Espacement intérieur
    flexDirection: 'column',    // Direction du contenu
    alignItems: 'stretch'       // Alignement des éléments
  },
  
  // Style du titre
  title: {
    size: '1.75rem',           // Taille de police augmentée
    marginBottom: '1rem'       // Marge inférieure augmentée
  },
  
  // Style du prix
  price: {
    color: '#DB2777'          // Couleur du texte (rose)
  },
  
  // Style du bouton
  button: {
    padding: '1rem 1.5rem',    // Remplissage intérieur
    borderRadius: '0.75rem',   // Rayon des coins
    fontSize: '1.125rem',      // Taille de police
    fontWeight: '500',         // Épaisseur de la police
    transition: 'all 0.2s',    // Animation de transition
    background: 'linear-gradient(to right, #DB2777, #F43F5E)',
    opacity: 1,
    iconSize: '1.5rem'        // Taille de l'icône
  } as const,
  
  // Style du badge "En stock"
  inStockBadge: {
    backgroundColor: '#D1FAE5', // Couleur de fond
    textColor: '#065F46',      // Couleur du texte
    padding: '0.25rem 0.75rem', // Remplissage intérieur
    borderRadius: '9999px',    // Coins arrondis
    fontSize: '0.875rem',      // Taille de police
    fontWeight: '500'          // Épaisseur de la police
  },
  
  // Style des étoiles de notation
  rating: {
    activeColor: '#F59E0B',    // Couleur des étoiles actives
    inactiveColor: '#E5E7EB',  // Couleur des étoiles inactives
    size: '1.25rem'            // Taille des étoiles
  }
};

const Products = () => {
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();
  const { selectProduct } = useProductSelection();
  const { addNotification } = useNotification();
  const productsSectionRef = useRef<HTMLDivElement>(null);
  const isRTL = i18n.language === 'ar';
  
  // Fonction de traduction simplifiée
  const translateProduct = (productId: number, key: string, defaultValue: string): string => {
    try {
      const translation = (t as any)(`products.items.${productId}.${key}`, { defaultValue });
      return translation === `products.items.${productId}.${key}` ? defaultValue : String(translation);
    } catch (error) {
      console.error('Erreur lors de la traduction:', error);
      return defaultValue;
    }
  };
  
  const handleAddToCart = (product: Omit<Product, 'detailImage'> & { detailImage?: string }, e: MouseEvent) => {
    e.stopPropagation();
    const productWithQuantity = { 
      ...product, 
      quantity: 1,
      detailImage: product.detailImage || product.image
    };
    
    // Afficher la notification
    addNotification(t('product.addedToCart', 'Produit ajouté au panier !'));
    addToCart(productWithQuantity);
  };
  
  const handleViewDetails = (productId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const targetUrl = `/product/${productId}`;
    
    // Vérifier si la navigation est déjà en cours
    if (window.location.pathname === targetUrl) {
      window.location.reload();
      return;
    }
    
    // Utiliser window.location pour forcer un rechargement complet
    window.location.href = targetUrl;
  };
  
  const scrollToElement = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Utiliser requestAnimationFrame pour s'assurer que le DOM est prêt
      requestAnimationFrame(() => {
        const headerHeight = 80;
        const offset = 40; // Augmenter l'offset pour éviter que le titre ne soit caché
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - (headerHeight + offset);
        
        // Utiliser scrollTo avec un comportement fluide
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        // Forcer un nouveau calcul de la position après un court délai
        setTimeout(() => {
          const newPosition = element.getBoundingClientRect().top + window.pageYOffset - (headerHeight + offset);
          if (Math.abs(window.scrollY - newPosition) > 50) { // Vérifier si le défilement s'est arrêté trop tôt
            window.scrollTo({
              top: newPosition,
              behavior: 'smooth'
            });
          }
        }, 500);
      });
    }
  }, []);

  useEffect(() => {
    // Vérifier si un produit est stocké dans le sessionStorage
    const selectedProductId = sessionStorage.getItem('selectedProduct');
    
    if (selectedProductId) {
      const productId = parseInt(selectedProductId, 10);
      const productExists = products.some(p => p.id === productId);
      
      if (productExists) {
        // Faire défiler jusqu'à la section produits
        if (productsSectionRef.current) {
          scrollToElement('produits');
          
          // Sélectionner le produit après un court délai
          setTimeout(() => {
            selectProduct(productId);
            // Nettoyer le sessionStorage après utilisation
            sessionStorage.removeItem('selectedProduct');
          }, 1000);
        }
      } else {
        // Nettoyer le sessionStorage si le produit n'existe pas
        sessionStorage.removeItem('selectedProduct');
      }
    }
  }, [selectProduct]);


  return (
    <section 
      id="produits" 
      className={`bg-white ${isRTL ? 'rtl' : 'ltr'}`}
      style={{
        paddingTop: productCardConfig.container.paddingY,
        paddingBottom: productCardConfig.container.paddingY,
        direction: isRTL ? 'rtl' : 'ltr'
      }}
      ref={productsSectionRef}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('products.title' as any)}
            <span className="text-pink-600"> {t('products.signature' as any, '')}</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('products.subtitle' as any)}
          </p>
        </div>

        <div 
          className={`grid 
            grid-cols-1 
            md:grid-cols-2 
            lg:grid-cols-3 
            xl:grid-cols-4 
            gap-6 md:gap-4`}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col h-full cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              style={{
                backgroundColor: productCardConfig.card.backgroundColor,
                borderRadius: productCardConfig.card.borderRadius,
                boxShadow: productCardConfig.card.shadow,
                transition: productCardConfig.card.transition,
                overflow: 'hidden',
                transform: productCardConfig.card.transform
              }}
              onClick={(e) => handleViewDetails(product.id, e)}
            >
              {/* Image du produit */}
              <div className="relative overflow-hidden" style={{ height: productCardConfig.image.height }}>
                <img
                  src={product.image.startsWith('http') ? product.image : product.image}
                  alt={product.name}
                  className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                  style={{
                    objectFit: productCardConfig.image.objectFit,
                    transition: productCardConfig.image.transition
                  }}
                />
                <button 
                  className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-pink-100"
                  style={{
                    transition: 'opacity 0.3s ease, background-color 0.2s'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Ajouter aux favoris
                  }}
                >
                  <Heart className="h-5 w-5 text-pink-600" />
                </button>
              </div>

              {/* Contenu de la carte */}
              <div 
                className="flex-grow flex flex-col"
                style={{
                  padding: productCardConfig.content.padding,
                  flexDirection: productCardConfig.content.flexDirection as 'column',
                  alignItems: productCardConfig.content.alignItems as 'stretch'
                }}
              >
                <div className="space-y-5 flex-grow">
                  <h3 
                    className="font-bold text-gray-900"
                    style={{
                      fontSize: productCardConfig.title.size,
                      marginBottom: productCardConfig.title.marginBottom,
                      lineHeight: '1.3'
                    }}
                  >
                    {translateProduct(product.id, 'name', product.name)}
                  </h3>
                  <p className="text-gray-600">
                    {translateProduct(product.id, 'description', product.description)}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          style={{
                            height: productCardConfig.rating.size,
                            width: productCardConfig.rating.size,
                            color: i < Math.floor(product.rating) 
                              ? productCardConfig.rating.activeColor 
                              : productCardConfig.rating.inactiveColor
                          }}
                        />
                      ))}
                      <span 
                        className="ml-2 text-gray-600 text-sm"
                      >
                        {product.rating}
                      </span>
                    </div>
                    <span 
                      className="text-2xl font-bold"
                      style={{
                        color: productCardConfig.price.color,
                        direction: 'ltr',
                        display: 'inline-block'
                      }}
                    >
                      {product.price} DH
                    </span>
                  </div>


                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <span 
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-100"
                    >
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                      {t('products.inStock' as any, 'En stock')}
                    </span>
                    
                    <div className="text-sm font-semibold text-green-700">
                      {product.id === 1 
                        ? t('products.shipping' as any, 'Livraison gratuite')
                        : t('products.shipping20' as any, 'Livraison 20 DH')}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 mt-6">
                  <button 
                    className="w-full text-white flex items-center justify-center space-x-3 hover:opacity-90 hover:shadow-lg transition-all duration-200"
                    style={{
                      background: productCardConfig.button.background,
                      padding: productCardConfig.button.padding,
                      borderRadius: productCardConfig.button.borderRadius,
                      fontSize: productCardConfig.button.fontSize,
                      fontWeight: productCardConfig.button.fontWeight,
                      transition: productCardConfig.button.transition,
                      opacity: productCardConfig.button.opacity
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product, e);
                    }}
                  >
                    <ShoppingCart 
                      style={{
                        height: productCardConfig.button.iconSize,
                        width: productCardConfig.button.iconSize
                      }}
                    />
                    <span>{t('products.addToCart' as any, isRTL ? 'أضف إلى السلة' : 'Ajouter au panier')}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;