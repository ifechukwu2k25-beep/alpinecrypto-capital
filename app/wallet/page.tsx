"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useI18n } from "@/lib/i18n/client";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

export default function WalletPage() {
  const { i18n } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activePlans, setActivePlans] = useState<any[]>([]);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Load wallet
    const { data: walletData } = await supabase
      .from("user_wallets")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (walletData) {
      setWallet(walletData);
    }

    // Load recent transactions
    const { data: txData } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (txData) {
      setTransactions(txData);
    }

    // Load active investments
    const { data: plansData } = await supabase
      .from("user_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active");

    if (plansData) {
      setActivePlans(plansData);
    }

    setLoading(false);
  };

  const handleDeposit = () => {
    setShowDepositModal(true);
  };

  const handleWithdraw = () => {
    setShowWithdrawModal(true);
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

  return (
    <div className="flex flex-col min-h-screen bg-offwhite">
      <Header />
      <main className="flex-grow py-12 px-4">
        <div className="container-custom max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-h1 text-navy font-serif">My Wallet</h1>
            <div className="flex gap-3">
              <button
                onClick={handleDeposit}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
              >
                💰 Deposit
              </button>
              <button
                onClick={handleWithdraw}
                className="bg-navy text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition font-semibold"
              >
                💸 Withdraw
              </button>
            </div>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
              <h3 className="text-sm font-medium opacity-90 mb-2">Total Balance</h3>
              <p className="text-3xl font-bold">
                {formatCurrency(Number(wallet?.balance || 0), i18n.language)}
              </p>
              <p className="text-xs opacity-75 mt-2">Available for investment</p>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white">
              <h3 className="text-sm font-medium opacity-90 mb-2">Withdrawable</h3>
              <p className="text-3xl font-bold">
                {formatCurrency(Number(wallet?.withdrawable_balance || 0), i18n.language)}
              </p>
              <p className="text-xs opacity-75 mt-2">Ready to withdraw</p>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
              <h3 className="text-sm font-medium opacity-90 mb-2">Invested Capital</h3>
              <p className="text-3xl font-bold">
                {formatCurrency(Number(wallet?.invested_capital || 0), i18n.language)}
              </p>
              <p className="text-xs opacity-75 mt-2">Locked in investments</p>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
              <h3 className="text-sm font-medium opacity-90 mb-2">Total Profit</h3>
              <p className="text-3xl font-bold">
                {formatCurrency(Number(wallet?.total_profit || 0), i18n.language)}
              </p>
              <p className="text-xs opacity-75 mt-2">Lifetime earnings</p>
            </Card>
          </div>

          {/* Active Investments */}
          {activePlans.length > 0 && (
            <Card className="mb-8">
              <h2 className="text-h3 text-navy mb-4 font-serif">Active Investments</h2>
              <div className="space-y-4">
                {activePlans.map((plan) => {
                  const dailyProfit = Number(plan.expected_return || 0) / (plan.duration_days || 1);
                  const daysElapsed = plan.start_date
                    ? Math.floor((Date.now() - new Date(plan.start_date).getTime()) / (1000 * 60 * 60 * 24))
                    : 0;
                  const accumulatedProfit = Math.min(dailyProfit * daysElapsed, Number(plan.expected_return || 0));
                  const progress = ((Number(plan.amount) + accumulatedProfit) / Number(plan.expected_return || 1)) * 100;

                  return (
                    <div
                      key={plan.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-navy text-lg">Investment Plan</h3>
                          <p className="text-sm text-charcoal">
                            Started: {formatDate(plan.start_date || plan.created_at, i18n.language)}
                          </p>
                        </div>
                        <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold">
                          Active
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-charcoal mb-1">Invested</p>
                          <p className="font-bold text-navy">
                            {formatCurrency(Number(plan.amount), i18n.language)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-charcoal mb-1">Expected Return</p>
                          <p className="font-bold text-green-600">
                            {formatCurrency(Number(plan.expected_return || 0), i18n.language)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-charcoal mb-1">Daily Profit</p>
                          <p className="font-bold text-blue-600">
                            {formatCurrency(dailyProfit, i18n.language)}
                          </p>
                        </div>
                      </div>

                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-charcoal mb-1">
                          <span>Accumulated Profit</span>
                          <span className="font-semibold">
                            {formatCurrency(accumulatedProfit, i18n.language)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Recent Transactions */}
          <Card>
            <h2 className="text-h3 text-navy mb-4 font-serif">Recent Transactions</h2>
            {transactions.length === 0 ? (
              <p className="text-charcoal text-center py-8">No transactions yet.</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex justify-between items-center py-3 px-4 border-b border-gray-200 last:border-0 hover:bg-gray-50 transition"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-navy capitalize">
                        {tx.transaction_type}
                      </p>
                      {tx.description && (
                        <p className="text-sm text-charcoal">{tx.description}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {formatDate(tx.created_at, i18n.language)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          tx.transaction_type === "deposit" || tx.transaction_type === "profit"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {tx.transaction_type === "deposit" || tx.transaction_type === "profit"
                          ? "+"
                          : "-"}
                        {formatCurrency(Number(tx.amount), i18n.language)}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          tx.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : tx.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : tx.status === "processing"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
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

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-h3 text-navy mb-4 font-serif">Deposit Funds</h2>
            <p className="text-charcoal mb-4">
              To deposit funds, please go to the Deposit page where you can choose your preferred
              cryptocurrency and upload payment proof.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDepositModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => router.push("/deposit")}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Go to Deposit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-h3 text-navy mb-4 font-serif">Withdraw Funds</h2>
            <p className="text-charcoal mb-4">
              To withdraw funds, please go to the Withdraw page where you can request a withdrawal
              to your crypto wallet.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => router.push("/withdraw")}
                className="flex-1 bg-navy text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition"
              >
                Go to Withdraw
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}