"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useI18n } from "@/lib/i18n/client";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

export default function WithdrawPage() {
  const { i18n } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<any>(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("BTC");
  const [userWalletAddress, setUserWalletAddress] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  const currencies = [
    { code: "BTC", name: "Bitcoin", networks: ["Bitcoin"] },
    { code: "ETH", name: "Ethereum", networks: ["ERC20"] },
    { code: "USDT", name: "Tether", networks: ["TRC20", "ERC20", "BEP20"] },
    { code: "USDC", name: "USD Coin", networks: ["ERC20"] },
    { code: "XRP", name: "Ripple", networks: ["XRP Ledger"] },
    { code: "SOL", name: "Solana", networks: ["Solana"] },
    { code: "BNB", name: "Binance Coin", networks: ["BNB Beacon Chain", "BEP20"] },
  ];

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { data: walletData } = await supabase
      .from("user_wallets")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (walletData) {
      setWallet(walletData);
    }
    setLoading(false);
  };

  const handleSubmitWithdrawal = async () => {
    if (!withdrawAmount || !userWalletAddress || !selectedNetwork) {
      alert("Please fill all required fields!");
      return;
    }

    const amount = parseFloat(withdrawAmount);
    const withdrawableBalance = Number(wallet?.withdrawable_balance || 0);

    if (amount > withdrawableBalance) {
      alert(
        `Insufficient withdrawable balance! You have ${formatCurrency(withdrawableBalance, i18n.language)} available.`
      );
      return;
    }

    if (amount < 10) {
      alert("Minimum withdrawal amount is $10");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    setSubmitting(true);

    try {
      // Create withdrawal request
      const { error: withdrawalError } = await supabase.from("withdrawals").insert({
        user_id: user.id,
        amount: amount,
        currency: selectedCurrency,
        user_wallet_address: userWalletAddress,
        network: selectedNetwork,
        status: "pending",
      });

      if (withdrawalError) throw withdrawalError;

      // Create wallet transaction
      await supabase.from("wallet_transactions").insert({
        user_id: user.id,
        transaction_type: "withdrawal",
        amount: amount,
        status: "pending",
        description: `Withdrawal request - ${selectedCurrency} (${selectedNetwork})`,
      });

      // Update wallet withdrawable balance
      const newWithdrawableBalance = withdrawableBalance - amount;
      await supabase
        .from("user_wallets")
        .update({
          withdrawable_balance: newWithdrawableBalance,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      alert(
        "Withdrawal request submitted successfully! Your funds will be processed within 24-48 hours."
      );
      router.push("/wallet");
    } catch (error: any) {
      console.error("Withdrawal error:", error);
      alert("Failed to submit withdrawal: " + error.message);
    } finally {
      setSubmitting(false);
    }
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

  const selectedCurrencyData = currencies.find((c) => c.code === selectedCurrency);

  return (
    <div className="flex flex-col min-h-screen bg-offwhite">
      <Header />
      <main className="flex-grow py-12 px-4">
        <div className="container-custom max-w-3xl mx-auto">
          <h1 className="text-h1 text-navy mb-4 font-serif">Withdraw Funds</h1>
          <p className="text-charcoal mb-8">
            Request a withdrawal to your crypto wallet. Processing time: 24-48 hours.
          </p>

          {/* Withdrawable Balance Banner */}
          <div className="bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg p-6 mb-8 shadow-lg">
            <p className="text-sm opacity-90 mb-1">Withdrawable Balance</p>
            <p className="text-4xl font-bold">
              {formatCurrency(Number(wallet?.withdrawable_balance || 0), i18n.language)}
            </p>
            <p className="text-xs opacity-75 mt-1">Available for withdrawal</p>
          </div>

          <Card>
            {/* Amount */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-charcoal mb-2">
                Withdrawal Amount (USD)
              </label>
              <input
                type="number"
                min="10"
                max={Number(wallet?.withdrawable_balance || 0)}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy text-lg"
              />
              <p className="text-xs text-charcoal mt-2">
                Minimum: $10 | Maximum: {formatCurrency(Number(wallet?.withdrawable_balance || 0), i18n.language)}
              </p>
            </div>

            {/* Currency Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-charcoal mb-2">
                Select Cryptocurrency
              </label>
              <select
                value={selectedCurrency}
                onChange={(e) => {
                  setSelectedCurrency(e.target.value);
                  setSelectedNetwork("");
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.name} ({currency.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Network Selection */}
            {selectedCurrencyData && selectedCurrencyData.networks.length > 1 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Select Network
                </label>
                <select
                  value={selectedNetwork}
                  onChange={(e) => setSelectedNetwork(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                >
                  <option value="">-- Select Network --</option>
                  {selectedCurrencyData.networks.map((network) => (
                    <option key={network} value={network}>
                      {network}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-red-600 mt-2">
                  ⚠️ Important: Select the correct network or you may lose your funds!
                </p>
              </div>
            )}

            {selectedCurrencyData && selectedCurrencyData.networks.length === 1 && (
              <input type="hidden" value={selectedCurrencyData.networks[0]} />
            )}

            {/* Wallet Address */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-charcoal mb-2">
                Your {selectedCurrency} Wallet Address
              </label>
              <input
                type="text"
                value={userWalletAddress}
                onChange={(e) => setUserWalletAddress(e.target.value)}
                placeholder={`Enter your ${selectedCurrency} address`}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy font-mono text-sm"
              />
              <p className="text-xs text-red-600 mt-2">
                ⚠️ Double-check your address! Incorrect addresses cannot be recovered.
              </p>
            </div>

            {/* Fee Info */}
            {withdrawAmount && parseFloat(withdrawAmount) >= 10 && (
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-300">
                <h3 className="font-semibold text-navy mb-2">Withdrawal Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-charcoal">Requested Amount:</span>
                    <span className="font-semibold text-navy">
                      {formatCurrency(parseFloat(withdrawAmount), i18n.language)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal">Processing Fee (5%):</span>
                    <span className="font-semibold text-red-600">
                      -{formatCurrency(parseFloat(withdrawAmount) * 0.05, i18n.language)}
                    </span>
                  </div>
                  <div className="border-t border-yellow-400 pt-2 flex justify-between">
                    <span className="font-semibold text-navy">You will receive:</span>
                    <span className="font-bold text-green-600 text-lg">
                      {formatCurrency(parseFloat(withdrawAmount) * 0.95, i18n.language)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmitWithdrawal}
              disabled={
                submitting ||
                !withdrawAmount ||
                !userWalletAddress ||
                parseFloat(withdrawAmount) < 10 ||
                parseFloat(withdrawAmount) > Number(wallet?.withdrawable_balance || 0) ||
                (selectedCurrencyData &&
                  selectedCurrencyData.networks.length > 1 &&
                  !selectedNetwork)
              }
              className="w-full bg-navy text-white py-4 rounded-lg hover:bg-opacity-90 transition font-semibold text-lg disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Withdrawal Request"}
            </button>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-charcoal">
                <strong>Processing Time:</strong> Withdrawals are processed within 24-48 hours.
                You will receive an email notification once completed.
              </p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}