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
    const { data } = await supabase
      .from("investment_plans")
      .select("*")
      .eq("is_active", true)
      .order("min_deposit", { ascending: true });

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
    setInvestAmount(plan.min_deposit?.toString() || "");
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
    const expectedReturn = amount * (1 + (selectedPlan.expected_return_rate || 0) / 100);

    // Create user plan
    const { error: planError } = await supabase.from("user_plans").insert({
      user_id: user.id,
      investment_plan_id: selectedPlan.id,
      plan_name: selectedPlan.name,
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
          <p className="text-charcoal">Loading investment plans...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-offwhite">
      <Header />
      <main className="flex-grow py-12 px-4">
        <div className="container-custom max-w-7xl mx-auto">
          <h1 className="text-h1 text-navy mb-4 font-serif">Investment Plans</h1>
          <p className="text-charcoal mb-8">Choose an investment plan that fits your financial goals</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className="flex flex-col">
                <h2 className="text-h3 text-navy mb-2 font-serif">{plan.name}</h2>
                
                <div className="space-y-2 mb-4 flex-grow">
                  <div className="flex justify-between">
                    <span className="text-sm text-charcoal">ROI Range:</span>
                    <span className="font-semibold text-navy">
                      {plan.roi_min}% - {plan.roi_max}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-charcoal">Min Deposit:</span>
                    <span className="font-semibold text-navy">
                      {formatCurrency(plan.min_deposit || 0, i18n.language)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-charcoal">Expected Return:</span>
                    <span className="font-semibold text-green-600">{plan.expected_return_rate}%</span>
                  </div>
                  {plan.duration_months && (
                    <div className="flex justify-between">
                      <span className="text-sm text-charcoal">Duration:</span>
                      <span className="font-semibold text-navy">{plan.duration_months} months</span>
                    </div>
                  )}
                  {plan.lock_period_hours && (
                    <div className="flex justify-between">
                      <span className="text-sm text-charcoal">Lock Period:</span>
                      <span className="font-semibold text-navy">{plan.lock_period_hours}h</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleInvest(plan)}
                  className="w-full bg-navy text-white py-3 rounded-lg hover:bg-opacity-90 transition"
                >
                  Invest Now
                </button>
              </Card>
            ))}
          </div>

          {plans.length === 0 && (
            <div className="text-center py-12">
              <p className="text-charcoal">No investment plans available at the moment.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Investment Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-h3 text-navy mb-4 font-serif">Invest in {selectedPlan.name}</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-charcoal mb-2">Investment Amount</label>
              <input
                type="number"
                min={selectedPlan.min_deposit || 0}
                max={selectedPlan.roi_max ? selectedPlan.min_deposit! * selectedPlan.roi_max : undefined}
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                placeholder={`Min: ${formatCurrency(selectedPlan.min_deposit || 0, i18n.language)}`}
              />
            </div>
            {investAmount && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-charcoal mb-2">Expected Return:</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    parseFloat(investAmount) * (1 + (selectedPlan.expected_return_rate || 0) / 100),
                    i18n.language
                  )}
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedPlan(null)}
                disabled={investing}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmInvestment}
                disabled={investing || !investAmount}
                className="flex-1 bg-navy text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50"
              >
                {investing ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}