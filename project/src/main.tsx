import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { CartProvider } from './contexts/CartContext';
import i18n from './i18n/i18n';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<div>Chargement...</div>}>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          <CartProvider>
            <App />
          </CartProvider>
        </BrowserRouter>
      </I18nextProvider>
    </Suspense>
  </StrictMode>
);
