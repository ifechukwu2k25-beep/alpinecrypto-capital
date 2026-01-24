"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/config";

export function useI18n() {
  const { i18n, t } = useTranslation();

  useEffect(() => {
    const html = document.documentElement;
    const isRTL = i18n.language === "ar";
    html.setAttribute("dir", isRTL ? "rtl" : "ltr");
    html.setAttribute("lang", i18n.language);
  }, [i18n.language]);

  return { i18n, t };
}
