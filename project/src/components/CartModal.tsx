import { useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import Cart from './Cart';

// Définition du type pour l'événement de la souris
type MouseEvent = React.MouseEvent<HTMLDivElement>;

const CartModal = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Empêcher le défilement du corps lorsque la modal est ouverte
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    // Ajouter une classe au body pour indiquer que la modal est ouverte
    document.body.classList.add('modal-open');
    
    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open');
    };
  }, []);

  // Fermer la modal lors d'un clic sur le fond ou sur le bouton de fermeture
  const closeModal = useCallback(() => {
    // Si on est arrivé ici en cliquant sur le panier depuis la même page,
    // on retourne à la page précédente
    if (location.state?.from === location.pathname) {
      navigate(-1);
    } else {
      // Sinon on va à la racine
      navigate('/');
    }
  }, [location.state?.from, location.pathname, navigate]);
  
  // Écouter l'événement de fermeture du panier
  useEffect(() => {
    const handleCloseCartModal = () => {
      closeModal();
    };
    
    window.addEventListener('closeCartModal', handleCloseCartModal);
    
    return () => {
      window.removeEventListener('closeCartModal', handleCloseCartModal);
    };
  }, [closeModal]);

  const handleBackdropClick = useCallback((e: MouseEvent) => {
    try {
      if (e.target === e.currentTarget) {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      }
    } catch (error) {
      console.error('Erreur lors de la fermeture de la modale:', error);
    }
  }, [closeModal]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
          onClick={closeModal}
          aria-label="Fermer le panier"
        >
          <X size={24} />
        </button>
        <div className="p-6">
          <Cart />
        </div>
      </div>
    </div>
  );
};

export default CartModal;
