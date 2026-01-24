"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useI18n } from "@/lib/i18n/client";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Database } from "@/types/supabase";
import { Card } from "@/components/ui/Card";

type UserPlan = Database["public"]["Tables"]["user_plans"]["Row"];
type UserTransaction = Database["public"]["Tables"]["user_transactions"]["Row"];

export default function DashboardPage() {
  const { t, i18n } = useI18n();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userPlans, setUserPlans] = useState<UserPlan[]>([]);
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUser(user);

      // Load user investment plans
      const { data: plansData } = await supabase
        .from("user_plans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (plansData) {
        setUserPlans(plansData);
      }

      // Load recent transactions
      const { data: transactionsData } = await supabase
        .from("user_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (transactionsData) {
        setTransactions(transactionsData);
      }

      setLoading(false);
    };

    loadData();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-offwhite">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-charcoal">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  const totalInvested = userPlans
    .filter(p => p.status === 'active')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalExpectedReturn = userPlans
    .filter(p => p.status === 'active')
    .reduce((sum, p) => sum + Number(p.expected_return || 0), 0);

  const activePlans = userPlans.filter(p => p.status === 'active').length;

  return (
    <div className="flex flex-col min-h-screen bg-offwhite">
      <Header />
      <main className="flex-grow py-12 px-4">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-h1 text-navy font-serif">
              Investment Dashboard
            </h1>
            <button
              onClick={() => router.push("/invest")}
              className="bg-navy text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition"
            >
              Browse Investment Plans
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card>
              <h2 className="text-sm font-medium text-charcoal mb-2">
                Total Invested
              </h2>
              <p className="text-2xl font-bold text-navy">
                {formatCurrency(totalInvested, i18n.language)}
              </p>
            </Card>
            <Card>
              <h2 className="text-sm font-medium text-charcoal mb-2">
                Expected Returns
              </h2>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalExpectedReturn, i18n.language)}
              </p>
            </Card>
            <Card>
              <h2 className="text-sm font-medium text-charcoal mb-2">
                Active Plans
              </h2>
              <p className="text-2xl font-bold text-navy">
                {activePlans}
              </p>
            </Card>
          </div>

          {/* Active Investment Plans */}
          <Card className="mb-8">
            <h2 className="text-h3 text-navy mb-4 font-serif">
              My Investment Plans
            </h2>
            {userPlans.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-charcoal mb-4">
                  You haven't made any investments yet.
                </p>
                <button
                  onClick={() => router.push("/invest")}
                  className="bg-navy text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition"
                >
                  Start Investing
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {userPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex justify-between items-center py-4 px-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-navy text-lg">
                        {plan.plan_name || 'Investment Plan'}
                      </p>
                      <p className="text-sm text-charcoal">
                        Started: {formatDate(plan.start_date || plan.created_at, i18n.language)}
                      </p>
                      {plan.end_date && (
                        <p className="text-sm text-charcoal">
                          Ends: {formatDate(plan.end_date, i18n.language)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-navy">
                        {formatCurrency(Number(plan.amount), i18n.language)}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        plan.status === 'active' ? 'bg-green-100 text-green-800' :
                        plan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {plan.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Transactions */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-h3 text-navy font-serif">
                Recent Transactions
              </h2>
              <button
                onClick={() => router.push("/transactions")}
                className="text-navy hover:underline text-sm"
              >
                View All
              </button>
            </div>
            {transactions.length === 0 ? (
              <p className="text-charcoal text-center py-4">
                No transactions yet.
              </p>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex justify-between items-center py-3 border-b border-gray-200 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-navy capitalize">
                        {tx.transaction_type}
                      </p>
                      <p className="text-sm text-charcoal">
                        {formatDate(tx.created_at, i18n.language)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${
                        tx.transaction_type === 'deposit' || tx.transaction_type === 'profit' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {tx.transaction_type === 'deposit' || tx.transaction_type === 'profit' ? '+' : '-'}
                        {formatCurrency(Number(tx.amount), i18n.language)}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        tx.status === 'completed' ? 'bg-green-100 text-green-800' :
                        tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}