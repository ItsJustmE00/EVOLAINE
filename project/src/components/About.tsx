import React from 'react';
import { useTranslation } from 'react-i18next';
import { Leaf, Award, Users, MapPin } from 'lucide-react';

const About: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="py-10 md:py-20 bg-gradient-to-b from-rose-50 to-pink-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Colonne de gauche - Contenu principal */}
          <div className="lg:w-1/2 flex flex-col items-center lg:items-start">
            <div className="text-center lg:text-left mb-12 max-w-md lg:max-w-2xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-pink-900">
                <span className="block">{t('about.title.line1')}</span>
                <span className="block text-pink-600">{t('about.title.line2')}</span>
              </h1>
              <div className="w-24 h-1 bg-pink-300 mx-auto lg:mx-0 my-6"></div>
              <div className="text-gray-600">
                <p className="text-lg mb-6">{t('about.description1')}</p>
                <p className="text-lg">{t('about.description2')}</p>
              </div>
            </div>

            {/* Grille des fonctionnalités */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 w-full">
                <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto lg:mx-0">
                  <Leaf className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold text-pink-900 mb-3">{t('about.features.natural.title')}</h3>
                <p className="text-gray-600">{t('about.features.natural.subtitle')}</p>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 w-full">
                <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto lg:mx-0">
                  <Award className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold text-pink-900 mb-3">{t('about.features.certified.title')}</h3>
                <p className="text-gray-600">{t('about.features.certified.subtitle')}</p>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 w-full">
                <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto lg:mx-0">
                  <Users className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold text-pink-900 mb-3">{t('about.features.clients.title')}</h3>
                <p className="text-gray-600">{t('about.features.clients.subtitle')}</p>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 w-full">
                <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto lg:mx-0">
                  <MapPin className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold text-pink-900 mb-3">{t('about.features.local.title')}</h3>
                <p className="text-gray-600">{t('about.features.local.subtitle')}</p>
              </div>
            </div>
          </div>
          
          {/* Colonne de droite - Vidéo */}
          <div className="hidden lg:block lg:w-1/2">
            <div className="sticky top-8 rounded-xl overflow-hidden shadow-xl">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-auto rounded-xl"
              >
                <source src="/videos/123.mp4" type="video/mp4" />
                Votre navigateur ne supporte pas la lecture de vidéos.
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;