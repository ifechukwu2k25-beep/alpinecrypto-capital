"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useI18n } from "@/lib/i18n/client";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

type Deposit = {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  wallet_address: string;
  transaction_hash: string | null;
  proof_url: string | null;
  status: string;
  created_at: string;
};

type Withdrawal = {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  user_wallet_address: string;
  network: string | null;
  status: string;
  transaction_hash: string | null;
  admin_notes: string | null;
  created_at: string;
};

type Transaction = {
  id: string;
  user_id: string;
  transaction_type: string;
  amount: number;
  status: string;
  created_at: string;
};

type User = {
  id: string;
  email: string;
};

export default function AdminPage() {
  const { i18n } = useI18n();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const supabase = createClient();

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Check role from profiles table instead of metadata (more secure)
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== 'admin') {
      router.push("/dashboard");
      return;
    }

    setUser(user);

    await Promise.all([
      loadTransactions(),
      loadDeposits(),
      loadWithdrawals(),
      loadUsers()
    ]);

    setLoading(false);
  };

  const loadTransactions = async () => {
    const { data } = await supabase
      .from("user_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) {
      setTransactions(data);
    }
  };

  const loadDeposits = async () => {
    const { data } = await supabase
      .from("deposits")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setDeposits(data);
    }
  };

  const loadWithdrawals = async () => {
    const { data } = await supabase
      .from("withdrawals")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setWithdrawals(data);
    }
  };

  const loadUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, email")
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) {
      setUsers(data);
    }
  };

  const handleApproveDeposit = async (depositId: string, amount: number, userId: string) => {
    if (!confirm("Approve this deposit?")) return;

    // Update deposit status
    const { error: depositError } = await supabase
      .from("deposits")
      .update({ 
        status: "confirmed",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", depositId);

    if (depositError) {
      alert("Error updating deposit: " + depositError.message);
      return;
    }

    // Update transaction status
    const { error: txError } = await supabase
      .from("user_transactions")
      .update({ status: "completed" })
      .eq("user_id", userId)
      .eq("transaction_type", "deposit")
      .eq("amount", amount)
      .eq("status", "pending");

    if (txError) {
      console.error("Error updating transaction:", txError);
    }

    alert("Deposit approved!");
    loadDeposits();
    loadTransactions();
  };

  const handleRejectDeposit = async (depositId: string, amount: number, userId: string) => {
    const reason = prompt("Rejection reason:");
    if (!reason) return;

    // Update deposit status
    const { error: depositError } = await supabase
      .from("deposits")
      .update({ 
        status: "rejected",
        admin_notes: reason,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", depositId);

    if (depositError) {
      alert("Error updating deposit: " + depositError.message);
      return;
    }

    // Update transaction status
    const { error: txError } = await supabase
      .from("user_transactions")
      .update({ status: "failed" })
      .eq("user_id", userId)
      .eq("transaction_type", "deposit")
      .eq("amount", amount)
      .eq("status", "pending");

    if (txError) {
      console.error("Error updating transaction:", txError);
    }

    alert("Deposit rejected!");
    loadDeposits();
    loadTransactions();
  };

  const handleApproveWithdrawal = async (withdrawalId: string, amount: number, userId: string) => {
    const txHash = prompt("Enter transaction hash after sending funds:");
    if (!txHash) return;

    // Update withdrawal status
    const { error: withdrawalError } = await supabase
      .from("withdrawals")
      .update({ 
        status: "completed",
        transaction_hash: txHash,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", withdrawalId);

    if (withdrawalError) {
      alert("Error updating withdrawal: " + withdrawalError.message);
      return;
    }

    // Update transaction status
    const { error: txError } = await supabase
      .from("user_transactions")
      .update({ status: "completed" })
      .eq("user_id", userId)
      .eq("transaction_type", "withdrawal")
      .eq("amount", amount)
      .eq("status", "pending");

    if (txError) {
      console.error("Error updating transaction:", txError);
    }

    alert("Withdrawal approved and processed!");
    loadWithdrawals();
    loadTransactions();
  };

  const handleRejectWithdrawal = async (withdrawalId: string, amount: number, userId: string) => {
    const reason = prompt("Rejection reason:");
    if (!reason) return;

    // Update withdrawal status
    const { error: withdrawalError } = await supabase
      .from("withdrawals")
      .update({ 
        status: "rejected",
        admin_notes: reason,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", withdrawalId);

    if (withdrawalError) {
      alert("Error updating withdrawal: " + withdrawalError.message);
      return;
    }

    // Update transaction status
    const { error: txError } = await supabase
      .from("user_transactions")
      .update({ status: "failed" })
      .eq("user_id", userId)
      .eq("transaction_type", "withdrawal")
      .eq("amount", amount)
      .eq("status", "pending");

    if (txError) {
      console.error("Error updating transaction:", txError);
    }

    alert("Withdrawal rejected!");
    loadWithdrawals();
    loadTransactions();
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-offwhite">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-charcoal">Loading admin panel...</p>
        </main>
        <Footer />
      </div>
    );
  }

  const pendingDeposits = deposits.filter(d => d.status === 'pending');
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');

  return (
    <div className="flex flex-col min-h-screen bg-offwhite">
      <Header />
      <main className="flex-grow py-12 px-4">
        <div className="container-custom">
          <h1 className="text-h1 text-navy mb-8 font-serif">
            Admin Panel
          </h1>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <h3 className="text-sm text-charcoal mb-2">Pending Deposits</h3>
              <p className="text-3xl font-bold text-orange-600">{pendingDeposits.length}</p>
            </Card>
            <Card>
              <h3 className="text-sm text-charcoal mb-2">Pending Withdrawals</h3>
              <p className="text-3xl font-bold text-red-600">{pendingWithdrawals.length}</p>
            </Card>
            <Card>
              <h3 className="text-sm text-charcoal mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-navy">{users.length}+</p>
            </Card>
            <Card>
              <h3 className="text-sm text-charcoal mb-2">Total Transactions</h3>
              <p className="text-3xl font-bold text-green-600">{transactions.length}+</p>
            </Card>
          </div>

          {/* Pending Deposits */}
          <Card className="mb-8">
            <h2 className="text-h3 text-navy mb-4 font-serif">
              Pending Deposits ({pendingDeposits.length})
            </h2>
            {pendingDeposits.length === 0 ? (
              <p className="text-charcoal text-center py-4">No pending deposits</p>
            ) : (
              <div className="space-y-4">
                {pendingDeposits.map((deposit) => (
                  <div key={deposit.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-navy text-lg">
                          {formatCurrency(deposit.amount, i18n.language)}
                        </p>
                        <p className="text-sm text-charcoal">
                          {deposit.currency} • {formatDate(deposit.created_at, i18n.language)}
                        </p>
                        <p className="text-xs text-gray-500">User ID: {deposit.user_id.slice(0, 8)}...</p>
                      </div>
                      <span className="text-xs px-3 py-1 rounded bg-yellow-100 text-yellow-800">
                        PENDING
                      </span>
                    </div>

                    <div className="bg-gray-50 p-3 rounded mb-3 text-xs">
                      <p className="text-gray-600 mb-1">Wallet: {deposit.wallet_address}</p>
                      {deposit.transaction_hash && (
                        <p className="text-gray-600 break-all">TX: {deposit.transaction_hash}</p>
                      )}
                    </div>

                    {deposit.proof_url && (
                      <div className="mb-3">
                        <a
                          href={deposit.proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Payment Proof →
                        </a>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveDeposit(deposit.id, deposit.amount, deposit.user_id)}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectDeposit(deposit.id, deposit.amount, deposit.user_id)}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Pending Withdrawals */}
          <Card className="mb-8">
            <h2 className="text-h3 text-navy mb-4 font-serif">
              Pending Withdrawals ({pendingWithdrawals.length})
            </h2>
            {pendingWithdrawals.length === 0 ? (
              <p className="text-charcoal text-center py-4">No pending withdrawals</p>
            ) : (
              <div className="space-y-4">
                {pendingWithdrawals.map((withdrawal) => (
                  <div key={withdrawal.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-navy text-lg">
                          {formatCurrency(withdrawal.amount, i18n.language)}
                        </p>
                        <p className="text-sm text-charcoal">
                          {withdrawal.currency} ({withdrawal.network}) • {formatDate(withdrawal.created_at, i18n.language)}
                        </p>
                        <p className="text-xs text-gray-500">User ID: {withdrawal.user_id.slice(0, 8)}...</p>
                      </div>
                      <span className="text-xs px-3 py-1 rounded bg-yellow-100 text-yellow-800">
                        PENDING
                      </span>
                    </div>

                    <div className="bg-gray-50 p-3 rounded mb-3 text-xs">
                      <p className="text-gray-600 break-all">
                        Send to: {withdrawal.user_wallet_address}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveWithdrawal(withdrawal.id, withdrawal.amount, withdrawal.user_id)}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
                      >
                        Mark as Sent
                      </button>
                      <button
                        onClick={() => handleRejectWithdrawal(withdrawal.id, withdrawal.amount, withdrawal.user_id)}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Transactions */}
          <Card>
            <h2 className="text-h3 text-navy mb-4 font-serif">
              Recent Transactions
            </h2>
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex justify-between items-center py-2 px-3 border-b border-gray-200 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-navy capitalize">{tx.transaction_type}</p>
                    <p className="text-xs text-gray-500">{tx.user_id.slice(0, 8)}...</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-navy">
                      {formatCurrency(tx.amount, i18n.language)}
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
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}