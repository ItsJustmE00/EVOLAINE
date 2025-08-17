import React, { useState, Suspense, useCallback, useEffect, useRef } from 'react';
import { Menu, X, ShoppingBag, Loader2, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

// Chargement paresseux du composant ScrollingBanner
const ScrollingBanner = () => {
  const LazyScrollingBanner = React.lazy(() => import('./ScrollingBanner'));
  return (
    <Suspense fallback={<div className="bg-gray-900 h-8 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}>
      <LazyScrollingBanner />
    </Suspense>
  );
};

type HeaderProps = {
  // Props du composant si nécessaire
};

const Header: React.FC<HeaderProps> = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu lors d'un clic en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fonction d'aide pour les traductions avec des clés de navigation
  const tNav = (key: string) => t(key as any);
  
  // Fonction d'aide pour les traductions communes
  const tCommon = (key: string) => t(key as any);
  const location = useLocation();
  
  // Fonction pour faire défiler jusqu'à un élément avec un petit offset
  const scrollToElement = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerHeight = 80; // Hauteur approximative de la barre de navigation
      const offset = 20; // Petit espace supplémentaire après la barre de navigation
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - (headerHeight + offset);

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Gestion de la navigation selon le contexte
  const handleNavigation = useCallback((e: React.MouseEvent<HTMLAnchorElement>, sectionId?: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    
    if (sectionId) {
      if (location.pathname === '/') {
        // Si on est sur la page d'accueil, on fait défiler
        scrollToElement(sectionId);
      } else {
        // Si on n'est pas sur la page d'accueil, on y redirige avec le hash
        window.location.href = `/#${sectionId}`;
      }
    } else {
      // Si pas de sectionId, c'est un retour à l'accueil
      if (location.pathname !== '/') {
        window.location.href = '/';
      } else {
        // Si on est déjà sur la page d'accueil, on scroll en haut
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }
  }, [location.pathname]);

  return (
    <header ref={menuRef} className="fixed w-full top-0 z-50">
      {/* Bannière défilante */}
      <ScrollingBanner />
      
      {/* Barre de navigation principale */}
      <div className="bg-gradient-to-r from-yellow-100 via-rose-400 to-rose-400 hover:from-rose-300 hover:via-rose-300 hover:to-rose-300 transition-all duration-500 w-full shadow-lg" role="banner">
      <div className="container mx-auto px-2 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 pl-4">
            <a 
              href="/" 
              onClick={(e) => handleNavigation(e)}
              className="text-3xl font-bold text-pink-600 hover:text-rose-100 transition-colors text-xl font-semibold uppercase tracking-wider cursor-pointer"
            >
              EVOLAINE<span className="text-xs align-super">®</span>
            </a>
          </div>

          <nav className={`hidden md:flex items-center ${i18n.language === 'ar' ? 'gap-8' : 'space-x-8'}`}>
            <a 
              href="/"
              onClick={(e) => handleNavigation(e)}
              className="text-white hover:text-black transition-colors font-medium text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-rose-400 rounded-md px-2 py-1 cursor-pointer"
              aria-label={tNav('navigation.home')}
              aria-current={location.pathname === '/' ? 'page' : undefined}
            >
              {tNav('navigation.home')}
            </a>
            <Link 
              to="/#produits"
              className="text-white hover:text-black transition-colors font-medium text-sm uppercase tracking-wider"
              onClick={(e) => handleNavigation(e, 'produits')}
              aria-label={tNav('navigation.products')}
            >
              {tNav('navigation.products')}
            </Link>
            <Link 
              to="/#a-propos"
              className="text-white hover:text-black transition-colors font-medium text-sm uppercase tracking-wider"
              onClick={(e) => handleNavigation(e, 'a-propos')}
              aria-label={tNav('navigation.about')}
            >
              {tNav('navigation.about')}
            </Link>
            <Link 
              to="/#contact"
              className="text-white hover:text-black transition-colors font-medium text-sm uppercase tracking-wider"
              onClick={(e) => handleNavigation(e, 'contact')}
              aria-label={tNav('navigation.contact')}
            >
              {tNav('navigation.contact')}
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {/* Sélecteur de langue */}
            <div className="relative group">
              <button 
                className="p-2 text-white hover:text-black transition-colors flex items-center"
                onClick={() => {
                  const newLang = currentLanguage === 'fr' ? 'ar' : 'fr';
                  i18n.changeLanguage(newLang).then(() => {
                    // Sauvegarder la langue dans le localStorage
                    localStorage.setItem('i18nextLng', newLang);
                    // Mettre à jour les attributs du document
                    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
                    document.documentElement.lang = newLang;
                    // Forcer le rechargement de la page pour s'assurer que tous les composants sont mis à jour
                    window.location.reload();
                  });
                }}
                aria-label={currentLanguage === 'fr' ? 'Changer la langue' : 'Change language'}
              >
                <Globe className="h-5 w-5 mr-1" />
                <span className="text-sm font-medium">{currentLanguage === 'fr' ? 'عربي' : 'FR'}</span>
              </button>
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <button
                  onClick={() => {
                    i18n.changeLanguage('fr').then(() => {
                      localStorage.setItem('i18nextLng', 'fr');
                      document.documentElement.dir = 'ltr';
                      document.documentElement.lang = 'fr';
                      window.location.reload();
                    });
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm ${currentLanguage === 'fr' ? 'bg-pink-50 text-pink-700' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  Français
                </button>
                <button
                  onClick={() => {
                    i18n.changeLanguage('ar').then(() => {
                      localStorage.setItem('i18nextLng', 'ar');
                      document.documentElement.dir = 'rtl';
                      document.documentElement.lang = 'ar';
                      window.location.reload();
                    });
                  }}
                  className={`block w-full text-right px-4 py-2 text-sm ${currentLanguage === 'ar' ? 'bg-pink-50 text-pink-700' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  العربية
                </button>
              </div>
            </div>
            
            {/* Bouton panier */}
            <Link 
              to="/panier"
              onClick={(e) => {
                e.preventDefault();
                // Forcer un rechargement complet pour s'assurer que la navigation fonctionne
                window.location.href = '/panier';
              }}
              className="relative p-2 text-white hover:text-black transition-colors font-medium text-sm uppercase tracking-wider"
              aria-label={tNav('navigation.cart')}
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount || 0}
              </span>
            </Link>
            <button
              className="md:hidden p-2 text-white hover:text-black transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-rose-400 rounded-md"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? tCommon('common.close_menu') : tCommon('common.open_menu')}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              <span className="sr-only">{tNav('navigation.cart')}</span>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4">
            <nav className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => {
                  setIsMenuOpen(false);
                  window.scrollTo(0, 0);
                }}
                aria-label={tNav('navigation.home')}
              >
                {tNav('navigation.home')}
              </Link>
              <Link 
                to="/#produits"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                onClick={(e) => handleNavigation(e, 'produits')}
                aria-label={tNav('navigation.products')}
              >
                {tNav('navigation.products')}
              </Link>
              <Link 
                to="/#a-propos"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                onClick={(e) => handleNavigation(e, 'a-propos')}
                aria-label={tNav('navigation.about')}
              >
                {tNav('navigation.about')}
              </Link>
              <Link 
                to="/#contact"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                onClick={(e) => handleNavigation(e, 'contact')}
                aria-label={tNav('navigation.contact')}
              >
                {tNav('navigation.contact')}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </div>
    </header>
  );
};


export default Header;