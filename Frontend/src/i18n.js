// src/i18n.js
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

i18next
  .use(HttpBackend) // Load translations via HTTP
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Bind i18next to React
  .init({
    fallbackLng: "en", // Default language if detection fails
    debug: true, // Set to false in production
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json", // Path to translation files
    },
  });

export default i18next;