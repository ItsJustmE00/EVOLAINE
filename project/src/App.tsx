
import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Products from './components/Products';
import About from './components/About';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Cart from './components/Cart';
import ProductDetails from './components/ProductDetails';
import Footer from './components/Footer';
import { ProductSelectionProvider } from './contexts/ProductSelectionContext';
import { CartProvider } from './contexts/CartContext';
import { LanguageProvider } from './contexts/LanguageContext';
import ScrollToTop from './components/ScrollToTop';
import './i18n/i18n'; // Import de la configuration i18n

// Composant pour gérer le défilement vers les sections
const ScrollToSection = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Si on a un hash dans l'URL et qu'on est sur la page d'accueil
    if (hash && pathname === '/') {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        // Petit délai pour s'assurer que le composant est rendu
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [pathname, hash]);

  return null;
};

function App() {
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
          <div className="min-h-screen flex flex-col">
            <ScrollToTop />
            <Header />
            <main className="flex-grow pt-24">
              <ScrollToSection />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/panier" element={<Cart />} />
                <Route path="/produit/:id" element={<ProductDetails />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </ProductSelectionProvider>
    </LanguageProvider>
  );
}

export default App;