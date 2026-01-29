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
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [investAmount, setInvestAmount] = useState("");
  const supabase = createClient();

  useEffect(() => {
    loadPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPlans = async () => {
    const { data, error } = await supabase
      .from("investment_plans")
      .select("*")
      .eq("is_active", true)
      .order("min_investment", { ascending: true });

    if (error) {
      console.error("Error loading plans:", error);
    }

    if (data) {
      setPlans(data);
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

    setInvesting(true);

    const amount = parseFloat(investAmount);
    const expectedReturn = amount * (1 + (selectedPlan.roi_percentage || 0) / 100);

    // Create user plan
    const { error: planError } = await supabase.from("user_plans").insert({
      user_id: user.id,
      plan_id: selectedPlan.id,
      amount: amount,
      status: "active",
      expected_return: expectedReturn,
    });

    if (planError) {
      alert("Failed to create investment plan: " + planError.message);
      setInvesting(false);
      return;
    }

    // Create transaction record
    const { error: txError } = await supabase.from("user_transactions").insert({
      user_id: user.id,
      transaction_type: "investment",
      amount: amount,
      status: "completed",
      description: `Investment in ${selectedPlan.name}`,
    });

    if (txError) {
      console.error("Failed to create transaction:", txError);
    }

    setInvesting(false);
    setSelectedPlan(null);
    setInvestAmount("");
    alert("Investment successful!");
    router.push("/dashboard");
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

  // Tier colors for visual hierarchy
  const getTierColor = (index: number) => {
    const colors = [
      "border-green-500",    // Starter - Green
      "border-amber-600",    // Bronze
      "border-gray-400",     // Silver
      "border-yellow-500",   // Gold
      "border-purple-500",   // Platinum
      "border-blue-600"      // Diamond
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
          <div className="text-center mb-12">
            <h1 className="text-h1 text-navy mb-4 font-serif">Investment Plans</h1>
            <p className="text-charcoal text-lg">
              Choose an investment plan that fits your financial goals. All plans include professional portfolio management.
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
                    <p className="text-sm text-charcoal leading-relaxed">
                      {plan.description}
                    </p>
                  )}
                </div>
                
                <div className="space-y-3 mb-6 flex-grow">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-charcoal">Investment Range:</span>
                    <span className="font-semibold text-navy">
                      {formatCurrency(plan.min_investment || 0, i18n.language)} - {formatCurrency(plan.max_investment || 0, i18n.language)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-charcoal">Total Returns:</span>
                    <span className="font-bold text-green-600 text-lg">
                      {plan.roi_percentage}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-charcoal">Duration:</span>
                    <span className="font-semibold text-navy">
                      {Math.round((plan.duration_days || 0) / 30)} months ({plan.duration_days} days)
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
              <p className="text-sm text-charcoal mt-2">Please check back later or contact support.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Investment Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-h3 text-navy mb-4 font-serif">
              Invest in {selectedPlan.name}
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-charcoal mb-2">
                Investment Amount (USD)
              </label>
              <input
                type="number"
                min={selectedPlan.min_investment || 0}
                max={selectedPlan.max_investment || undefined}
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy text-lg"
                placeholder={`Min: ${formatCurrency(selectedPlan.min_investment || 0, i18n.language)}`}
              />
              <p className="text-xs text-charcoal mt-1">
                Range: {formatCurrency(selectedPlan.min_investment || 0, i18n.language)} - {formatCurrency(selectedPlan.max_investment || 0, i18n.language)}
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
                  )} ({selectedPlan.roi_percentage}%)
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
                  parseFloat(investAmount) > (selectedPlan.max_investment || Infinity)
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