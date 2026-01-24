"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/client";
import { Logo } from "@/components/brand/Logo";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-gray-200 bg-navy text-white mt-auto">
      <div className="container-custom px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Logo variant="white" className="mb-4" />
            <p className="text-sm text-gray-300 leading-relaxed">
              Professional Digital Asset Governance. Trusted, Swiss-aligned portfolio advisory for institutional investors.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/risk-disclosure"
                  className="text-sm text-gray-300 hover:text-red transition-colors"
                >
                  {t("common.riskDisclosure")}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-300 hover:text-red transition-colors"
                >
                  {t("common.terms")}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-300 hover:text-red transition-colors"
                >
                  {t("common.privacy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-navy-600">
          <p className="text-sm text-gray-300 text-center">
            © {new Date().getFullYear()} AlpineCrypto Capital. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
