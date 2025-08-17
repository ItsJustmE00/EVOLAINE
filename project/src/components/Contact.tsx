// @ts-nocheck - Disable type checking to prevent deep instantiation errors
import React, { useState } from 'react';
import { Phone, MapPin, Clock, Instagram, Facebook } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';

interface FormData {
  fullName: string;
  phone: string;
  subject: string;
  message: string;
}

const Contact = () => {
  // @ts-ignore - Skip type checking for i18n to prevent deep instantiation
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    subject: isRTL ? 'طلب' : 'Commande',
    message: ''
  });
  
  const subjects = [
    { value: isRTL ? 'طلب' : 'Commande', label: isRTL ? 'تتبع الطلب' : 'Suivi de commande' },
    { value: isRTL ? 'إرجاع' : 'Retour', label: isRTL ? 'إرجاع منتج' : 'Retour produit' },
    { value: isRTL ? 'سؤال' : 'Question', label: isRTL ? 'سؤال عن منتج' : 'Question sur un produit' },
    { value: isRTL ? 'أخرى' : 'Autre', label: isRTL ? 'طلب آخر' : 'Autre demande' }
  ];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Soumission du formulaire avec les données:', formData);
    setIsSubmitting(true);
    
    try {
      console.log('Envoi de la requête à l\'API...');
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
        credentials: 'same-origin'
      });
      
      const responseData = await response.json();
      console.log('Réponse du serveur:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Erreur lors de l\'envoi du message');
      }
      
      // Marquer le formulaire comme soumis avec succès
      setIsSubmitted(true);
      
      // Réinitialiser le formulaire
      setFormData({
        fullName: '',
        phone: '',
        subject: 'Commande',
        message: ''
      });
      
      toast.success('Message envoyé avec succès !', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Réinitialiser l'état après 5 secondes
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
      console.error('Détails de l\'erreur:', errorMessage);
      
      toast.error(`Erreur: ${errorMessage}`, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-gray-50 to-white" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {isRTL ? 'اتصلوا بـ ' : 'Contactez'}
            <span className="text-pink-600"> {isRTL ? 'إيفولين' : 'EVOLAINE'}</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {isRTL 
              ? 'هل لديكم سؤال عن منتجاتنا؟ فريقنا متواجد لتقديم النصح لكم' 
              : 'Une question sur nos produits ? Notre équipe est là pour vous conseiller'}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className={`flex items-start ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center shrink-0">
                  <Phone className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{isRTL ? 'الهاتف' : 'Téléphone'}</h3>
                  <p className="text-gray-600" dir="ltr" style={{ unicodeBidi: 'bidi-override' }}>+212 6 59 55 37 41</p>
                  <p className="text-gray-600">{isRTL ? 'الاثنين - الجمعة: 9 ص - 6 م' : 'Lun - Ven: 9h - 18h'}</p>
                </div>
              </div>

<div className={`flex items-start ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center shrink-0">
                  <Instagram className="h-6 w-6 text-pink-600" />
                </div>
                <div className={isRTL ? 'mr-2' : ''}>
                  <h3 className="font-semibold text-gray-900 mb-2">Instagram</h3>
                  <a href="https://www.instagram.com/evolaine_?igsh=OXRkbDM2dWlxY3Nh&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-pink-600">@evolaine_</a>
                </div>  
                <p className={`text-gray-600 ${isRTL ? 'mr-2' : ''}`}>
                  {isRTL ? 'رد خلال 24 ساعة' : 'Réponse sous 24h'}
                </p>
              </div>

              <div className={`flex items-start ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center shrink-0">
                  <Facebook className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Facebook</h3>
                  <a href="https://www.facebook.com/share/1GErQASwn3/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-pink-600">
                    {isRTL ? 'إيفولين المغرب' : 'EVOLAINE Maroc'}
                  </a>
                </div>
              </div>

              <div className={`flex items-start ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{isRTL ? 'العنوان' : 'Adresse'}</h3>
                  <p className="text-gray-600">
                    {isRTL ? 'زاوية شارع الحسن الثاني، أكادير' : 'Avenue Hassan II, Agadir'}
                  </p>
                </div>
              </div>

              <div className={`flex items-start ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center shrink-0">
                  <Clock className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{isRTL ? 'التوصيل' : 'Livraison'}</h3>
                  <p className="text-gray-600">{isRTL ? 'في جميع أنحاء المغرب' : 'Partout au Maroc'}</p>
                  <p className="text-gray-600">{isRTL ? '2-5 أيام عمل' : '2-5 jours ouvrables'}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <h3 className="font-semibold text-gray-900 mb-4">
                {isRTL ? 'تابعونا على' : 'Suivez-nous'}
              </h3>
              <div className={`flex ${isRTL ? 'space-x-reverse space-x-6' : 'space-x-4'}`}>
                <a
                  href="https://www.instagram.com/evolaine_?igsh=OXRkbDM2dWlxY3Nh&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://www.facebook.com/share/1GErQASwn3/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>


        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            {isRTL ? 'أرسلوا لنا رسالة' : 'Envoyez-nous un message'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  {isRTL ? 'الاسم الكامل' : 'Nom complet'}
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
                  placeholder={isRTL ? 'الاسم الكامل' : 'Votre nom complet'}
                  required
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  {isRTL ? 'رقم الهاتف' : 'Numéro de téléphone'}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
                  placeholder={isRTL ? '06XXXXXXXX أو 07XXXXXXXX' : '06XXXXXXXX ou 07XXXXXXXX'}
                  pattern="0[67][0-9]{8}"
                  required
                  dir="ltr"
                />
                
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  {isRTL ? 'الموضوع' : 'Sujet'}
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
                  required
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  {subjects.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                {isRTL ? 'الرسالة' : 'Message'}
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors text-gray-900"
                placeholder={isRTL ? 'اكتب رسالتك هنا...' : 'Écrivez votre message ici...'}
                required
                dir={isRTL ? 'rtl' : 'ltr'}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isSubmitted}
              className={`w-full py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center ${
                isSubmitted 
                  ? 'bg-green-600 text-white' 
                  : 'bg-rose-500 text-white hover:bg-rose-700'
              }`}
            >
              {isSubmitting && (
                <>
                  <svg className={`animate-spin h-5 w-5 text-white ${isRTL ? 'mr-3' : '-ml-1 mr-3'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isRTL ? 'جاري الإرسال...' : 'Envoi en cours...'}
                </>
              )}
              {!isSubmitting && isSubmitted && (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {isRTL ? 'تم إرسال الرسالة!' : 'Message envoyé !'}
                </>
              )}
              {!isSubmitting && !isSubmitted && (
                <>{isRTL ? 'إرسال الرسالة' : 'Envoyer le message'}</>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;