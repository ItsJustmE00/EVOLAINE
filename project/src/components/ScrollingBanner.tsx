// @ts-nocheck - Disable type checking to prevent deep instantiation errors
import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';

const ScrollingBanner = () => {
  // @ts-ignore - Skip type checking for i18n to prevent deep instantiation
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const containerRef = useRef<HTMLDivElement>(null);

  // Messages avec traductions
  const messages = isRTL ? [
    // Messages en arabe avec emojis féminins
    { id: 1, text: 'توصيل سريع داخل أكادير', icon: '🚚' },
    { id: 2, text: 'الدفع الآمن عند الاستلام', icon: '💳' },
    { id: 3, text: 'خدمة العملاء متاحة 24/7', icon: '💁‍♀️' },
    { id: 4, text: 'منتجات طبيعية 100% للعناية بالبشرة', icon: '🌸' },
    { id: 5, text: 'جلسات عناية بالبشرة مخصصة', icon: '💆‍♀️' },
    { id: 6, text: 'جمالكِ الطبيعي هويتنا', icon: '✨' },
    { id: 7, text: 'نصائح تجميلية من خبرائنا', icon: '💅' },
    { id: 8, text: 'عروض حصرية للعملاء', icon: '🎁' },
    { id: 9, text: 'هدايا مع كل طلب فوق 500 درهم', icon: '🎀' },
    { id: 10, text: 'منتجات خالية من المواد الكيميائية', icon: '🌿' },
    { id: 11, text: 'عناية شاملة بجمالكِ', icon: '💝' },
  ] : [
    // Messages en français avec emojis féminins
    { id: 2, text: 'Paiement sécurisé à la livraison', icon: '💳' },
    { id: 3, text: 'Service client 7j/7', icon: '💁‍♀️' },
    { id: 4, text: 'Produits 100% naturels', icon: '🌸' },
    { id: 5, text: 'Soins de la peau sur mesure', icon: '💆‍♀️' },
    { id: 6, text: 'Parfums exclusifs', icon: '💄' },
    { id: 7, text: 'Beauté naturelle', icon: '✨' },
    { id: 8, text: 'Conseils beauté personnalisés', icon: '💅' },
    { id: 9, text: 'Offres spéciales', icon: '🎁' },
    { id: 10, text: 'Cadeaux offerts dès 500 Dhs', icon: '🎀' },
  ];

  // Créer un grand nombre de répétitions pour un défilement fluide
  const repeatCount = 10; // Nombre élevé pour assurer la continuité
  const allMessages = Array(repeatCount).fill(messages).flat();

  // Styles CSS en ligne pour l'animation
  const styles = `
    @keyframes scroll {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(${isRTL ? '50%' : '-50%'});
      }
    }
    
    .scrolling-banner {
      overflow: hidden;
      white-space: nowrap;
      position: relative;
      width: 100%;
    }
    
    .scrolling-content {
      display: inline-block;
      white-space: nowrap;
      animation: scroll ${messages.length * 20}s linear infinite;
      will-change: transform;
    }
    
    .scrolling-content:hover {
      animation-play-state: running;
    }
    
    .scrolling-item {
      display: inline-flex;
      align-items: center;
      padding: 0 2rem;
    }
    
    @media (max-width: 640px) {
      .scrolling-content {
        animation-duration: ${messages.length * 15}s;
      }
      
      .scrolling-item {
        padding: 0 1.25rem;
      }
    }
  `;

  return (
    <div 
      ref={containerRef} 
      className="bg-gradient-to-r from-[#1B0638] to-[#120421] text-white text-xs sm:text-sm font-medium py-1"
      style={{ direction: isRTL ? 'rtl' : 'ltr' }}
    >
      <style>{styles}</style>
      <div className="scrolling-banner">
        <div className="scrolling-content">
          {allMessages.map((message, index) => (
            <span key={`${message.id}-${index}`} className="scrolling-item">
              <span className="mr-1 sm:mr-2 text-sm">{message.icon}</span>
              {message.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScrollingBanner;
