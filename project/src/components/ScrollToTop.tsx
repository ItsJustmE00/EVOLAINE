import React, { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

type LocationState = {
  scrollTo?: string;
};

const ScrollToTop: React.FC = (): null => {
  const { pathname, hash, state } = useLocation();
  const navigationType = useNavigationType();
  const locationState = state as LocationState | null;

  useEffect(() => {
    // Si on a une section à laquelle faire défiler (depuis n'importe quelle page)
    const scrollToSection = (sectionId: string) => {
      const element = document.getElementById(sectionId.replace('#', ''));
      if (element) {
        // Petit délai pour s'assurer que le composant est rendu
        setTimeout(() => {
          const headerEl = document.querySelector('header');
          const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 90;
          const mobileExtra = window.innerWidth <= 768 ? -20 : 0;
          const offset = window.innerWidth <= 768 ? -240 : 0;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - (headerHeight + offset + mobileExtra);
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }, 100);
      }
    };

    // Si on a une section dans l'URL (hash) ou dans l'état de navigation
    const targetSection = hash || locationState?.scrollTo;
    
    if (targetSection) {
      // Si on est déjà sur la page d'accueil, on fait défiler directement
      if (pathname === '/') {
        scrollToSection(targetSection);
      }
      // Sinon, la navigation sera gérée par le composant Header
      return;
    }
    
    // Pour les autres cas, on fait défiler vers le haut de la page
    // Sauf si c'est un retour arrière (pour préserver la position de défilement)
    if (navigationType !== 'POP') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [pathname, hash, locationState, navigationType]);

  return null;
};

export default ScrollToTop;
