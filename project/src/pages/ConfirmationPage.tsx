import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { trackPurchase } from '../lib/facebookPixel';

const ConfirmationPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Récupérer les données de la commande depuis l'état de navigation
  const { orderId, orderDetails } = location.state || {};
  
  // Si aucune donnée de commande n'est disponible, rediriger vers la page d'accueil
  useEffect(() => {
    console.log('[ConfirmationPage] Chargement de la page de confirmation', { orderId, orderDetails });
    
    if (!orderId) {
      console.warn('[ConfirmationPage] Aucun orderId trouvé, redirection vers la page d\'accueil');
      navigate('/');
      return;
    }
    
    // Suivre l'achat avec Facebook Pixel
    if (orderDetails) {
      console.log('[ConfirmationPage] Suivi de l\'achat avec Facebook Pixel', { orderDetails });
      
      // Préparer les données de l'événement Purchase
      const purchaseData = {
        content_ids: orderDetails.items?.map((item: any) => item.id) || [],
        content_type: 'product',
        value: orderDetails.total || 0,
        currency: 'MAD',
        contents: orderDetails.items?.map((item: any) => ({
          id: item.id,
          quantity: item.quantity || 1,
          item_price: parseFloat(item.price?.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0,
        })) || [],
        order_id: orderId,
        content_name: 'Achat effectué',
        content_category: 'purchase',
        num_items: orderDetails.items?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 1
      };
      
      console.log('[ConfirmationPage] Données d\'achat pour Facebook Pixel:', purchaseData);
      
      // Envoyer l'événement Purchase
      trackPurchase(purchaseData);
      
      // Envoyer également un événement personnalisé pour le suivi
      try {
        const { trackEvent } = require('../lib/facebookPixel');
        trackEvent('PurchaseConfirmed', {
          order_id: orderId,
          value: orderDetails.total || 0,
          currency: 'MAD',
          num_items: purchaseData.num_items
        });
      } catch (error) {
        console.error('[ConfirmationPage] Erreur lors de l\'envoi de l\'événement PurchaseConfirmed:', error);
      }
    } else {
      console.warn('[ConfirmationPage] Aucun détail de commande trouvé pour le suivi');
    }
  }, [orderId, orderDetails, navigate]);
  
  if (!orderId) {
    return null; // Redirection en cours
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-green-50 p-6 sm:p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            {t('confirmation.thankYou', 'Merci pour votre commande !')}
          </h1>
          <p className="mt-2 text-gray-600">
            {t('confirmation.orderReceived', 'Votre commande a été reçue et est en cours de traitement.')}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {t('confirmation.orderNumber', 'Numéro de commande')}: 
            <span className="font-medium"> {orderId}</span>
          </p>
        </div>
        
        <div className="p-6 sm:p-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {t('confirmation.orderDetails', 'Détails de la commande')}
          </h2>
          
          {orderDetails?.items?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-md font-medium text-gray-900 mb-2">
                {t('confirmation.items', 'Articles commandés')}
              </h3>
              <div className="border-t border-gray-200">
                {orderDetails.items.map((item: any, index: number) => (
                  <div key={index} className="py-4 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                        <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 text-right">
                      <p className="text-sm font-medium text-gray-900">{item.price}</p>
                      <p className="text-sm text-gray-500">
                        {t('cart.quantity', 'Quantité')}: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="flex justify-between text-base font-medium text-gray-900">
              <p>{t('cart.total', 'Total')}</p>
              <p>{orderDetails?.total || '0,00 MAD'}</p>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">
              {t('confirmation.taxesIncluded', 'TVA incluse, frais de livraison calculés à l\'étape suivante.')}
            </p>
            
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {t('confirmation.continueShopping', 'Continuer vos achats')}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ConfirmationPage;
