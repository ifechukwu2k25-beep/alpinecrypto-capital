"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { Database } from "@/types/supabase";

type InvestmentPlan = Database["public"]["Tables"]["investment_plans"]["Row"];

interface PlanCardProps {
  plan: InvestmentPlan;
  onSelect: (plan: InvestmentPlan) => void;
  locale?: string;
}

export function PlanCard({ plan, onSelect, locale = "en-US" }: PlanCardProps) {
  const roiRange = `${plan.roi_min}% - ${plan.roi_max}%`;
  const frequencyText = plan.roi_frequency === "daily" ? "Daily" : "Weekly";
  const lockText = plan.lock_days === 0 ? "No lock" : `${plan.lock_days} day${plan.lock_days > 1 ? "s" : ""} lock`;

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow">
      <div className="flex-grow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-h3 text-navy font-serif">{plan.name}</h3>
          <span className="px-3 py-1 bg-navy text-white text-xs font-semibold rounded-full">
            Tier {plan.tier_rank}
          </span>
        </div>

        {plan.description && (
          <p className="text-charcoal mb-4 text-sm">{plan.description}</p>
        )}

        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-sm text-charcoal">Min Investment:</span>
            <span className="font-semibold text-navy">
              {formatCurrency(plan.min_amount, locale)}
            </span>
          </div>

          {plan.max_amount && (
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm text-charcoal">Max Investment:</span>
              <span className="font-semibold text-navy">
                {formatCurrency(plan.max_amount, locale)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-sm text-charcoal">ROI Range:</span>
            <span className="font-semibold text-red">{roiRange}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-sm text-charcoal">ROI Frequency:</span>
            <span className="font-semibold text-navy">{frequencyText}</span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-charcoal">Lock Period:</span>
            <span className="font-semibold text-navy">{lockText}</span>
          </div>
        </div>
      </div>

      <Button
        variant="primary"
        onClick={() => onSelect(plan)}
        className="w-full"
      >
        Select Plan
      </Button>
    </Card>
  );
}
