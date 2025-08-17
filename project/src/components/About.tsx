import { Leaf, Award, Users, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation();
  
  return (
    <section id="a-propos" className="py-20 bg-gradient-to-b from-rose-50 to-pink-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                {t('about.title.line1')}
                <span className="text-pink-600 block">{t('about.title.line2')}</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                {t('about.description1')}
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                {t('about.description2')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-6 bg-white rounded-xl shadow-md">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Leaf className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">
                  {t('about.features.natural.title')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('about.features.natural.subtitle')}
                </p>
              </div>

              <div className="text-center p-6 bg-white rounded-xl shadow-md">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">
                  {t('about.features.certified.title')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('about.features.certified.subtitle')}
                </p>
              </div>

              <div className="text-center p-6 bg-white rounded-xl shadow-md">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">
                  {t('about.features.clients.title')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('about.features.clients.subtitle')}
                </p>
              </div>

              <div className="text-center p-6 bg-white rounded-xl shadow-md">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">
                  {t('about.features.local.title')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('about.features.local.subtitle')}
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-pink-200 to-rose-300 relative overflow-hidden shadow-2xl">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover"
                poster="https://images.unsplash.com/photo-1519730722595-a5ff788dea4d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
              >
                <source 
                  src="/videos/123.mp4" 
                  type="video/mp4" 
                />
                Votre navigateur ne supporte pas la lecture de vidéos.
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-pink-600/30 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;