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
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderNumber] = useState(`CMD-${Math.floor(100000 + Math.random() * 900000)}`);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier que le panier n'est pas vide
    if (!cart || cart.length === 0) {
      alert('Votre panier est vide. Veuillez ajouter des articles avant de passer commande.');
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
                
                <form onSubmit={handleSubmitOrder} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                        {t('checkout.firstName', 'Prénom')}
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="first_name"
                          name="first_name"
                          required
                          value={formData.first_name}
                          onChange={handleInputChange}
                          className="focus:ring-pink-500 focus:border-pink-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                          placeholder={t('checkout.firstName', 'Votre prénom')}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                        {t('checkout.lastName', 'Nom')}
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="last_name"
                          name="last_name"
                          required
                          value={formData.last_name}
                          onChange={handleInputChange}
                          className="focus:ring-pink-500 focus:border-pink-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                          placeholder={t('checkout.lastName', 'Votre nom')}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      {t('checkout.phone', 'Téléphone')}
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="focus:ring-pink-500 focus:border-pink-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                        placeholder={t('checkout.phone', 'Votre numéro de téléphone')}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        {t('checkout.address', 'Adresse de livraison')}
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute top-3 left-3">
                          <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <textarea
                          name="address"
                          id="address"
                          rows={3}
                          required
                          value={formData.address}
                          onChange={handleInputChange}
                          className="focus:ring-pink-500 focus:border-pink-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                          placeholder={t('checkout.address', 'Votre adresse complète')}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        {t('checkout.city', 'Ville')}
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="city"
                          id="city"
                          required
                          value={formData.city}
                          onChange={handleInputChange}
                          className="focus:ring-pink-500 focus:border-pink-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                          placeholder={t('checkout.city', 'Votre ville')}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                      <p>{t('cart.total', 'Total')}</p>
                      <p>{cartTotal} {t('common.currency', 'DH')}</p>
                    </div>
                    <button
                      type="submit"
                      className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                    >
                      {t('checkout.submit', 'Confirmer la commande')}
                    </button>
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
