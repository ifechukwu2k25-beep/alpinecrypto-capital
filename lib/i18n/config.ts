import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "@/locales/en/common.json";
import de from "@/locales/de/common.json";
import ar from "@/locales/ar/common.json";
import pl from "@/locales/pl/common.json";
import bg from "@/locales/bg/common.json";
import lt from "@/locales/lt/common.json";
import sk from "@/locales/sk/common.json";
import es from "@/locales/es/common.json";

const resources = {
  en: { translation: en },
  de: { translation: de },
  ar: { translation: ar },
  pl: { translation: pl },
  bg: { translation: bg },
  lt: { translation: lt },
  sk: { translation: sk },
  es: { translation: es },
};

export const supportedLocales = ["en", "de", "ar", "pl", "bg", "lt", "sk", "es"] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

export const rtlLocales: SupportedLocale[] = ["ar"];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: supportedLocales,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
