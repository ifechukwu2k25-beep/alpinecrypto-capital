"use client";

import { useI18n } from "@/lib/i18n/client";
import { Card } from "@/components/ui/Card";

export function RiskManagement() {
  const { t } = useI18n();

  return (
    <section className="section-padding bg-offwhite">
      <div className="container-custom">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-h1 text-navy mb-4 font-serif">
              {t("riskManagement.title")}
            </h2>
            <p className="text-xl text-charcoal mb-6 max-w-3xl mx-auto">
              {t("riskManagement.subtitle")}
            </p>
          </div>
          <Card className="max-w-4xl mx-auto">
            <p className="text-lg text-charcoal leading-relaxed">
              {t("riskManagement.description")}
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
