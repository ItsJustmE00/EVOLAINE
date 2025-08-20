import 'i18next';
import { fr } from './translations';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof fr;
    };
  }
}

declare module 'react-i18next' {
  interface TFunction {
    (key: string, options?: any): string;
  }
}
