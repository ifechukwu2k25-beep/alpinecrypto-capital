"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { Database } from "@/types/supabase";
import { X } from "lucide-react";

type InvestmentPlan = Database["public"]["Tables"]["investment_plans"]["Row"];

interface SubscriptionModalProps {
  plan: InvestmentPlan | null;
  currentBalance: number;
  topUpRequired: number;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  onTopUp: () => void;
  locale?: string;
}

export function SubscriptionModal({
  plan,
  currentBalance,
  topUpRequired,
  onClose,
  onConfirm,
  onTopUp,
  locale = "en-US",
}: SubscriptionModalProps) {
  const [amount, setAmount] = useState(plan?.min_amount?.toString() || "");
  const [loading, setLoading] = useState(false);

  if (!plan) return null;

  const handleConfirm = async () => {
    const investAmount = parseFloat(amount);
    if (isNaN(investAmount) || investAmount < plan.min_amount) {
      alert(`Minimum investment is ${formatCurrency(plan.min_amount, locale)}`);
      return;
    }
    if (plan.max_amount && investAmount > plan.max_amount) {
      alert(`Maximum investment is ${formatCurrency(plan.max_amount, locale)}`);
      return;
    }

    setLoading(true);
    await onConfirm(investAmount);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-charcoal hover:text-red transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-h2 text-navy mb-4 font-serif">
          Invest in {plan.name}
        </h2>

        {topUpRequired > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800 mb-2">
              <strong>Insufficient Balance</strong>
            </p>
            <p className="text-sm text-yellow-700">
              Current Balance: {formatCurrency(currentBalance, locale)}
            </p>
            <p className="text-sm text-yellow-700">
              Required Top-up: {formatCurrency(topUpRequired, locale)}
            </p>
            <Button
              variant="primary"
              onClick={onTopUp}
              className="w-full mt-3"
            >
              Top Up Balance
            </Button>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-charcoal mb-2">
            Investment Amount
          </label>
          <input
            type="number"
            min={plan.min_amount}
            max={plan.max_amount || undefined}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red focus:border-red transition-colors"
            placeholder={`Min: ${formatCurrency(plan.min_amount, locale)}`}
          />
          <p className="text-xs text-charcoal mt-1">
            Range: {formatCurrency(plan.min_amount, locale)}
            {plan.max_amount && ` - ${formatCurrency(plan.max_amount, locale)}`}
          </p>
        </div>

        {amount && !isNaN(parseFloat(amount)) && (
          <div className="bg-offwhite p-4 rounded-lg mb-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-charcoal">Investment:</span>
                <span className="font-semibold text-navy">
                  {formatCurrency(parseFloat(amount), locale)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal">ROI Range:</span>
                <span className="font-semibold text-red">
                  {plan.roi_min}% - {plan.roi_max}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal">Frequency:</span>
                <span className="font-semibold text-navy">
                  {plan.roi_frequency === "daily" ? "Daily" : "Weekly"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal">Lock Period:</span>
                <span className="font-semibold text-navy">
                  {plan.lock_days} day{plan.lock_days !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={loading || !amount || topUpRequired > 0}
            className="flex-1"
          >
            {loading ? "Processing..." : "Confirm Investment"}
          </Button>
        </div>
      </div>
    </div>
  );
}
