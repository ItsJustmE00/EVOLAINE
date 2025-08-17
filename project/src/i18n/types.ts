export interface TranslationObject {
  [key: string]: string | TranslationObject;
}

export interface ProductItem {
  name: string;
  description: string;
  detailedDescription?: string;
  benefits?: string[];
  howToUse?: string;
  ingredients?: string;
  length?: string;
}

export interface ProductsTranslations {
  title: string;
  signature: string;
  subtitle: string;
  addToCart: string;
  addToCartButton: string;
  viewDetails: string;
  viewDetailsButton: string;
  inCart: string;
  inStock: string;
  available: string;
  outOfStock: string;
  quantity: string;
  price: string;
  total: string;
  remove: string;
  continueShopping: string;
  proceedToCheckout: string;
  yourCart: string;
  cartEmpty: string;
  cartSubtotal: string;
  shipping: string;
  tax: string;
  orderTotal: string;
  freeShipping: string;
  estimatedDelivery: string;
  secureCheckout: string;
  moneyBack: string;
  customerSupport: string;
  decrease: string;
  increase: string;
  items: Record<number, ProductItem>;
}

export interface ProductDetailTranslations {
  back: string;
  inStock: string;
  description: string;
  howToUse: string;
  ingredients: string;
  addToCart: string;
  quantity: string;
  price: string;
  rating: string;
  reviews: string;
  share: string;
  benefits?: string;
  addToWishlist?: string;
  adding?: string;
  added?: string;
  close?: string;
  outOfStock?: string;
  relatedProducts?: string;
  error?: string;
  productDetails?: string;
  benefitsTitle?: string;
  howToUseTitle?: string;
  ingredientsTitle?: string;
  saveForLater?: string;
  capacity?: string;
}

export interface CommonTranslations {
  open_menu: string;
  close_menu: string;
  currency: string;
}

export interface NavigationTranslations {
  home: string;
  products: string;
  about: string;
  testimonials: string;
  contact: string;
  cart: string;
  menu: string;
}

export interface BannerTranslations {
  share_experience: string;
  take_care: string;
  delivery: string;
}

export interface HeroTranslations {
  title: string;
  subtitle: string;
  description: string;
  cta_products: string;
  cta_contact: string;
}

export interface TestimonialItem {
  name: string;
  city: string;
  comment: string;
}

export interface TestimonialsTranslations {
  title: string;
  subtitle: string;
  items: TestimonialItem[];
}

export interface Translations {
  hero: HeroTranslations;
  welcome: string;
  banner: BannerTranslations;
  brand: {
    name: string;
  };
  header: {
    banner1: string;
    banner2: string;
    banner3: string;
  };
  common: CommonTranslations;
  navigation: NavigationTranslations;
  productDetail: ProductDetailTranslations;
  products: ProductsTranslations;
  testimonials: TestimonialsTranslations;
  about: any; // À typer plus précisément si nécessaire
  contact: any; // À typer plus précisément si nécessaire
  cart: any; // À typer plus précisément si nécessaire
  footer: any; // À typer plus précisément si nécessaire
}
