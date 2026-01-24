"use client";

import { useI18n } from "@/lib/i18n/client";
import { Button } from "@/components/ui/Button";

export function Hero() {
  const { t } = useI18n();

  return (
    <section className="section-padding bg-gradient-to-b from-offwhite to-white">
      <div className="container-custom">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-display-1 md:text-display-2 text-navy mb-6 font-serif">
            {t("hero.title")}
          </h1>
          <p className="text-xl md:text-2xl text-charcoal mb-10 max-w-3xl mx-auto leading-relaxed">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="primary" href="/auth/signup" asChild>
              {t("hero.cta")}
            </Button>
            <Button variant="secondary" href="/risk-disclosure" asChild>
              Risk Disclosure
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
