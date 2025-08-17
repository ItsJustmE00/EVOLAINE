import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { fr, ar } from './translations';

// Configuration des ressources de traduction
const resources = {
  fr: {
    translation: fr
  },
  ar: {
    translation: ar
  }
};

// Configuration d'i18next
const initI18n = () => {
  // Récupérer la langue sauvegardée ou utiliser le français par défaut
  const savedLang = typeof window !== 'undefined' ? localStorage.getItem('i18nextLng') || 'fr' : 'fr';
  
  // Définir la direction du document en fonction de la langue
  if (typeof document !== 'undefined') {
    document.documentElement.lang = savedLang;
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
  }

  const defaultOptions = {
    resources,
    lng: savedLang,
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'ar'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
      checkWhitelist: true
    },
    react: {
      useSuspense: true,
    },
    saveMissing: false,
    missingKeyHandler: (key: string) => {
      console.warn(`Traduction manquante: ${key}`);
      return key;
    },
    returnObjects: true,
    joinArrays: '\n',
  };

  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init(defaultOptions as any) // Utilisation de 'as any' pour éviter les erreurs de typage
    .catch((err) => {
      console.error('Erreur lors de l\'initialisation de i18n:', err);
    });
};

// Initialisation
initI18n();

// Export des types pour une meilleure intégration TypeScript
declare module 'i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: typeof fr & {
        testimonials: {
          title: string;
          subtitle: string;
          items: Array<{
            name: string;
            city: string;
            comment: string;
          }>;
        };
        contact: {
          title: string;
          subtitle: string;
          infoTitle: string;
          socialMediaTitle: string;
          phone: {
            title: string;
            number: string;
            availability: string;
          };
          hours: {
            title: string;
            weekdays: string;
            saturday: string;
          };
          address: {
            title: string;
            line1: string;
            line2: string;
          };
          form: {
            title: string;
            firstName: string;
            firstNamePlaceholder: string;
            lastName: string;
            lastNamePlaceholder: string;
            phone: string;
            subject: string;
            message: string;
            messagePlaceholder: string;
            submit: string;
            submitting: string;
            success: string;
            error: string;
            subjects: {
              product: string;
              order: string;
              return: string;
              other: string;
            };
          };
        };
      };
    };
  }
}

export default i18n;
