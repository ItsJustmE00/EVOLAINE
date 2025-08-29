import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

// Solution simple pour éviter les erreurs de typage avec i18n
const useTypedTranslation = () => {
  const { t, i18n } = useTranslation();
  // @ts-ignore - On ignore les erreurs de typage pour les clés de traduction
  return { t, i18n };
};

// Chargement paresseux du composant ScrollingBanner
const ScrollingBanner = lazy(() => import('./ScrollingBanner'));

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTypedTranslation();
  const { itemCount } = useCart();

  // Fermer le menu quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Gestion de la navigation
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, sectionId?: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    
    if (sectionId) {
      const cleanSectionId = sectionId.replace('#', '');
      
      // Si on n'est pas sur l'accueil, on y va avec le hash
      if (window.location.pathname !== '/') {
        window.location.href = `/#${cleanSectionId}`;
        return;
      }
      
      // Si on est sur l'accueil, on fait défiler
      const element = document.getElementById(cleanSectionId);
      if (element) {
        // Calcul de la position avec offset pour le header
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        // Mise à jour de l'URL sans rechargement
        window.history.pushState(null, '', `#${cleanSectionId}`);
      } else {
        // Si l'élément n'est pas trouvé, on essaie de faire défiler vers le haut
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // Pour l'accueil, on utilise une navigation simple
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.history.pushState(null, '', window.location.pathname);
      }
    }
  };

  const isRTL = i18n.language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  return (
    <header ref={menuRef} className={`fixed w-full top-0 z-50 mt-0 ${isRTL ? 'rtl' : 'ltr'}`} dir={dir}>
      {/* Bannière défilante */}
      <Suspense fallback={<div className="h-10 bg-yellow-100"></div>}>
        <ScrollingBanner />
      </Suspense>
      
      {/* Barre de navigation principale */}
      <div className="bg-gradient-to-r from-yellow-100 via-rose-400 to-rose-400 hover:from-rose-300 hover:via-rose-300 hover:to-rose-300 transition-all duration-500 w-full shadow-lg py-2" role="banner">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link 
                to="/" 
                onClick={(e) => handleNavigation(e)}
                className="flex items-center"
                aria-label={t('navigation.home')}
              >
                <span className="text-2xl font-bold text-pink-900">EvoLaine</span>
              </Link>
            </div>

            {/* Navigation desktop - Centrée */}
            <nav className="hidden md:flex items-center space-x-4 mx-4">
              <a 
                href="#" 
                onClick={(e) => handleNavigation(e)}
                className="text-pink-900 hover:text-white px-3 py-1 rounded-md text-base font-medium border-b-2 border-transparent hover:border-white transition-colors"
              >
                {isRTL ? 'الرئيسية' : 'Accueil'}
              </a>
              <a 
                href="#" 
                onClick={(e) => handleNavigation(e, 'produits')}
                className="text-pink-900 hover:text-white px-3 py-1 rounded-md text-base font-medium border-b-2 border-transparent hover:border-white transition-colors"
              >
                {isRTL ? 'المنتجات' : 'Produits'}
              </a>
              <a 
                href="#" 
                onClick={(e) => handleNavigation(e, 'a-propos')}
                className="text-pink-900 hover:text-white px-3 py-1 rounded-md text-base font-medium border-b-2 border-transparent hover:border-white transition-colors"
              >
                {isRTL ? 'من نحن' : 'À propos'}
              </a>
              <a 
                href="#" 
                onClick={(e) => handleNavigation(e, 'contact')}
                className="text-pink-900 hover:text-white px-3 py-1 rounded-md text-base font-medium border-b-2 border-transparent hover:border-white transition-colors"
              >
                {isRTL ? 'اتصل بنا' : 'Contact'}
              </a>
            </nav>

            {/* Contrôles utilisateur (panier, langue, menu mobile) */}
            <div className="flex items-center space-x-4">
              {/* Panier */}
              <Link 
                to="/cart" 
                className={`relative flex items-center text-pink-900 hover:text-white rounded-md px-2 py-1 text-base font-medium border-b-2 border-transparent hover:border-white transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                onClick={() => setIsMenuOpen(false)}
                aria-label={t('cart.title')}
              >
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className={`absolute -top-1 ${isRTL ? '-left-1' : '-right-1'} bg-pink-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center`}>
                    {itemCount}
                  </span>
                )}
                <span className={isRTL ? 'mr-1' : 'ml-1'}>
                  {isRTL ? 'السلة' : 'Panier'}
                </span>
              </Link>

              {/* Bouton de changement de langue */}
              <button 
                onClick={() => i18n.changeLanguage(i18n.language === 'fr' ? 'ar' : 'fr')}
                className="px-3 py-1 rounded-md text-base font-medium text-pink-900 hover:text-white border-b-2 border-transparent hover:border-white transition-colors"
                aria-label={i18n.language === 'fr' ? 'التبديل إلى العربية' : 'Passer au français'}
              >
                {i18n.language === 'fr' ? 'عربي' : 'FR'}
              </button>

              {/* Bouton menu mobile */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-1 text-pink-900 hover:text-white focus:outline-none"
                aria-label={isMenuOpen ? (isRTL ? 'إغلاق القائمة' : 'Fermer le menu') : (isRTL ? 'فتح القائمة' : 'Ouvrir le menu')}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden bg-rose-400">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a 
                href="#" 
                onClick={(e) => handleNavigation(e)}
                className="text-pink-900 hover:bg-rose-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              >
                {isRTL ? 'الرئيسية' : 'Accueil'}
              </a>
              <a 
                href="#" 
                onClick={(e) => handleNavigation(e, 'produits')}
                className="text-pink-900 hover:bg-rose-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              >
                {isRTL ? 'المنتجات' : 'Produits'}
              </a>
              <a 
                href="#" 
                onClick={(e) => handleNavigation(e, 'a-propos')}
                className="text-pink-900 hover:bg-rose-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              >
                {isRTL ? 'من نحن' : 'À propos'}
              </a>
              <a 
                href="#" 
                onClick={(e) => handleNavigation(e, 'contact')}
                className="text-pink-900 hover:bg-rose-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              >
                {isRTL ? 'اتصل بنا' : 'Contact'}
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
