"use client";

import { PlanCard } from "./PlanCard";
import { Database } from "@/types/supabase";
import { useI18n } from "@/lib/i18n/client";

type InvestmentPlan = Database["public"]["Tables"]["investment_plans"]["Row"];

interface PlanListProps {
  plans: InvestmentPlan[];
  onSelectPlan: (plan: InvestmentPlan) => void;
}

export function PlanList({ plans, onSelectPlan }: PlanListProps) {
  const { i18n } = useI18n();

  if (plans.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-charcoal">No investment plans available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          onSelect={onSelectPlan}
          locale={i18n.language}
        />
      ))}
    </div>
  );
}
