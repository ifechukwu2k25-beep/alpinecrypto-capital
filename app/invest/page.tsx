"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useI18n } from "@/lib/i18n/client";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Database } from "@/types/supabase";
import { Card } from "@/components/ui/Card";

type InvestmentPlan = Database["public"]["Tables"]["investment_plans"]["Row"];

export default function InvestPage() {
  const { i18n } = useI18n();
  const router = useRouter();
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [investAmount, setInvestAmount] = useState("");
  const supabase = createClient();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Load investment plans
    const { data: plansData, error: plansError } = await supabase
      .from("investment_plans")
      .select("*")
      .eq("is_active", true)
      .order("min_investment", { ascending: true });

    if (plansError) {
      console.error("Error loading plans:", plansError);
    }

    if (plansData) {
      setPlans(plansData);
    }

    // Load wallet balance
    const { data: walletData } = await supabase
      .from("user_wallets")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (walletData) {
      setWallet(walletData);
    }

    setLoading(false);
  };

  const handleInvest = async (plan: InvestmentPlan) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    setSelectedPlan(plan);
    setInvestAmount(plan.min_investment?.toString() || "");
  };

  const confirmInvestment = async () => {
    if (!selectedPlan || !investAmount) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const amount = parseFloat(investAmount);
    const walletBalance = Number(wallet?.balance || 0);

    // Check if user has sufficient balance
    if (amount > walletBalance) {
      alert(
        `Insufficient balance! You have ${formatCurrency(walletBalance, i18n.language)} but need ${formatCurrency(amount, i18n.language)}. Please deposit funds first.`
      );
      return;
    }

    setInvesting(true);

    const expectedReturn = amount * (1 + (selectedPlan.roi_percentage || 0) / 100);
    const durationDays = selectedPlan.duration_days || 90;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    try {
      // 1. Create user plan
      const { error: planError } = await supabase.from("user_plans").insert({
        user_id: user.id,
        plan_id: selectedPlan.id,
        amount: amount,
        status: "active",
        expected_return: expectedReturn,
        accumulated_profit: 0,
        start_date: new Date().toISOString(),
        end_date: endDate.toISOString(),
        last_profit_date: new Date().toISOString(),
      });

      if (planError) throw planError;

      // 2. Update wallet balances
      const newBalance = walletBalance - amount;
      const newInvestedCapital = Number(wallet?.invested_capital || 0) + amount;

      const { error: walletError } = await supabase
        .from("user_wallets")
        .update({
          balance: newBalance,
          invested_capital: newInvestedCapital,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (walletError) throw walletError;

      // 3. Create wallet transaction record
      const { error: txError } = await supabase.from("wallet_transactions").insert({
        user_id: user.id,
        transaction_type: "investment",
        amount: amount,
        status: "completed",
        description: `Investment in ${selectedPlan.name} plan - ${selectedPlan.roi_percentage}% ROI over ${Math.round(durationDays / 30)} months`,
      });

      if (txError) throw txError;

      setInvesting(false);
      setSelectedPlan(null);
      setInvestAmount("");
      alert("Investment successful! Your funds are now working for you. Daily profits will be credited to your wallet.");
      router.push("/wallet");
    } catch (error: any) {
      console.error("Investment error:", error);
      alert("Failed to create investment: " + error.message);
      setInvesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-offwhite">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto"></div>
        </main>
        <Footer />
      </div>
    );
  }

  const getTierColor = (index: number) => {
    const colors = [
      "border-green-500",
      "border-amber-600",
      "border-gray-400",
      "border-yellow-500",
      "border-purple-500",
      "border-blue-600",
    ];
    return colors[index] || "border-gray-300";
  };

  const getTierBadge = (name: string) => {
    if (name === "Diamond") return "💎 ELITE";
    if (name === "Platinum") return "👑 VIP";
    if (name === "Gold") return "⭐ PREMIUM";
    if (name === "Silver") return "🔥 POPULAR";
    if (name === "Bronze") return "📈 GROWTH";
    return "🚀 START";
  };

  return (
    <div className="flex flex-col min-h-screen bg-offwhite">
      <Header />
      <main className="flex-grow py-12 px-4">
        <div className="container-custom max-w-7xl mx-auto">
          {/* Wallet Balance Banner */}
          <div className="bg-gradient-to-r from-navy to-blue-700 text-white rounded-lg p-6 mb-8 shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-90 mb-1">Your Wallet Balance</p>
                <p className="text-3xl font-bold">
                  {formatCurrency(Number(wallet?.balance || 0), i18n.language)}
                </p>
                <p className="text-xs opacity-75 mt-1">Available for investment</p>
              </div>
              <button
                onClick={() => router.push("/wallet")}
                className="bg-white text-navy px-6 py-3 rounded-lg hover:bg-gray-100 transition font-semibold"
              >
                View Wallet
              </button>
            </div>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-h1 text-navy mb-4 font-serif">Investment Plans</h1>
            <p className="text-charcoal text-lg">
              Choose an investment plan that fits your financial goals. All plans include professional
              portfolio management and daily ROI accumulation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <Card
                key={plan.id}
                className={`flex flex-col border-2 ${getTierColor(index)} hover:shadow-xl transition-all duration-300`}
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-h3 text-navy font-serif">{plan.name}</h2>
                    <span className="text-xs font-bold bg-navy text-white px-2 py-1 rounded">
                      {getTierBadge(plan.name)}
                    </span>
                  </div>
                  {plan.description && (
                    <p className="text-sm text-charcoal leading-relaxed">{plan.description}</p>
                  )}
                </div>

                <div className="space-y-3 mb-6 flex-grow">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-charcoal">Investment Range:</span>
                    <span className="font-semibold text-navy text-sm">
                      {formatCurrency(plan.min_investment || 0, i18n.language)} -{" "}
                      {formatCurrency(plan.max_investment || 0, i18n.language)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-charcoal">Total Returns:</span>
                    <span className="font-bold text-green-600 text-lg">{plan.roi_percentage}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-charcoal">Duration:</span>
                    <span className="font-semibold text-navy">
                      {Math.round((plan.duration_days || 0) / 30)} months
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-charcoal">Daily Profit:</span>
                    <span className="font-semibold text-blue-600">
                      ~{((plan.roi_percentage || 0) / (plan.duration_days || 1)).toFixed(2)}%
                    </span>
                  </div>

                  {plan.features && plan.features.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs font-semibold text-charcoal mb-2">FEATURES:</p>
                      <ul className="space-y-1">
                        {plan.features.slice(0, 4).map((feature, idx) => (
                          <li key={idx} className="text-xs text-charcoal flex items-start">
                            <span className="text-green-600 mr-2">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleInvest(plan)}
                  className="w-full bg-navy text-white py-3 px-4 rounded-lg hover:bg-opacity-90 transition font-semibold"
                >
                  Invest Now
                </button>
              </Card>
            ))}
          </div>

          {plans.length === 0 && (
            <div className="text-center py-12">
              <p className="text-charcoal text-lg">No investment plans available at the moment.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Investment Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-h3 text-navy mb-4 font-serif">Invest in {selectedPlan.name}</h2>

            {/* Wallet Balance Info */}
            <div className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-200">
              <p className="text-xs text-charcoal mb-1">Available Balance:</p>
              <p className="text-xl font-bold text-navy">
                {formatCurrency(Number(wallet?.balance || 0), i18n.language)}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-charcoal mb-2">
                Investment Amount (USD)
              </label>
              <input
                type="number"
                min={selectedPlan.min_investment || 0}
                max={Math.min(selectedPlan.max_investment || Infinity, Number(wallet?.balance || 0))}
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy text-lg"
                placeholder={`Min: ${formatCurrency(selectedPlan.min_investment || 0, i18n.language)}`}
              />
              <p className="text-xs text-charcoal mt-1">
                Range: {formatCurrency(selectedPlan.min_investment || 0, i18n.language)} -{" "}
                {formatCurrency(selectedPlan.max_investment || 0, i18n.language)}
              </p>
            </div>

            {investAmount && parseFloat(investAmount) >= (selectedPlan.min_investment || 0) && (
              <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-200">
                <p className="text-sm text-charcoal mb-1">Expected Return:</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(
                    parseFloat(investAmount) * (1 + (selectedPlan.roi_percentage || 0) / 100),
                    i18n.language
                  )}
                </p>
                <p className="text-xs text-green-700 mt-2">
                  Profit: {formatCurrency(
                    parseFloat(investAmount) * ((selectedPlan.roi_percentage || 0) / 100),
                    i18n.language
                  )}{" "}
                  ({selectedPlan.roi_percentage}%)
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Daily: ~
                  {formatCurrency(
                    (parseFloat(investAmount) * ((selectedPlan.roi_percentage || 0) / 100)) /
                      (selectedPlan.duration_days || 1),
                    i18n.language
                  )}
                </p>
              </div>
            )}

            {investAmount && parseFloat(investAmount) > Number(wallet?.balance || 0) && (
              <div className="bg-red-50 p-3 rounded-lg mb-4 border border-red-200">
                <p className="text-sm text-red-700">
                  ⚠️ Insufficient balance! Please deposit funds first.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedPlan(null)}
                disabled={investing}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmInvestment}
                disabled={
                  investing ||
                  !investAmount ||
                  parseFloat(investAmount) < (selectedPlan.min_investment || 0) ||
                  parseFloat(investAmount) > (selectedPlan.max_investment || Infinity) ||
                  parseFloat(investAmount) > Number(wallet?.balance || 0)
                }
                className="flex-1 bg-navy text-white px-4 py-3 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50 font-semibold"
              >
                {investing ? "Processing..." : "Confirm Investment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}