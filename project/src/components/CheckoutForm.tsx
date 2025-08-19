// @ts-nocheck
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

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
    
    // Validation des champs
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    fields.forEach(field => {
      const value = formData[field.name as keyof FormValues] || '';
      if (field.required && !value.toString().trim()) {
        newErrors[field.name] = t('checkout.fieldRequired', 'Ce champ est requis');
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    
    if (!isValid) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://192.168.3.11:3003/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          items: cartItems,
          total: cartTotal,
          status: 'pending',
          city: 'Non spécifiée', // Valeur par défaut
          notes: '' // Valeur par défaut
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la soumission de la commande');
      }

      const data = await response.json();
      clearCart(); // Vider le panier après une commande réussie
      navigate(`/confirmation/${data.id}`);
      
    } catch (error) {
      console.error('Erreur:', error);
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
