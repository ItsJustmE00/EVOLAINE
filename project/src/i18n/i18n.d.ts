import 'i18next';
import type { 
  Translations, 
  NavigationTranslations, 
  CommonTranslations 
} from './types';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: {
        navigation: NavigationTranslations;
        common: CommonTranslations;
      } & Omit<Translations, 'navigation' | 'common'>;
    };
  }
}
