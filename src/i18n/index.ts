import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import translations from './translations.json';

const resources = {
    fr: {
        translation: translations.fr,
    },
    en: {
        translation: translations.en,
    },
    ar: {
        translation: translations.ar,
    },
    sw: {
        translation: translations.sw,
    },
};

// Détecter la langue de l'appareil
const deviceLocale = Localization.getLocales?.()?.[0]?.languageCode ?? 'fr';
const supportedLocales = ['fr', 'en', 'ar', 'sw'];
const defaultLanguage = supportedLocales.includes(deviceLocale) ? deviceLocale : 'fr';

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: defaultLanguage,
        fallbackLng: 'fr',
        interpolation: {
            escapeValue: false, // React s'occupe déjà de l'échappement
        },
        compatibilityJSON: 'v4',
    });

export default i18n;
export { supportedLocales };
