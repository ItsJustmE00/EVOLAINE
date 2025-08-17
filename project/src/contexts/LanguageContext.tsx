import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import i18n from 'i18next';

type LanguageContextType = {
  isRTL: boolean;
  toggleLanguage: () => void;
  currentLanguage: string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>(i18n.language);
  const isRTL = currentLanguage === 'ar';

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng);
      document.documentElement.lang = lng;
      document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    };

    i18n.on('languageChanged', handleLanguageChange);
    
    // Appliquer la langue et la direction au chargement initial
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [currentLanguage, isRTL]);

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'fr' ? 'ar' : 'fr';
    i18n.changeLanguage(newLang);
  };

  return (
    <LanguageContext.Provider value={{ isRTL, toggleLanguage, currentLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
