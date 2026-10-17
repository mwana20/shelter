import 'i18next';
import { resources } from './resources';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'navigation';
    resources: typeof resources.en;
  }
}
