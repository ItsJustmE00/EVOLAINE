// @ts-nocheck - Disable type checking to prevent deep instantiation errors
import { useState, useCallback } from 'react';
import { useCart, type CartItem } from '../contexts';
import { X, Plus, Minus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Cart = () => {
  // Tous les hooks doivent être appelés en haut du composant, avant tout retour conditionnel
  const { cart, cartTotal, itemCount, removeFromCart, updateQuantity, clearCart } = useCart();
  // @ts-ignore - Skip type checking for i18n to prevent deep instantiation
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const scrollToElement = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerHeight = 80;
      const offset = 20;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - (headerHeight + offset);
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  const handleContinueShopping = useCallback(() => {
    // Si on est déjà sur la page d'accueil, on fait défiler vers la section produits
    if (window.location.pathname === '/') {
      scrollToElement('produits');
    } else {
      // Sinon, on redirige vers la page d'accueil avec l'ancre produits
      window.location.href = '/#produits';
    }
  }, [scrollToElement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const orderData = {
        ...formData,
        items: cart,
        total: cartTotal
      };
      
      const response = await fetch('http://localhost:3003/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la soumission de la commande');
      }
      
      // Réinitialiser le panier après une commande réussie
      clearCart();
      setOrderPlaced(true);
    } catch (error) {
      console.error('Erreur lors de la commande :', error);
      alert('Une erreur est survenue lors de la commande. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Maintenant que tous les hooks ont été appelés, nous pouvons faire des retours conditionnels
  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-4">{t('cart.success.title')}</h1>
          <p className="text-gray-600 mb-8">{t('cart.success.message')}</p>
          <button 
            onClick={() => {
              // Forcer un rechargement complet de la page d'accueil
              window.location.href = '/';
            }}
            className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors"
          >
            {t('cart.success.backHome')}
          </button>
        </div>
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <h1 className="text-2xl font-bold mb-4">{t('cart.empty.title')}</h1>
        <p className="text-gray-600 mb-8">{t('cart.empty.message')}</p>
        <button 
          onClick={handleContinueShopping}
          className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors inline-block"
        >
          {t('cart.empty.browseProducts')}
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl" dir={isRTL ? 'rtl' : 'ltr'}>
      <h1 className="text-3xl font-bold mb-8">{t('cart.title')}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Liste des articles */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {cart.map((item: CartItem) => (
              <div key={item.id} className="border-b last:border-b-0 p-4 flex">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="ml-4 flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{item.name}</h3>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{item.price}</p>
                  
                  <div className="mt-2 flex items-center">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 border rounded-l-md hover:bg-gray-100"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-1 border-t border-b bg-gray-50">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 border rounded-r-md hover:bg-gray-100"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p className="font-medium">
                    {(parseFloat(item.price) * item.quantity).toFixed(0)} DH
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Formulaire de commande */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">{t('cart.summary')}</h2>
            
            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span>
                  {t('cart.subtotal')} ({itemCount} {itemCount > 1 ? t('cart.items') : t('cart.item')})
                </span>
                <span>{cartTotal.toFixed(0)} DH</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-3 mt-3">
                <span>{t('cart.total')}</span>
                <span>{cartTotal.toFixed(0)} DH</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('cart.form.firstName')}
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('cart.form.lastName')}
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('cart.form.phone')}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('cart.form.address')}
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  {i18n.language === 'ar' ? 'المدينة' : 'Ville'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder={i18n.language === 'ar' ? 'أدخل مدينتك' : 'Entrez votre ville'}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('cart.form.notesOptional')}
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder={t('cart.form.notesPlaceholder')}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity ${isSubmitting ? 'opacity-75' : ''}`}
              >
                {isSubmitting ? t('cart.form.processing') : t('cart.form.submit')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
