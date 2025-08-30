// @ts-nocheck
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
// Base URL de l'API
const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/$/, '') || '';
import { useCart } from '../contexts/CartContext';
import { useTrackCheckout } from '../hooks/useTrackCheckout';

interface FormValues {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
}

const CheckoutForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderId, setOrderId] = useState<string | null>(null);
  
  // Suivi de l'initiation du paiement
  useTrackCheckout(
    cartItems.length > 0
      ? {
          content_ids: cartItems.map(item => item.id),
          value: cartTotal,
          currency: 'MAD',
          contents: cartItems.map(item => ({
            id: item.id,
            quantity: item.quantity,
            item_price: parseFloat(item.price.replace(/[^0-9.,]/g, '').replace(',', '.')),
          })),
          content_name: 'Commande',
          content_category: 'checkout',
          num_items: cartItems.reduce((sum, item) => sum + item.quantity, 0)
        }
      : null,
    true, // Suivre l'initiation du paiement
    false // Ne pas suivre l'achat ici, on le fera après la redirection
  );

  // Effet pour suivre l'achat après la définition de l'orderId
  useEffect(() => {
    if (orderId && cartItems.length > 0) {
      console.log('[CheckoutForm] Commande créée, envoi de l\'événement Purchase', { orderId, cartItems });
      
      // Utiliser directement trackPurchase depuis facebookPixel
      const { trackPurchase } = require('../lib/facebookPixel');
      
      const purchaseData = {
        content_ids: cartItems.map(item => item.id),
        value: cartTotal,
        currency: 'MAD',
        contents: cartItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          item_price: parseFloat(item.price.replace(/[^0-9.,]/g, '').replace(',', '.')),
        })),
        order_id: orderId,
        content_name: 'Achat effectué',
        content_category: 'purchase',
        num_items: cartItems.reduce((sum, item) => sum + item.quantity, 0)
      };
      
      console.log('[CheckoutForm] Données d\'achat:', purchaseData);
      trackPurchase(purchaseData);
      
      // Envoyer également un événement personnalisé pour le suivi
      const { trackEvent } = require('../lib/facebookPixel');
      trackEvent('CheckoutComplete', {
        order_id: orderId,
        value: cartTotal,
        currency: 'MAD',
        num_items: cartItems.reduce((sum, item) => sum + item.quantity, 0)
      });
    }
  }, [orderId, cartItems, cartTotal]);
  
  const [formData, setFormData] = useState<FormValues>({
    firstName: '',
    lastName: '',
    phone: '',
    address: ''
  });

  const fields = [
    {
      name: 'firstName',
      label: t('checkout.firstName', 'Prénom'),
      type: 'text',
      required: true
    },
    {
      name: 'lastName',
      label: t('checkout.lastName', 'Nom'),
      type: 'text',
      required: true
    },
    {
      name: 'phone',
      label: t('checkout.phone', 'Téléphone'),
      type: 'tel',
      required: true
    },
    {
      name: 'address',
      label: t('checkout.address', 'Adresse'),
      type: 'text',
      required: true
    }
  ];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!value.trim()) {
      setErrors(prev => ({
        ...prev,
        [name]: t('checkout.fieldRequired', 'Ce champ est requis')
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('[CheckoutForm] Soumission du formulaire');
    
    // Validation des champs
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    const phoneRegex = /^(06|07)\d{8}$/;

    // Valider chaque champ requis
    fields.forEach(field => {
      const value = formData[field.name as keyof FormValues] || '';
      if (field.required && !value.toString().trim()) {
        newErrors[field.name] = t('checkout.fieldRequired', 'Ce champ est requis');
        isValid = false;
      } else if (field.name === 'phone') {
        const sanitized = value.toString().replace(/\s+/g, '');
        if (!phoneRegex.test(sanitized)) {
          newErrors[field.name] = t('checkout.invalidPhone', 'Veuillez entrer un numéro de téléphone valide');
          isValid = false;
        }
      }
    });
    
    if (!isValid) {
      console.log('[CheckoutForm] Échec de la validation du formulaire:', newErrors);
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Générer un ID de commande unique
      const generatedOrderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      console.log('[CheckoutForm] ID de commande généré:', generatedOrderId);
      
      // Préparer les données de la commande
      const orderData = {
        ...formData,
        orderId: generatedOrderId,
        items: cartItems,
        total: cartTotal,
        status: 'pending',
      };
      
      console.log('[CheckoutForm] Envoi de la commande:', orderData);
      
      // Envoyer la commande à l'API
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[CheckoutForm] Erreur API:', response.status, errorText);
        throw new Error('Erreur lors de la soumission de la commande');
      }
      
      const responseData = await response.json();
      console.log('[CheckoutForm] Commande créée avec succès:', responseData);
      
      // Définir l'ID de commande pour déclencher le suivi
      const finalOrderId = responseData.id || generatedOrderId;
      console.log('[CheckoutForm] ID de commande final:', finalOrderId);
      setOrderId(finalOrderId);
      
      // Vider le panier après une commande réussie
      clearCart();
      
      // Envoyer un événement de conversion personnalisé
      try {
        const { trackEvent } = require('../lib/facebookPixel');
        trackEvent('Lead', {
          content_category: 'purchase',
          content_name: 'Commande validée',
          value: cartTotal,
          currency: 'MAD',
          order_id: finalOrderId
        });
      } catch (error) {
        console.error('[CheckoutForm] Erreur lors de l\'envoi de l\'événement Lead:', error);
      }
      
      // Attendre un court instant pour s'assurer que le suivi est effectué
      setTimeout(() => {
        console.log('[CheckoutForm] Redirection vers la page de confirmation');
        // Rediriger vers la page de confirmation avec l'ID de commande
        navigate('/confirmation', { 
          state: { 
            orderId: finalOrderId,
            orderDetails: responseData
          } 
        });
      }, 1000); // Augmenté à 1s pour plus de fiabilité
      
    } catch (error) {
      console.error('[CheckoutForm] Erreur lors de la soumission:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Animation des champs
  const inputAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
      },
    }),
  };
  
  // Rendu d'un champ du formulaire
  const renderField = (field: any, index: number) => {
    const fieldError = errors[field.name];
    const fieldId = `checkout-${field.name}`;

    return (
      <motion.div
        key={field.name}
        custom={index}
        initial="hidden"
        animate="visible"
        variants={inputAnimation}
        className="space-y-4"
      >
        <label htmlFor={fieldId} className="block text-base font-medium text-gray-800 mb-2">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <div className="mt-1">
          <input
            type={field.type}
            id={fieldId}
            name={field.name}
            value={formData[field.name as keyof FormValues]}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`mt-1 block w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200 ${
              fieldError ? 'border-red-500' : ''
            }`}
            placeholder={field.label}
          />
        </div>
        {fieldError && (
          <p className="mt-1 text-sm text-red-600">
            {fieldError}
          </p>
        )}
      </motion.div>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-2xl border-2 border-pink-100">
      <h2 className="text-3xl font-bold mb-8 text-pink-700 text-center">
        {t('checkout.title', 'Détails de livraison')}
      </h2>
      
      <div className="bg-pink-50 p-6 rounded-xl border-2 border-pink-200">
        <h3 className="text-xl font-semibold mb-6 text-pink-800 border-b-2 border-pink-200 pb-2">
          {t('checkout.contactInfo', 'Informations de contact')}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {fields.map((field, index) => (
              <div key={field.name}>
                {renderField(field, index)}
              </div>
            ))}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('checkout.processing', 'Traitement...')}
                </>
              ) : (
                t('checkout.submit', 'Confirmer la commande')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;
