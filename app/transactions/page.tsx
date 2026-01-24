"use client";

import { useEffect, useState, useCallback } from "react"; // Added useCallback
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useI18n } from "@/lib/i18n/client";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

export default function TransactionsPage() {
  const { i18n } = useI18n();
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const supabase = createClient();

  // FIX: Wrapped loadTransactions in useCallback
  const loadTransactions = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    let query = supabase
      .from("user_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("type", filter);
    }

    const { data, error } = await (query as any);

    if (error) {
      console.error("Error loading transactions:", error);
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  }, [supabase, router, filter]); // Dependencies for useCallback

  // FIX: Added loadTransactions to the dependency array
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-offwhite">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-pulse text-navy font-bold">Loading transactions...</div>
        </main>
        <Footer />
      </div>
    );
  }

  const totalDeposits = transactions
    .filter(t => t.type === 'deposit' && t.status === 'completed')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalWithdrawals = transactions
    .filter(t => t.type === 'withdrawal' && t.status === 'completed')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalProfits = transactions
    .filter(t => t.type === 'profit' && t.status === 'completed')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="flex flex-col min-h-screen bg-offwhite">
      <Header />
      <main className="flex-grow py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-navy mb-8">Transaction History</h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <h2 className="text-sm font-medium text-gray-500 mb-2">Total Deposits</h2>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalDeposits, i18n.language)}</p>
            </Card>
            <Card className="p-6">
              <h2 className="text-sm font-medium text-gray-500 mb-2">Total Withdrawals</h2>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalWithdrawals, i18n.language)}</p>
            </Card>
            <Card className="p-6">
              <h2 className="text-sm font-medium text-gray-500 mb-2">Total Profits</h2>
              <p className="text-2xl font-bold text-navy">{formatCurrency(totalProfits, i18n.language)}</p>
            </Card>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {['all', 'deposit', 'withdrawal', 'profit', 'investment'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  filter === type ? 'bg-navy text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <Card className="overflow-hidden">
            {transactions.length === 0 ? (
              <div className="text-gray-500 text-center py-20">No transactions found for this filter.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center py-5 px-6 hover:bg-gray-50 transition">
                    <div className="flex-1">
                      <p className="font-bold text-navy capitalize">{tx.type}</p>
                      {tx.description && <p className="text-sm text-gray-600">{tx.description}</p>}
                      <p className="text-xs text-gray-400 mt-1">{formatDate(tx.created_at, i18n.language)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${tx.type === 'deposit' || tx.type === 'profit' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'deposit' || tx.type === 'profit' ? '+' : '-'}{formatCurrency(Number(tx.amount), i18n.language)}
                      </p>
                      <span className={`inline-block mt-1 text-[10px] uppercase font-bold px-2 py-1 rounded ${
                        tx.status === 'completed' ? 'bg-green-100 text-green-700' : 
                        tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
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