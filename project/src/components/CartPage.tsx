// @ts-nocheck
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, User, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import Cart from './Cart';
// Base URL de l'API (variables d'environnement Vite)
const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/$/, '') || '';
import { useCart } from '../contexts/CartContext';

// Définition du composant

const CartPage = () => {
  const { t } = useTranslation();
  const { itemCount, cartTotal, clearCart, cart } = useCart();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: ''
  });
  
  const [errors, setErrors] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: ''
  });
  
  const [touched, setTouched] = useState({
    first_name: false,
    last_name: false,
    phone: false,
    address: false,
    city: false
  });
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderNumber] = useState(`CMD-${Math.floor(100000 + Math.random() * 900000)}`);

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'first_name':
      case 'last_name':
        return value.trim() === '' ? t('checkout.errors.required', 'Ce champ est requis') : '';
      case 'phone': {
        const phoneRegex = /^(06|07)\d{8}$/;
        const sanitizedPhone = value.replace(/\s+/g, '');
        return !phoneRegex.test(sanitizedPhone) 
          ? t('checkout.errors.invalidPhone', 'Numéro de téléphone invalide (format: 06XXXXXXXX ou 07XXXXXXXX)')
          : '';
      }
      case 'address':
        return value.trim().length < 10 
          ? t('checkout.errors.addressTooShort', 'L\'adresse est trop courte')
          : '';
      case 'city':
        return value.trim() === '' 
          ? t('checkout.errors.required', 'Ce champ est requis') 
          : '';
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Valider le champ s'il a déjà été touché
    if (touched[name as keyof typeof touched]) {
      setErrors(prev => ({
        ...prev,
        [name]: validateField(name, value)
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    setErrors(prev => ({
      ...prev,
      [name]: validateField(name, value)
    }));
  };

  const isFormValid = () => {
    return Object.values(errors).every(error => !error) && 
           Object.values(formData).every(field => field.trim() !== '');
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier que le panier n'est pas vide
    if (!cart || cart.length === 0) {
      alert('Votre panier est vide. Veuillez ajouter des articles avant de passer commande.');
      return;
    }
    
    // Validation du numéro de téléphone
    const phoneRegex = /^(06|07)\d{8}$/;
    const sanitizedPhone = formData.phone.replace(/\s+/g, '');
    if (!phoneRegex.test(sanitizedPhone)) {
      alert(t('checkout.invalidPhone', 'Veuillez entrer un numéro de téléphone valide'));
      return;
    }

    // Préparer les données de la commande
    const orderData = {
      ...formData,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        description: item.description
      })),
      total: cartTotal,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    console.log('Envoi de la commande au serveur...', orderData);
    
    try {
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });
      
      let result: any = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        try { result = JSON.parse(text); } catch { result = { message: text }; }
      }

      if (!response.ok) {
        const errorMessage = result?.details || result?.error || result?.message || 'Erreur lors de la soumission de la commande';
        console.error('Détails de l\'erreur:', result);
        throw new Error(errorMessage);
      }
      
      console.log('Commande enregistrée avec succès:', result);
      
      // Vider le panier
      clearCart();
      
      // Afficher la page de confirmation
      setOrderConfirmed(true);
      
    } catch (error) {
      console.error('Erreur lors de la soumission de la commande:', error);
      // Afficher un message d'erreur à l'utilisateur
      alert(`Erreur: ${error.message || 'Impossible de soumettre la commande. Veuillez réessayer.'}`);
    }
  };
  
  const handleBackToHome = () => {
    window.location.href = '/';
  };

    // Récupérer toutes les traductions nécessaires pour éviter les problèmes de rendu
  const translations = {
    yourCart: t('cart.yourCart', 'Votre panier'),
    items: t('cart.items', 'articles'),
    item: t('cart.item', 'article'),
    deliveryInfo: t('checkout.deliveryInfo', 'Informations de livraison'),
    // Traductions pour le panier vide
    emptyCart: t('cart.emptyCart.title', 'Votre panier est vide'),
    addItemsPrompt: t('cart.emptyCart.message', 'Découvrez nos produits et faites vos premiers achats !'),
    startShopping: t('cart.emptyCart.browseProducts', 'Commencer mes achats'),
    needHelp: t('needHelp', 'Besoin d\'aide ?'),
    contactUs: t('contactUs', 'Contactez-nous'),
    total: t('cart.total', 'Total'),
    currency: t('common.currency', 'DH'),
    confirmOrder: t('checkout.submit', 'Confirmer la commande'),
    // Traductions du formulaire
    firstName: t('checkout.firstName', 'Prénom'),
    lastName: t('checkout.lastName', 'Nom'),
    phone: t('checkout.phone', 'Téléphone'),
    address: t('checkout.address', 'Adresse de livraison'),
    city: t('checkout.city', 'Ville'),
    enterFirstName: t('checkout.firstName', 'Votre prénom'),
    enterLastName: t('checkout.lastName', 'Votre nom'),
    enterPhone: t('checkout.phone', 'Votre numéro de téléphone'),
    enterAddress: t('checkout.address', 'Votre adresse complète'),
    enterCity: t('checkout.city', 'Votre ville')
  };

  // Fonction utilitaire pour s'assurer que la traduction est une chaîne
  const getTranslation = (key: string, defaultValue: string): string => {
    const translation = t(key, defaultValue);
    return typeof translation === 'string' ? translation : defaultValue;
  };

  // Afficher la page de confirmation de commande
  if (orderConfirmed) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('cart.success.title', 'Commande confirmée !')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('cart.success.message', 'Merci pour votre commande. Nous avons envoyé un e-mail de confirmation à votre adresse e-mail.')}
            </p>
            <p className="text-gray-700 font-medium mb-8">
              {t('orderNumber', 'Numéro de commande')}: <span className="text-pink-600">{orderNumber}</span>
            </p>
            <button
              onClick={handleBackToHome}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              {t('cart.success.backHome', 'Retour à l\'accueil')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête de la page */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('cart.yourCart', 'Votre panier')}
          </h1>
          {itemCount > 0 && (
            <p className="text-gray-600">
              {itemCount} {itemCount > 1 ? t('cart.items', 'articles') : t('cart.item', 'article')}
            </p>
          )}
        </div>

        {/* Contenu du panier */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {itemCount > 0 ? (
            <div className="p-6">
              {/* Panier */}
              <div className="mb-8">
                <Cart isModal={false} showCheckoutButton={false} />
              </div>

              {/* Informations de livraison */}
              <div className="bg-white p-6 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t('checkout.deliveryInfo', 'Informations de livraison')}
                </h3>
                
                <form onSubmit={handleSubmitOrder} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Prénom */}
                    <div className="space-y-1">
                      <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                        {t('checkout.firstName', 'Prénom')} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className={`h-5 w-5 ${errors.first_name && touched.first_name ? 'text-red-400' : 'text-gray-400'}`} />
                        </div>
                        <input
                          type="text"
                          id="first_name"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={`block w-full pl-10 pr-3 py-2 sm:text-sm rounded-md ${errors.first_name && touched.first_name ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'}`}
                          placeholder={t('checkout.firstName', 'Votre prénom')}
                          aria-invalid={!!(errors.first_name && touched.first_name)}
                          aria-describedby={errors.first_name && touched.first_name ? 'first_name-error' : undefined}
                        />
                      </div>
                      {errors.first_name && touched.first_name && (
                        <p className="mt-1 text-sm text-red-600" id="first_name-error">{errors.first_name}</p>
                      )}
                    </div>
                    
                    {/* Nom */}
                    <div className="space-y-1">
                      <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                        {t('checkout.lastName', 'Nom')} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className={`h-5 w-5 ${errors.last_name && touched.last_name ? 'text-red-400' : 'text-gray-400'}`} />
                        </div>
                        <input
                          type="text"
                          id="last_name"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={`block w-full pl-10 pr-3 py-2 sm:text-sm rounded-md ${errors.last_name && touched.last_name ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'}`}
                          placeholder={t('checkout.lastName', 'Votre nom')}
                          aria-invalid={!!(errors.last_name && touched.last_name)}
                          aria-describedby={errors.last_name && touched.last_name ? 'last_name-error' : undefined}
                        />
                      </div>
                      {errors.last_name && touched.last_name && (
                        <p className="mt-1 text-sm text-red-600" id="last_name-error">{errors.last_name}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Téléphone */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        {t('checkout.phone', 'Téléphone')} <span className="text-red-500">*</span>
                      </label>
                      <span className="text-xs text-gray-500">Format: 06XXXXXXXX ou 07XXXXXXXX</span>
                    </div>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className={`h-5 w-5 ${errors.phone && touched.phone ? 'text-red-400' : 'text-gray-400'}`} />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`block w-full pl-10 pr-3 py-2 sm:text-sm rounded-md ${errors.phone && touched.phone ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'}`}
                        placeholder={t('checkout.phone', 'Votre numéro de téléphone')}
                        aria-invalid={!!(errors.phone && touched.phone)}
                        aria-describedby={errors.phone && touched.phone ? 'phone-error' : undefined}
                      />
                    </div>
                    {errors.phone && touched.phone && (
                      <p className="mt-1 text-sm text-red-600" id="phone-error">{errors.phone}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Adresse */}
                    <div className="space-y-1">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        {t('checkout.address', 'Adresse de livraison')} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <div className="absolute top-3 left-3">
                          <MapPin className={`h-5 w-5 ${errors.address && touched.address ? 'text-red-400' : 'text-gray-400'}`} />
                        </div>
                        <textarea
                          name="address"
                          id="address"
                          rows={3}
                          value={formData.address}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={`block w-full pl-10 pr-3 py-2 sm:text-sm rounded-md ${errors.address && touched.address ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'}`}
                          placeholder={t('checkout.address', 'Votre adresse complète')}
                          aria-invalid={!!(errors.address && touched.address)}
                          aria-describedby={errors.address && touched.address ? 'address-error' : undefined}
                        />
                      </div>
                      {errors.address && touched.address && (
                        <p className="mt-1 text-sm text-red-600" id="address-error">{errors.address}</p>
                      )}
                    </div>
                    {/* Ville */}
                    <div className="space-y-1">
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        {t('checkout.city', 'Ville')} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className={`h-5 w-5 ${errors.city && touched.city ? 'text-red-400' : 'text-gray-400'}`} />
                        </div>
                        <input
                          type="text"
                          name="city"
                          id="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={`block w-full pl-10 pr-3 py-2 sm:text-sm rounded-md ${errors.city && touched.city ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'}`}
                          placeholder={t('checkout.city', 'Votre ville')}
                          aria-invalid={!!(errors.city && touched.city)}
                          aria-describedby={errors.city && touched.city ? 'city-error' : undefined}
                        />
                      </div>
                      {errors.city && touched.city && (
                        <p className="mt-1 text-sm text-red-600" id="city-error">{errors.city}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                      <p>{t('cart.total', 'Total')}</p>
                      <p>{cartTotal} {t('common.currency', 'DH')}</p>
                    </div>
                    <button
                      type="submit"
                      disabled={!isFormValid()}
                      className={`w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
                        isFormValid()
                          ? 'bg-pink-600 hover:bg-pink-700 focus:ring-2 focus:ring-offset-2 focus:ring-pink-500'
                          : 'bg-pink-400 cursor-not-allowed'
                      } focus:outline-none`}
                      aria-disabled={!isFormValid()}
                    >
                      {t('checkout.submit', 'Confirmer la commande')}
                    </button>
                    {!isFormValid() && (
                      <p className="mt-2 text-sm text-gray-500 text-center">
                        Veuillez remplir tous les champs obligatoires correctement
                      </p>
                    )}
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gray-100 mb-4">
                <ShoppingBag className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('cart.emptyCart.title', 'Votre panier est vide')}
              </h3>
              <p className="text-gray-500 mb-6">
                {t('cart.emptyCart.message', 'Découvrez nos produits et faites vos premiers achats !')}
              </p>
              <button
                onClick={() => window.location.href = '/products'}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              >
                {t('cart.emptyCart.browseProducts', 'Commencer mes achats')}
              </button>
            </div>
          )}
        </div>

        {/* Informations supplémentaires */}
        {itemCount > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              {getTranslation('needHelp', 'Besoin d\'aide ?')}{' '}
              <a href="#" className="text-pink-600 hover:text-pink-500">
                {getTranslation('contactUs', 'Contactez-nous')}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
