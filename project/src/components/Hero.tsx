// @ts-nocheck - Disable type checking to prevent deep instantiation errors
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Configuration de la vidéo - Modifiez ces valeurs selon vos besoins
const videoConfig = {
  src: "/videos/Video Pack.mp4", // Chemin vers votre vidéo
  type: "video/mp4",             // Type de la vidéo
  autoPlay: true,                // Lecture automatique
  loop: true,                    // Lecture en boucle
  muted: true,                   // Son désactivé (requis pour la lecture auto)
  playsInline: true,             // Lecture en ligne sur mobile
  containerStyle: {
    maxWidth: '100%',            // Largeur maximale du conteneur
    height: 'auto',              // Hauteur automatique sur mobile
    minHeight: '60vh',           // Hauteur minimale sur mobile
    backgroundColor: 'rose-200', // Couleur de fond du conteneur
    borderRadius: '0',           // Pas de coins arrondis sur mobile
    overflow: 'hidden',          // Cache le débordement
    boxShadow: 'none',           // Pas d'ombre sur mobile
    margin: '0 -1rem',           // Pleine largeur sur mobile
    '@media (min-width: 768px)': {
      maxWidth: '6xl',
      height: '80vh',
      borderRadius: '0.5rem',
      boxShadow: 'xl',
      margin: '0 auto'
    }
  },
  videoStyle: {
    width: '100%',
    height: '100%',
    // @ts-ignore - La propriété objectFit est correcte pour les éléments vidéo
    objectFit: 'cover' as const, // 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
    objectPosition: 'center'
  }
};

const Hero = () => {
  // @ts-ignore - Skip type checking for i18n to prevent deep instantiation
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  return (
    <section id="accueil" className="min-h-screen flex items-center bg-gradient-to-br from-red-50 to-red-200 pt-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Vidéo - Premier sur mobile, deuxième sur desktop */}
          <div className="order-1 lg:order-2">
            <div 
              className="relative w-full max-w-full lg:max-w-${videoConfig.containerStyle.maxWidth} mx-auto h-[${videoConfig.containerStyle.height}] rounded-${videoConfig.containerStyle.borderRadius} bg-${videoConfig.containerStyle.backgroundColor}"
              style={{
                maxWidth: videoConfig.containerStyle.maxWidth,
                height: videoConfig.containerStyle.height,
                backgroundColor: videoConfig.containerStyle.backgroundColor,
                borderRadius: videoConfig.containerStyle.borderRadius,
                overflow: videoConfig.containerStyle.overflow,
                boxShadow: videoConfig.containerStyle.boxShadow ? '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' : 'none'
              }}
            >
              <div className="h-full w-full overflow-hidden">
                <video 
                  autoPlay={videoConfig.autoPlay}
                  loop={videoConfig.loop}
                  muted={videoConfig.muted}
                  playsInline={videoConfig.playsInline}
                  className="w-full h-full"
                  style={videoConfig.videoStyle}
                >
                  <source 
                    src={videoConfig.src}
                    type={videoConfig.type}
                  />
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
              </div>
            </div>
          </div>
          
          {/* Contenu - Deuxième sur mobile, premier sur desktop */}
          <div className="space-y-4 sm:space-y-8 px-4 sm:px-0 order-2 lg:order-1">
            <div className="space-y-2 sm:space-y-4">
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-pink-600">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide">{t('hero.tagline', 'Beauté Authentique Marocaine')}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight text-center sm:text-left">
                <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  EVOLAINE
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed text-center sm:text-left">
                {t('hero.description', "Découvrez notre collection exclusive de soins naturels formulés à base d'huile de graines de riz et d'extraits botaniques, enrichis en AHA et réglisse, complétée par un gel intime rafraîchissant au citron.")}
              </p>
            </div>

            <div className={`flex flex-col sm:flex-row space-y-4 sm:space-y-0 ${currentLanguage === 'ar' ? 'sm:space-x-reverse' : 'sm:space-x-4'} sm:space-x-8`}>
              <a 
                href="#produits"
                onClick={(e) => {
                  e.preventDefault();
                  if (window.location.pathname === '/') {
                    const element = document.getElementById('produits');
                    if (element) {
                      const headerHeight = 80;
                      const offset = 20;
                      const elementPosition = element.getBoundingClientRect().top;
                      const offsetPosition = elementPosition + window.pageYOffset - (headerHeight + offset);
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                      });
                    }
                  } else {
                    window.location.href = '/#produits';
                  }
                }}
                className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-center"
              >
                {t('hero.cta_products', 'Découvrir nos produits')}
              </a>
              <a 
                href="#a-propos"
                onClick={(e) => {
                  e.preventDefault();
                  if (window.location.pathname === '/') {
                    const element = document.getElementById('a-propos');
                    if (element) {
                      const headerHeight = 80;
                      const offset = 20;
                      const elementPosition = element.getBoundingClientRect().top;
                      const offsetPosition = elementPosition + window.pageYOffset - (headerHeight + offset);
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                      });
                    }
                  } else {
                    window.location.href = '/#a-propos';
                  }
                }}
                className="border-2 border-pink-600 text-pink-600 px-8 py-4 rounded-full font-semibold hover:bg-pink-600 hover:text-white transition-all duration-300 text-center"
              >
                {currentLanguage === 'ar' ? 'قصتنا' : 'Notre histoire'}
              </a>
            </div>
            
            {/* Espacement supplémentaire sous les boutons */}
            <div className="h-8 lg:h-16"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;