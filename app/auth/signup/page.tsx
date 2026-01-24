"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useI18n } from "@/lib/i18n/client";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function SignupPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [country, setCountry] = useState("");
  const [residencyRegion, setResidencyRegion] = useState("");
  const [investorType, setInvestorType] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          country,
          residency_region: residencyRegion,
          investor_type: investorType,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // Create profile
      const { error: profileError } = await (supabase.from("profiles") as any).insert({
        id: authData.user.id,
        email: authData.user.email!,
        country,
        residency_region: residencyRegion,
        investor_type: investorType,
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
      }
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="flex flex-col min-h-screen bg-offwhite">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <h1 className="text-h2 text-navy mb-8 text-center font-serif">
            {t("auth.createAccount")}
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-2">
                {t("auth.email")}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-charcoal focus:ring-2 focus:ring-red focus:border-red transition-colors"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-charcoal mb-2">
                {t("auth.password")}
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-charcoal focus:ring-2 focus:ring-red focus:border-red transition-colors"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-charcoal mb-2">
                {t("auth.confirmPassword")}
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-charcoal focus:ring-2 focus:ring-red focus:border-red transition-colors"
              />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-charcoal mb-2">
                {t("auth.country")}
              </label>
              <input
                id="country"
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-charcoal focus:ring-2 focus:ring-red focus:border-red transition-colors"
              />
            </div>
            <div>
              <label htmlFor="residencyRegion" className="block text-sm font-medium text-charcoal mb-2">
                {t("auth.residencyRegion")}
              </label>
              <select
                id="residencyRegion"
                required
                value={residencyRegion}
                onChange={(e) => setResidencyRegion(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-charcoal focus:ring-2 focus:ring-red focus:border-red transition-colors"
              >
                <option value="">Select Region</option>
                <option value="EU">European Union</option>
                <option value="GCC">GCC</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="investorType" className="block text-sm font-medium text-charcoal mb-2">
                {t("auth.investorType")}
              </label>
              <select
                id="investorType"
                required
                value={investorType}
                onChange={(e) => setInvestorType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-charcoal focus:ring-2 focus:ring-red focus:border-red transition-colors"
              >
                <option value="">Select Type</option>
                <option value="institutional">Institutional</option>
                <option value="qualified">Qualified</option>
                <option value="accredited">Accredited</option>
              </select>
            </div>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Loading..." : t("auth.createAccount")}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-charcoal">
            {t("auth.haveAccount")}{" "}
            <Link href="/auth/login" className="text-navy font-semibold hover:text-red transition-colors">
              {t("auth.signIn")}
            </Link>
          </p>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
