import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Ne pas faire défiler si on est sur la page d'accueil avec une ancre
    if (pathname === '/' && window.location.hash) {
      return;
    }
    
    // Faire défiler vers le haut de la page à chaque changement de route
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
