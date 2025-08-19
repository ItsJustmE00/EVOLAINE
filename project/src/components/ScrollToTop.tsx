import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Ne pas faire défiler si on est sur la page d'accueil avec une ancre
    if (pathname === '/' && hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        // Petit délai pour s'assurer que le composant est rendu
        setTimeout(() => {
          const headerOffset = 120; // Hauteur du header + marge
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }, 100);
      }
      return;
    }
    
    // Faire défiler vers le haut de la page à chaque changement de route
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
