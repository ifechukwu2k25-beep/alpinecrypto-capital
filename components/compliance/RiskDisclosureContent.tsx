"use client";

import { useI18n } from "@/lib/i18n/client";
import { Card } from "@/components/ui/Card";

export function RiskDisclosureContent() {
  const { t } = useI18n();

  return (
    <>
      <h1 className="text-h1 text-navy mb-8 font-serif">
        {t("disclosure.title")}
      </h1>
      <Card>
        <p className="text-charcoal mb-6">{t("disclosure.content")}</p>

        <h2 className="text-h3 text-navy mt-8 mb-4 font-serif">
          General Investment Risks
        </h2>
        <ul className="list-disc pl-6 space-y-3 text-charcoal mb-6">
          <li>
            <strong>Market Risk:</strong> The value of digital assets can fluctuate significantly
            and may result in substantial losses.
          </li>
          <li>
            <strong>Liquidity Risk:</strong> Digital assets may be subject to limited liquidity,
            making it difficult to sell assets at desired prices.
          </li>
          <li>
            <strong>Volatility Risk:</strong> Digital asset markets are highly volatile and can
            experience rapid and substantial price movements.
          </li>
          <li>
            <strong>Regulatory Risk:</strong> Changes in regulations or regulatory enforcement
            actions may adversely affect the value of digital assets.
          </li>
          <li>
            <strong>Technology Risk:</strong> Digital assets rely on technology infrastructure that
            may be vulnerable to cyberattacks, technical failures, or other operational risks.
          </li>
          <li>
            <strong>Loss of Principal:</strong> You may lose all or a substantial portion of your
            investment.
          </li>
        </ul>

        <h2 className="text-h3 text-navy mt-8 mb-4 font-serif">
          No Guarantees
        </h2>
        <p className="text-charcoal mb-6">
          This platform does not guarantee any returns, profits, or specific outcomes. All
          investments carry risk, and past performance is not indicative of future results. You
          should only invest funds that you can afford to lose.
        </p>

        <h2 className="text-h3 text-navy mt-8 mb-4 font-serif">
          Jurisdictional Considerations
        </h2>
        <p className="text-charcoal mb-6">
          Regulatory requirements and protections vary by jurisdiction. This platform may not be
          available or suitable for investors in all jurisdictions. Please ensure you understand
          the applicable regulations in your jurisdiction before using this platform.
        </p>

        <h2 className="text-h3 text-navy mt-8 mb-4 font-serif">
          Professional Advice
        </h2>
        <p className="text-charcoal mb-6">
          Before making any investment decisions, you should consult with qualified financial,
          legal, and tax advisors to understand the risks and implications of investing in digital
          assets.
        </p>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm font-medium text-yellow-800">
            By using this platform, you acknowledge that you have read, understood, and agree to
            accept all risks associated with digital asset investments.
          </p>
        </div>
      </Card>
    </>
  );
}
