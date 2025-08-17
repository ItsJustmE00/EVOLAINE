// @ts-nocheck - Disable type checking to prevent deep instantiation errors
import React from 'react';
import { Heart, Phone, MapPin } from 'lucide-react';
import { useProductSelection } from '../contexts/ProductSelectionContext';
import { useTranslation } from 'react-i18next';

// IDs des produits (doivent correspondre à ceux dans Products.tsx)
const PRODUCT_IDS = {
  PACK_COMPLET: 1,
  CREME_HYDRATANTE: 2,
  GEL_INTIME: 3,
  SERUM_ECLAT: 4
};

const Footer = () => {
  // @ts-ignore - Skip type checking for i18n to prevent deep instantiation
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { selectProduct } = useProductSelection();
  
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

  const handleProductClick = (productId: number) => {
    // Stocker le produit à sélectionner dans le sessionStorage
    sessionStorage.setItem('selectedProduct', productId.toString());
    
    // Si nous sommes sur la page d'accueil
    if (window.location.pathname === '/') {
      // Faire défiler jusqu'à la section produits
      scrollToElement('produits');
      
      // Sélectionner le produit après un court délai pour laisser le temps au défilement
      setTimeout(() => {
        selectProduct(productId);
      }, 500);
    } else {
      // Si nous ne sommes pas sur la page d'accueil, naviguer vers la page d'accueil avec l'ancre produits
      window.location.href = `/#produits`;
    }
  };
  return (
    <footer className="bg-gradient-to-br from-rose-50 via-rose-100 to-rose-200 hover:from-rose-300 hover:via-rose-300 hover:to-rose-300 transition-all duration-500 text-red-900 py-12" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-red-900 fill-current" />
              <span className="text-2xl font-bold">{isRTL ? 'إيفولين' : 'EVOLAINE'}</span>
            </div>
            <p className="text-black leading-relaxed">
              {isRTL 
                ? 'شريكك اليومي في العناية بالجمال، من أجل نظافة حميمة منعشة ورعاية طبيعية تعتني بك.'
                : 'Votre partenaire beauté au quotidien, pour une hygiène intime rafraîchissante et des soins naturels qui prennent soin de vous.'
              }
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold">{isRTL ? 'تصفح' : 'Navigation'}</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/" 
                  className="text-black hover:text-red-900 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    if (window.location.pathname === '/') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      window.location.href = '/';
                    }
                  }}
                >
                  {isRTL ? 'الرئيسية' : 'Accueil'}
                </a>
              </li>
              <li>
                <a 
                  href="#produits"
                  className="text-black hover:text-red-900 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    if (window.location.pathname === '/') {
                      scrollToElement('produits');
                    } else {
                      window.location.href = '/#produits';
                    }
                  }}
                >
                  {isRTL ? 'منتجاتنا' : 'Nos Produits'}
                </a>
              </li>
              <li>
                <a 
                  href="#a-propos"
                  className="text-black hover:text-red-900 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    if (window.location.pathname === '/') {
                      scrollToElement('a-propos');
                    } else {
                      window.location.href = '/#a-propos';
                    }
                  }}
                >
                  {isRTL ? 'قصتنا' : 'Notre Histoire'}
                </a>
              </li>
              <li>
                <a 
                  href="#contact"
                  className="text-black hover:text-red-900 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    if (window.location.pathname === '/') {
                      scrollToElement('contact');
                    } else {
                      window.location.href = '/#contact';
                    }
                  }}
                >
                  {isRTL ? 'اتصل بنا' : 'Contactez-nous'}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold">{isRTL ? 'منتجاتنا' : 'Nos Produits'}</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#"
                  className="text-black hover:text-red-900 transition-colors cursor-pointer"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    handleProductClick(PRODUCT_IDS.PACK_COMPLET);
                  }}
                >
                  {isRTL ? 'الباقة الكاملة' : 'Pack Complet'}
                </a>
              </li>
              <li>
                <a 
                  href="#"
                  className="text-black hover:text-red-900 transition-colors cursor-pointer"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    handleProductClick(PRODUCT_IDS.CREME_HYDRATANTE);
                  }}
                >
                  {isRTL ? 'كريم تفتيح' : 'Crème Eclaircissante'}
                </a>
              </li>
              <li>
                <a 
                  href="#"
                  className="text-black hover:text-red-900 transition-colors cursor-pointer"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    handleProductClick(PRODUCT_IDS.GEL_INTIME);
                  }}
                >
                  {isRTL ? 'جل حميم' : 'Gel Intime'}
                </a>
              </li>
              <li>
                <a 
                  href="#"
                  className="text-black hover:text-red-900 transition-colors cursor-pointer"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    handleProductClick(PRODUCT_IDS.SERUM_ECLAT);
                  }}
                >
                  {isRTL ? 'سيروم الإشراق' : 'Sérum Éclat'}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold">{isRTL ? 'اتصل بنا' : 'Contact'}</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-red-900 mt-0.5 flex-shrink-0" />   
                <div>
                  <p className="text-black" dir="ltr" style={{ unicodeBidi: 'bidi-override' }}>06 59 55 37 41</p>
                  <p className="text-sm text-black">
                    {isRTL 
                      ? 'متوفر طوال الأسبوع من الساعة 9 صباحاً حتى 8 مساءً'
                      : 'Disponible 7j/7 de 9h à 20h'
                    }
                  </p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-red-900 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-black">
                    {isRTL ? 'زاوية شارع الحسن الثاني، أكادير' : 'Avenue Hassan II, Agadir'}
                  </p>
                  <p className="text-sm text-black">{isRTL ? 'المغرب' : 'Maroc'}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-black pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center pt-8 border-t border-rose-200">
              <p className="text-black">
                {isRTL 
                  ? `© ${new Date().getFullYear()} إيفولين. جميع الحقوق محفوظة.`
                  : `© ${new Date().getFullYear()} EVOLAINE. Tous droits réservés.`
                }
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-black hover:text-red-900 text-sm">Mentions Légales</a>
              <a href="#" className="text-black hover:text-red-900 text-sm">Politique de Confidentialité</a>
              <a href="#" className="text-black hover:text-red-900 text-sm">CGV</a>
            </div>
          </div>
          <p className="text-center mt-4 text-black text-sm">
            Fabriqué avec <Heart className="inline h-4 w-4 text-red-900 fill-current" /> au Maroc
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;