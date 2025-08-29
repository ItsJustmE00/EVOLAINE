import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Products from './components/Products';
import About from './components/About';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import CartPage from './components/CartPage';
import ProductDetails from './components/ProductDetails';
import ConfirmationPage from './pages/ConfirmationPage';
import Footer from './components/Footer';
import { ProductSelectionProvider } from './contexts/ProductSelectionContext';
import { CartProvider } from './contexts/CartContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { NotificationProvider } from './components/ui/Notification';
import ScrollToTop from './components/ScrollToTop';
import ScrollingBanner from './components/ScrollingBanner';
import FacebookPixel from './components/FacebookPixel';
import { verifyPixelManually } from './utils/verifyPixel';
import './i18n/i18n'; // Import de la configuration i18n

// Composant pour gérer le défilement vers les sections (déplacé dans ScrollToTop)
const ScrollToSection = () => {
  // Ce composant est maintenant obsolète car la logique a été déplacée dans ScrollToTop
  // Il est conservé pour la rétrocompatibilité
  return null;
};

function App() {
  const location = useLocation();
  
  // Vérification manuelle du Pixel Meta en développement
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (import.meta.env.DEV) {
      // Vérification après 3 secondes pour laisser le temps au pixel de s'initialiser
      timer = setTimeout(() => {
        console.log('=== VÉRIFICATION DU PIXEL META ===');
        console.log('Chemin actuel:', location.pathname);
        verifyPixelManually();
      }, 3000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [location.pathname]);
  
  const Home = () => (
    <>
      <Hero />
      <Products />
      <About />
      <Testimonials />
      <Contact />
    </>
  );

  return (
    <LanguageProvider>
      <ProductSelectionProvider>
        <CartProvider>
          <NotificationProvider>
            <FacebookPixel />
            <div className="min-h-screen flex flex-col">
              <Header />
              <ScrollingBanner />
              <ScrollToTop />
              <ScrollToSection />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/confirmation" element={<ConfirmationPage />} />
                  <Route path="/panier" element={<Navigate to="/cart" replace />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </NotificationProvider>
        </CartProvider>
      </ProductSelectionProvider>
    </LanguageProvider>
  );
}

export default App;