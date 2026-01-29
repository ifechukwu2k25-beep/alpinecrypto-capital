"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useI18n } from "@/lib/i18n/client";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

export default function DepositPage() {
  const { i18n } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [walletAddresses, setWalletAddresses] = useState<any[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<any>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [uploading, setUploading] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadWalletAddresses();
  }, []);

  const loadWalletAddresses = async () => {
    const { data } = await supabase
      .from("wallet_addresses")
      .select("*")
      .eq("is_active", true)
      .order("currency");

    if (data) {
      setWalletAddresses(data);
    }
    setLoading(false);
  };

  const handleSelectCurrency = (wallet: any) => {
    setSelectedCurrency(wallet);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };

  const handleSubmitDeposit = async () => {
    if (!selectedCurrency || !depositAmount || !paymentProof) {
      alert("Please fill all required fields and upload payment proof!");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    setUploading(true);

    try {
      // Upload payment proof to storage
      const fileExt = paymentProof.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(fileName, paymentProof);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("payment-proofs").getPublicUrl(fileName);

      // Create deposit record
      const { error: depositError } = await supabase.from("deposits").insert({
        user_id: user.id,
        amount: parseFloat(depositAmount),
        currency: selectedCurrency.currency,
        wallet_address: selectedCurrency.wallet_address,
        proof_url: publicUrl,
        status: "pending",
      });

      if (depositError) throw depositError;

      // Create wallet transaction
      await supabase.from("wallet_transactions").insert({
        user_id: user.id,
        transaction_type: "deposit",
        amount: parseFloat(depositAmount),
        status: "pending",
        description: `Deposit via ${selectedCurrency.currency} - ${selectedCurrency.network}`,
      });

      alert(
        "Deposit request submitted successfully! Your deposit will be credited after admin confirmation."
      );
      router.push("/wallet");
    } catch (error: any) {
      console.error("Deposit error:", error);
      alert("Failed to submit deposit: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Address copied to clipboard!");
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
        <div className="container-custom max-w-4xl mx-auto">
          <h1 className="text-h1 text-navy mb-4 font-serif">Deposit Funds</h1>
          <p className="text-charcoal mb-8">
            Choose your preferred cryptocurrency and follow the instructions to deposit funds.
          </p>

          {!selectedCurrency ? (
            <>
              <h2 className="text-h3 text-navy mb-4 font-serif">Select Payment Method</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {walletAddresses.map((wallet) => (
                  <Card
                    key={wallet.id}
                    className="cursor-pointer hover:shadow-xl transition border-2 border-transparent hover:border-navy"
                    onClick={() => handleSelectCurrency(wallet)}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">
                        {wallet.currency === "BTC" && "₿"}
                        {wallet.currency === "ETH" && "Ξ"}
                        {wallet.currency === "USDT" && "₮"}
                        {wallet.currency === "USDC" && "Ⓤ"}
                        {wallet.currency === "XRP" && "✕"}
                        {wallet.currency === "SOL" && "◎"}
                        {wallet.currency === "BNB" && "Ⓑ"}
                      </div>
                      <h3 className="text-xl font-bold text-navy mb-1">{wallet.currency}</h3>
                      <p className="text-sm text-charcoal">{wallet.network}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card>
              <div className="mb-6">
                <button
                  onClick={() => setSelectedCurrency(null)}
                  className="text-navy hover:underline text-sm mb-4"
                >
                  ← Change Payment Method
                </button>
                <h2 className="text-h3 text-navy mb-2 font-serif">
                  Deposit via {selectedCurrency.currency}
                </h2>
                <p className="text-sm text-charcoal">Network: {selectedCurrency.network}</p>
              </div>

              {/* Step 1: Enter Amount */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-navy mb-3">Step 1: Enter Amount</h3>
                <input
                  type="number"
                  min="10"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Enter amount in USD"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy text-lg"
                />
                <p className="text-xs text-charcoal mt-2">Minimum deposit: $10</p>
              </div>

              {/* Step 2: Send Payment */}
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-navy mb-3">Step 2: Send Payment</h3>
                <p className="text-sm text-charcoal mb-3">
                  Send exactly the amount you entered to this address:
                </p>
                <div className="bg-white p-4 rounded-lg border border-gray-300 mb-3">
                  <p className="text-xs text-charcoal mb-1">
                    {selectedCurrency.currency} Address:
                  </p>
                  <p className="font-mono text-sm break-all text-navy font-semibold">
                    {selectedCurrency.wallet_address}
                  </p>
                  <button
                    onClick={() => copyToClipboard(selectedCurrency.wallet_address)}
                    className="mt-2 text-navy hover:underline text-sm"
                  >
                    📋 Copy Address
                  </button>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-300">
                  <p className="text-xs text-yellow-800">
                    ⚠️ <strong>Important:</strong> Only send {selectedCurrency.currency} on{" "}
                    {selectedCurrency.network} network. Sending on wrong network will result in loss
                    of funds!
                  </p>
                </div>
              </div>

              {/* Step 3: Upload Proof */}
              <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-navy mb-3">Step 3: Upload Payment Proof</h3>
                <p className="text-sm text-charcoal mb-3">
                  Upload a screenshot of your transaction or transaction hash.
                </p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                />
                {paymentProof && (
                  <p className="text-sm text-green-600 mt-2">✓ File selected: {paymentProof.name}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitDeposit}
                disabled={uploading || !depositAmount || !paymentProof}
                className="w-full bg-navy text-white py-4 rounded-lg hover:bg-opacity-90 transition font-semibold text-lg disabled:opacity-50"
              >
                {uploading ? "Submitting..." : "Submit Deposit Request"}
              </button>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-charcoal">
                  <strong>Processing Time:</strong> Deposits are usually processed within 10-30 minutes
                  after confirmation. You will receive a notification once credited.
                </p>
              </div>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}