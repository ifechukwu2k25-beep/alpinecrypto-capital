"use client";

import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n/config";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    const isRTL = i18n.language === "ar";
    html.setAttribute("dir", isRTL ? "rtl" : "ltr");
    html.setAttribute("lang", i18n.language);
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
