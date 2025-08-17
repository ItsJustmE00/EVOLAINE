// @ts-nocheck - Disable type checking to prevent deep instantiation errors
import { Quote, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Testimonials = () => {
  // @ts-ignore - Skip type checking for i18n to prevent deep instantiation
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const testimonials = [
    {
      id: 1,
      name: isRTL ? "أمينة الفاسي" : "Amina El Fassi",
      city: isRTL ? "الدار البيضاء" : "Casablanca",
      rating: 5,
      comment: isRTL 
        ? "منتجات إيفولين غيرت روتيني اليومي للنظافة الحميمة. نعومة لا تضاهى!"
        : "Les produits EvoLaine ont révolutionné ma routine d'hygiène intime. Une douceur incomparable !",
      avatar: "/pexels-olly-3769021.png"
    },
    {
      id: 2,
      name: isRTL ? "ليلى بنجلون" : "Leila Benjelloun",
      city: isRTL ? "الرباط" : "Rabat",
      rating: 5,
      comment: isRTL
        ? "جل الليمون للعناية الحميمة رائع. انتعاش فوري ودائم، لم أعد أستطيع الاستغناء عنه!"
        : "Le gel intime au citron est une pure merveille. Fraîcheur immédiate et durable, je ne peux plus m'en passer !",
      avatar: "/pexels-abdelilah-hibat-allah-1652683667-33393744.png"
    },
    {
      id: 3,
      name: isRTL ? "نادية العامري" : "Nadia El Amrani",
      city: isRTL ? "مراكش" : "Marrakech",
      rating: 5,
      comment: isRTL
        ? "المرطب استثنائي. بشرتي ناعمة ومحمية طوال اليوم."
        : "La crème hydratante est exceptionnelle. Ma peau est douce et protégée toute la journée.",
      avatar: "/pexels-jocelyn-espinoza-241208092-33369430.png"
    }
  ];

  return (
    <section className="py-20 bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {isRTL ? 'آراء' : "L'avis de nos"}
            <span className="text-pink-600"> {isRTL ? 'زبوناتنا' : 'clientes'}</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {isRTL 
              ? 'اكتشفوا رأي النساء اللواتي اخترن منتجات إيفولين'
              : "Découvrez ce que pensent les femmes qui ont adopté EvoLaine"}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Quote className="h-8 w-8 text-pink-400" />
                <div className="flex items-center space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>

              <p className={`text-gray-700 text-lg leading-relaxed mb-6 italic ${isRTL ? 'text-right' : 'text-left'}`}>
                "{testimonial.comment}"
              </p>

              <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-0 space-x-reverse' : 'space-x-4'}`}>
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-pink-200"
                />
                <div className={isRTL ? 'mr-3' : 'ml-3'}>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;