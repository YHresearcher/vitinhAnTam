// Barrel — giu nguyen ten export cu de moi import '@/lib/translations' khong doi.
import { VI_TRANSLATIONS } from './vi';
import { EN_TRANSLATIONS } from './en';

export type SupportedLang = 'vi' | 'en';

export const TRANSLATIONS = {
  vi: VI_TRANSLATIONS,
  en: EN_TRANSLATIONS,
};

export { ENGLISH_PRODUCT_DETAILS, ENGLISH_FAQS, ENGLISH_REVIEWS } from './english-content';
