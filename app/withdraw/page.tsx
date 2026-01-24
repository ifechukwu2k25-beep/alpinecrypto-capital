"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useI18n } from "@/lib/i18n/client";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function WithdrawPage() {
  const { i18n } = useI18n();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userBalance, setUserBalance] = useState(0);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // FIX: Wrapped in useCallback to clear the Build Error
  const loadData = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      router.push("/auth/login");
      return;
    }

    setUser(authUser);

    // Fetch balance and withdrawals
    const [{ data: profile }, { data: withdrawData }] = await Promise.all([
      (supabase.from("profiles") as any).select("balance").eq("id", authUser.id).single(),
      (supabase.from("withdrawals") as any).select("*").eq("user_id", authUser.id).order("created_at", { ascending: false })
    ]);

    if (profile) setUserBalance(Number(profile.balance || 0));
    if (withdrawData) setWithdrawals(withdrawData);
    
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-offwhite">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-navy font-bold animate-pulse">Loading Portal...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-offwhite">
      <Header />
      <main className="flex-grow py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-navy">Withdraw Funds</h1>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase font-bold">Available Balance</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(userBalance, i18n.language)}</p>
            </div>
          </div>
          
          <Card className="p-8 mb-12 border-t-4 border-navy">
            <h2 className="text-lg font-bold mb-2">Create Request</h2>
            <p className="text-sm text-gray-500 mb-6">
              Requests are processed within 24 hours. A <span className="text-navy font-bold">10% processing fee</span> applies to all withdrawals.
            </p>
            
            <div className="space-y-4">
               {/* Note: This is a placeholder UI - the functional form is handled by your API */}
               <Button 
                onClick={() => alert("Please use the withdrawal form below the dashboard to submit.")}
                className="w-full bg-navy hover:bg-amber-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg"
               >
                Initiate New Withdrawal
              </Button>
            </div>
          </Card>

          <h2 className="text-xl font-bold text-navy mb-4">Request History</h2>
          <Card className="overflow-hidden border-none shadow-sm">
            {withdrawals.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <p>No withdrawal history found.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {withdrawals.map((w) => (
                  <div key={w.id} className="p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-bold text-navy text-lg">{formatCurrency(w.amount, i18n.language)}</p>
                      <p className="text-xs text-gray-400">{formatDate(w.created_at, i18n.language)}</p>
                      <p className="text-[10px] text-gray-300 mt-1 uppercase tracking-widest">{w.currency} • {w.network}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${
                        w.status === 'completed' ? 'bg-green-100 text-green-700' : 
                        w.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {w.status}
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