"use client";

import { useI18n } from "@/lib/i18n/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

export function RegulatoryDisclosures() {
  const { t } = useI18n();

  return (
    <section className="section-padding bg-offwhite">
      <div className="container-custom">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-h1 text-navy mb-4 font-serif">
              Regulatory & Risk Disclosures
            </h2>
          </div>
          <Card className="max-w-4xl mx-auto">
            <div className="space-y-6">
              <p className="text-lg text-charcoal leading-relaxed">
                Digital asset investments carry significant risk. Past performance does not guarantee
                future results. Investors should carefully consider their risk tolerance and investment
                objectives before making any investment decisions.
              </p>
              <p className="text-lg text-charcoal leading-relaxed">
                This platform is designed for institutional and qualified investors. All investments
                are subject to market risk, including potential loss of principal.
              </p>
              <p className="text-lg text-charcoal leading-relaxed">
                Regulatory requirements vary by jurisdiction. Please ensure you understand the
                applicable regulations in your jurisdiction before using this platform.
              </p>
              <div className="mt-8 pt-6 border-t border-gray-200">
                <Button variant="primary" href="/risk-disclosure" asChild>
                  <span className="flex items-center gap-2">
                    {t("common.riskDisclosure")}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
