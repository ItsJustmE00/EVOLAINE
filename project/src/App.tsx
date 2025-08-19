
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Products from './components/Products';
import About from './components/About';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import CartPage from './components/CartPage';
import ProductDetails from './components/ProductDetails';
import Footer from './components/Footer';
import { ProductSelectionProvider } from './contexts/ProductSelectionContext';
import { CartProvider } from './contexts/CartContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { NotificationProvider } from './components/ui/Notification';
import ScrollToTop from './components/ScrollToTop';
import ScrollingBanner from './components/ScrollingBanner';
import './i18n/i18n'; // Import de la configuration i18n

// Composant pour gérer le défilement vers les sections (déplacé dans ScrollToTop)
const ScrollToSection = () => {
  // Ce composant est maintenant obsolète car la logique a été déplacée dans ScrollToTop
  // Il est conservé pour la rétrocompatibilité
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
      <CartProvider>
        <ProductSelectionProvider>
          <NotificationProvider>
            <div className="min-h-screen flex flex-col">
              <ScrollingBanner />
              <Header />
              <ScrollToTop />
              <ScrollToSection />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/panier" element={<Navigate to="/cart" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </NotificationProvider>
        </ProductSelectionProvider>
      </CartProvider>
    </LanguageProvider>
  );
}

export default App;