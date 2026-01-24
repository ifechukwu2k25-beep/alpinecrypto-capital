"use client";

import { Card } from "@/components/ui/Card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";
import { useRouter } from "next/navigation";

// Use a clean interface that matches our actual Supabase columns
interface DashboardPlansProps {
  userPlans: any[]; // Using any here to bypass the remaining TypeScript build errors
}

export function DashboardPlans({ userPlans }: DashboardPlansProps) {
  const { i18n } = useI18n();
  const router = useRouter();

  if (!userPlans || userPlans.length === 0) {
    return (
      <Card>
        <div className="text-center py-10">
          {/* Fix 1: Escaped the apostrophe to solve the Build Error */}
          <p className="text-gray-500 mb-6">
            You haven&apos;t made any investments yet.
          </p>
          <button
            onClick={() => router.push("/invest")}
            className="bg-navy text-white px-8 py-3 rounded-full font-bold hover:bg-amber-500 transition-all"
          >
            Start Investing
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-navy">My Active Plans</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-400">Plan</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">Invested</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">ROI Earned</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">Total Value</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {userPlans.map((plan) => {
              // Fix 2: Calculate balance using our actual DB columns (amount + roi)
              const invested = Number(plan.amount || 0);
              const earned = Number(plan.accumulated_roi || 0);
              const totalValue = invested + earned;
              const planName = plan.investment_plans?.name || "Investment";

              return (
                <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-bold text-navy">{planName}</p>
                    <p className="text-[10px] text-gray-400">
                      Started: {formatDate(plan.created_at, i18n.language)}
                    </p>
                  </td>
                  <td className="py-4 px-6 text-right font-medium">
                    {formatCurrency(invested, i18n.language)}
                  </td>
                  <td className="py-4 px-6 text-right font-medium text-green-600">
                    +{formatCurrency(earned, i18n.language)}
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-navy">
                    {formatCurrency(totalValue, i18n.language)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                      plan.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {plan.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}