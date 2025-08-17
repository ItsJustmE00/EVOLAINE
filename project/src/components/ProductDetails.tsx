// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Star } from 'lucide-react';
import { useTranslation, useI18next } from 'react-i18next';
import i18n from 'i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { products } from '../data/products';

// Using type assertions to avoid complex type inference
// @ts-ignore - Ignore type checking for the entire file to prevent deep instantiation errors
const typedProducts = products;

export default function ProductDetails() {
  // Hooks and state
  const { t, i18n } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  // Using any for state to avoid complex types that cause deep instantiation
  const [product, setProduct] = useState<any>(null);
  const [localizedProduct, setLocalizedProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Update translations when language changes
  const updateTranslations = useCallback(() => {
    if (!id) return;
    
    const productId = parseInt(id, 10);
    // @ts-ignore - Ignore deep instantiation error
    const foundProduct = { ...typedProducts.find(p => p.id === productId) };
    
    if (!foundProduct) {
      navigate('/not-found');
      return;
    }
    
    setProduct(foundProduct);
    
    // Simple text translation helper with minimal type constraints
    const getTranslatedText = (field: string, fallback: string): string => {
      const fullKey = `products.items.${foundProduct.id}.${field}`;
      const value = (foundProduct as any)[field] ?? fallback;
      return t(fullKey, { defaultValue: String(value) }) as string;
    };
    
    // Simple benefits translation helper with minimal type constraints
    const getTranslatedBenefits = (): string[] => {
      const currentLang = i18n.language;
      
      try {
        // Try to get translations for the current language
        const translations = i18n.getDataByLanguage(currentLang)?.translation;
        
        // If we have translations for this product's benefits in the current language, use them
        if (translations?.products?.items?.[foundProduct.id]?.benefits) {
          return translations.products.items[foundProduct.id].benefits;
        }
        
        // Fallback: Try with the t function and returnObjects
        const translatedBenefits = i18n.t(`products.items.${foundProduct.id}.benefits`, { 
          lng: currentLang,
          returnObjects: true,
          defaultValue: null
        });
        
        if (Array.isArray(translatedBenefits) && translatedBenefits.length > 0) {
          return translatedBenefits.map(String);
        }
        
        // If no translations found, return the default benefits
        return [...(foundProduct.benefits || [])].map(String);
      } catch (error) {
        console.error('Error in getTranslatedBenefits:', error);
        return [...(foundProduct.benefits || [])].map(String);
      }
    };
    
    // Build localized product data with direct property access
    const localized: AnyObject = {
      name: getTranslatedText('name', foundProduct.name || ''),
      description: getTranslatedText('description', foundProduct.description || ''),
      price: foundProduct.price || '',
      detailedDescription: getTranslatedText('detailedDescription', foundProduct.detailedDescription || ''),
      benefits: getTranslatedBenefits(),
      howToUse: getTranslatedText('howToUse', foundProduct.howToUse || ''),
      ingredients: getTranslatedText('ingredients', foundProduct.ingredients || '')
    };
    
    // Add optional fields if they exist
    if (foundProduct.length) {
      localized.length = foundProduct.length;
    }
    
    setLocalizedProduct(localized);
    
    // Set first image as selected by default
    setSelectedImage(0);
    setIsLoading(false);
  }, [id, t]);

  // Initial load and language change handler
  useEffect(() => {
    updateTranslations();
    
    // Subscribe to language changes
    const handleLanguageChange = () => {
      updateTranslations();
    };
    
    // @ts-ignore - Ignore deep instantiation error
    i18n.on('languageChanged', handleLanguageChange);
    
    // Cleanup
    return () => {
      // @ts-ignore - Ignore deep instantiation error
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [updateTranslations]);
  
  // Handle adding product to cart
  const handleAddToCart = useCallback(() => {
    if (!product) return;
    
    // Get existing cart or initialize empty array
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already exists in cart
    const existingItemIndex = existingCart.findIndex((item: any) => 
      item.id === product.id && item.length === product.length
    );
    
    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      existingCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity,
        length: product.length
      });
    }
    
    // Save updated cart
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    // Show success message
    alert(t('product.addedToCart', 'Product added to cart!') as string);
  }, [product, quantity, t]);
  
  // Handle quantity changes
  const handleQuantityChange = useCallback((newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
  }, []);

  // Show loading state
  if (isLoading || !product || !localizedProduct) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Prepare product images array
  // Ensure product is defined before accessing its properties
  if (!product || !localizedProduct) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const productImages = [product.image, product.detailImage].filter(Boolean) as string[];
  const selectedImageIndex = selectedImage;

  return (
    <div className={`container mx-auto px-4 py-8 ${isRTL ? 'rtl' : 'ltr'}`}>
      <button 
        onClick={() => navigate(-1)}
        className={`flex items-center text-gray-600 hover:text-pink-600 mb-6 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        <ArrowLeft className={`w-5 h-5 ${isRTL ? 'ml-2 transform rotate-180' : 'mr-2'}`} />
        {t('productDetail.back', 'Retour')}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="mb-4 rounded-lg overflow-hidden h-[1000px] w-full">
            <img 
              src={productImages[selectedImageIndex] || product.image} 
              alt={product.name}
              className="w-full h-full rounded-lg object-cover object-center"
            />
          </div>
          <div className="flex space-x-2 overflow-x-auto">
            {productImages.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(Number(index))}
                className={`w-20 h-20 rounded-md overflow-hidden flex-shrink-0 ${
                  selectedImageIndex === index ? 'ring-2 ring-pink-500' : ''
                }`}
              >
                <img 
                  src={img} 
                  alt={`${product.name} - ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div dir={isRTL ? 'rtl' : 'ltr'} className={`text-${isRTL ? 'right' : 'left'}`}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {localizedProduct.name}
          </h1>
          
          <div className="flex items-center mb-4">
            <div className="flex text-yellow-400 mr-2">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`} 
                />
              ))}
            </div>
            <span className="text-gray-600 text-sm">({product.rating})</span>
          </div>

          <div className="mb-6">
            <p className="text-2xl font-bold text-pink-600">
              {product.price} {t('common.currency', 'DH')}
            </p>
            {localizedProduct.length && (
              <p className="text-gray-500 text-sm mt-1">
                {t('productDetail.capacity', 'Contenance')}: {localizedProduct.length}
              </p>
            )}
          </div>
          
          <div className="mb-6">
            <p className="text-gray-700 mb-6">{localizedProduct.detailedDescription}</p>
          </div>

          <div className="flex items-center mb-6">
            <span className={`${isRTL ? 'ml-4' : 'mr-4'} text-gray-700`}>
              {t('productDetail.quantity', 'Quantité')}:
            </span>
            <div className="flex items-center border rounded-md overflow-hidden">
              <button 
                onClick={() => handleQuantityChange(quantity - 1)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                -
              </button>
              <span className="px-4 py-1">{quantity}</span>
              <button 
                onClick={() => handleQuantityChange(quantity + 1)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleAddToCart}
              className="w-full bg-pink-600 text-white py-3 px-6 rounded-md hover:bg-pink-700 transition-colors flex items-center justify-center"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {t('productDetail.addToCart', 'Ajouter au panier')}
            </button>
          </div>

          {/* Sections détaillées sous le bouton */}
          <div className="mt-12 space-y-8">
            {localizedProduct.benefits && localizedProduct.benefits.length > 0 && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-pink-600">
                  {t('productDetail.benefitsTitle', 'Avantages')}
                </h3>
                <ul className={`list-disc ${isRTL ? 'pr-5' : 'pl-5'} space-y-2`}>
                  {localizedProduct.benefits.map((benefit: string, index: number) => (
                    <li key={index} className="text-gray-600">{benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            {localizedProduct.ingredients && (
              <div className="border-t border-gray-200 pt-6 mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t('productDetail.ingredientsTitle', 'Ingrédients')}
                </h3>
                <p className="text-gray-600">{localizedProduct.ingredients}</p>
              </div>
            )}

            {localizedProduct.howToUse && (
              <div className="border-t border-gray-200 pt-6 mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t('productDetail.howToUseTitle', 'Mode d\'emploi')}
                </h3>
                <p className="text-gray-600 whitespace-pre-line">{localizedProduct.howToUse}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
