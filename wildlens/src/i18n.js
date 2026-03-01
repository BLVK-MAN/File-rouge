import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationFR from './locales/fr/translation.json';

// Les traductions
const resources = {
    en: {
        translation: translationEN
    },
    fr: {
        translation: translationFR
    }
};

i18n
    // Détecte la langue du navigateur
    .use(LanguageDetector)
    // Passe i18n à react-i18next
    .use(initReactI18next)
    // Initialise i18next
    .init({
        resources,
        fallbackLng: 'en', // Langue de secours si la langue détectée ou demandée n'est pas dispo
        debug: false,

        interpolation: {
            escapeValue: false, // React empêche déjà les failles XSS
        }
    });

export default i18n;
