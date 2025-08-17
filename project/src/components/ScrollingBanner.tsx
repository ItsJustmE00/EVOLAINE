// @ts-nocheck - Disable type checking to prevent deep instantiation errors
import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';

const ScrollingBanner = () => {
  // @ts-ignore - Skip type checking for i18n to prevent deep instantiation
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const bannerRef = useRef<HTMLDivElement>(null);

  // Messages avec traductions
  const messages = isRTL ? [
    // Messages en arabe avec emojis féminins
    { id: 1, text: 'توصيل مجاني داخل أكادير', icon: '🚚' },
    { id: 2, text: 'الدفع الآمن عند الاستلام', icon: '💳' },
    { id: 3, text: 'خدمة العملاء متاحة 24/7', icon: '💁‍♀️' },
    { id: 4, text: 'منتجات طبيعية 100% للعناية بالبشرة', icon: '🌸' },
    { id: 5, text: 'جلسات عناية بالبشرة مخصصة', icon: '💆‍♀️' },
    { id: 7, text: 'جمالكِ الطبيعي هويتنا', icon: '✨' },
    { id: 8, text: 'نصائح تجميلية من خبرائنا', icon: '💅' },
    { id: 9, text: 'عروض حصرية للعملاء', icon: '🎁' },
    { id: 10, text: 'هدايا مع كل طلب فوق 500 درهم', icon: '🎀' },
    { id: 11, text: 'منتجات خالية من المواد الكيميائية', icon: '🌿' },
    { id: 12, text: 'عناية شاملة بجمالكِ', icon: '💝' },
  ] : [
    // Messages en français avec emojis féminins
    { id: 1, text: 'Livraison gratuite à Agadir', icon: '🚚' },
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

  // Dupliquer les messages pour créer une boucle fluide
  const allMessages = [...messages, ...messages, ...messages, ...messages];

  useEffect(() => {
    const banner = bannerRef.current;
    if (!banner) return;

    const content = banner.querySelector('.scrolling-content') as HTMLElement;
    if (!content) return;

    let position = 0;
    const speed = 1;
    let animationId: number;

    const animate = () => {
      position -= speed;
      
      // Réinitialiser la position quand on arrive à la fin
      if (position <= -content.scrollWidth / 2) {
        position = 0;
      }
      
      content.style.transform = `translateX(${position}px)`;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [i18n.language]);

  return (
    <div 
      ref={bannerRef}
      className="bg-gradient-to-r from-pink-500 to-rose-200 to-purple-200 py-2 overflow-hidden w-full"
    >
      <div className="relative h-8 w-full">
        <div 
          className="scrolling-content flex items-center absolute top-0 left-0"
          style={{ 
            direction: isRTL ? 'rtl' : 'ltr',
            whiteSpace: 'nowrap',
            willChange: 'transform',
          }}
        >
          {allMessages.map((item, index) => (
            <div 
              key={`${item.id}-${index}`} 
              className="inline-flex items-center px-6"
            >
              <span className="mx-2">{item.icon}</span>
              <span className="text-sm font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScrollingBanner;
