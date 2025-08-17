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
    maxWidth: '6xl',             // Largeur maximale du conteneur
    height: '80vh',              // Hauteur du conteneur
    backgroundColor: 'white',     // Couleur de fond du conteneur
    borderRadius: '0.5rem',      // Coins arrondis
    overflow: 'hidden',          // Cache le débordement
    boxShadow: 'xl'              // Ombre portée
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
    <section id="accueil" className="min-h-screen flex items-center bg-gradient-to-br from-red-50 to-red-200 pt-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-pink-600">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">{t('hero.tagline', 'Beauté Authentique Marocaine')}</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  EVOLAINE
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                {t('hero.description', "Découvrez notre collection exclusive de soins naturels formulés à base d'huile de graines de riz et d'extraits botaniques, enrichis en AHA et réglisse, complétée par un gel intime rafraîchissant au citron.\n\nDes soins conçus pour purifier, apaiser et illuminer, offrant à votre intimité une expérience de fraîcheur et de douceur incomparables.")}
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
          </div>

          <div 
            className={`relative w-full max-w-${videoConfig.containerStyle.maxWidth} mx-auto h-[${videoConfig.containerStyle.height}] rounded-${videoConfig.containerStyle.borderRadius} bg-${videoConfig.containerStyle.backgroundColor}`}
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
      </div>
    </section>
  );
};

export default Hero;