import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en";
import es from "./locales/es";
import hi from "./locales/hi";

/**
 * react-i18next setup. Resources are bundled (tiny) so there is no loading
 * flash; the active language comes from Redux preferences (see Providers).
 */
if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: { en: { translation: en }, hi: { translation: hi }, es: { translation: es } },
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false }, // React already escapes
    returnNull: false,
  });
}

export default i18n;
