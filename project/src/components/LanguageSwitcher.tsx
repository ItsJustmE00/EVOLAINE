import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  const changeLanguage = async (lng: string) => {
    try {
      await i18n.changeLanguage(lng);
      setCurrentLang(lng);
      document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lng;
      localStorage.setItem('i18nextLng', lng);
      
      // Forcer le rechargement des composants qui pourraient ne pas se mettre à jour automatiquement
      window.dispatchEvent(new Event('languageChanged'));
    } catch (error) {
      console.error('Erreur lors du changement de langue:', error);
    }
  };

  // Appliquer la direction et la langue au chargement
  useEffect(() => {
    const savedLang = localStorage.getItem('i18nextLng') || 'fr';
    if (savedLang !== i18n.language) {
      changeLanguage(savedLang);
    }
    
    // Écouter les changements de langue depuis d'autres composants
    const handleLanguageChange = () => {
      setCurrentLang(i18n.language);
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  return (
    <div className="flex items-center space-x-2 rtl:space-x-reverse">
      <button 
        onClick={() => changeLanguage('fr')} 
        className={`px-3 py-1 rounded-md text-sm font-medium ${
          currentLang === 'fr' 
            ? 'bg-pink-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        FR
      </button>
      <button 
        onClick={() => changeLanguage('ar')} 
        className={`px-3 py-1 rounded-md text-sm font-medium ${
          currentLang === 'ar' 
            ? 'bg-pink-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        عربي
      </button>
    </div>
  );
};

export default LanguageSwitcher;
