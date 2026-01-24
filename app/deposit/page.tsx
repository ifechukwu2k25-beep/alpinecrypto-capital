"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useI18n } from "@/lib/i18n/client";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";

type WalletAddress = {
  id: string;
  currency: string;
  wallet_address: string;
  network: string | null;
};

export default function DepositPage() {
  const { i18n } = useI18n();
  const router = useRouter();
  const [wallets, setWallets] = useState<WalletAddress[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");
  const [selectedWallet, setSelectedWallet] = useState<WalletAddress | null>(null);
  const [amount, setAmount] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push("/auth/login");
      return;
    }

    setUser(user);

    const { data: walletsData } = await supabase
      .from("wallet_addresses")
      .select("*")
      .eq("is_active", true)
      .order("currency");

    if (walletsData) {
      setWallets(walletsData);
    }

    setLoading(false);
  };

  const handleCurrencySelect = (currency: string) => {
    setSelectedCurrency(currency);
    const wallet = wallets.find(w => w.currency === currency);
    setSelectedWallet(wallet || null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };

  const uploadProof = async (file: File): Promise<string | null> => {
    const fileName = `${user.id}/${Date.now()}_${file.name}`;
    
    const { data, error } = await supabase.storage
      .from("payment-proofs")
      .upload(fileName, file);

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("payment-proofs")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleSubmitDeposit = async () => {
    if (!selectedWallet || !amount || !user) {
      alert("Please fill all required fields");
      return;
    }

    setUploading(true);

    let proofUrl = null;
    if (proofFile) {
      proofUrl = await uploadProof(proofFile);
      if (!proofUrl) {
        alert("Failed to upload proof. Please try again.");
        setUploading(false);
        return;
      }
    }

    const { error: depositError } = await supabase.from("deposits").insert({
      user_id: user.id,
      amount: parseFloat(amount),
      currency: selectedCurrency,
      wallet_address: selectedWallet.wallet_address,
      transaction_hash: transactionHash || null,
      proof_url: proofUrl,
      status: "pending",
    });

    if (depositError) {
      alert("Failed to submit deposit: " + depositError.message);
      setUploading(false);
      return;
    }

    // Create pending transaction record
    await supabase.from("user_transactions").insert({
      user_id: user.id,
      transaction_type: "deposit",
      amount: parseFloat(amount),
      status: "pending",
      description: `Crypto deposit - ${selectedCurrency}`,
    });

    setUploading(false);
    alert("Deposit request submitted! We'll confirm once payment is verified.");
    router.push("/dashboard");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Wallet address copied to clipboard!");
  };

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

  const currencies = [...new Set(wallets.map(w => w.currency))];

  return (
    <div className="flex flex-col min-h-screen bg-offwhite">
      <Header />
      <main className="flex-grow py-12 px-4">
        <div className="container-custom max-w-4xl mx-auto">
          <h1 className="text-h1 text-navy mb-4 font-serif">
            Deposit Funds
          </h1>
          <p className="text-charcoal mb-8">
            Fund your account using cryptocurrency
          </p>

          {/* Step 1: Select Currency */}
          <Card className="mb-6">
            <h2 className="text-h3 text-navy mb-4 font-serif">
              Step 1: Select Currency
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {currencies.map((currency) => (
                <button
                  key={currency}
                  onClick={() => handleCurrencySelect(currency)}
                  className={`p-4 border-2 rounded-lg transition ${
                    selectedCurrency === currency
                      ? "border-navy bg-navy text-white"
                      : "border-gray-300 hover:border-navy"
                  }`}
                >
                  <div className="text-xl font-bold">{currency}</div>
                  <div className="text-sm">
                    {wallets.filter(w => w.currency === currency).length} network(s)
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Step 2: Select Network (if multiple) */}
          {selectedCurrency && (
            <Card className="mb-6">
              <h2 className="text-h3 text-navy mb-4 font-serif">
                Step 2: Select Network
              </h2>
              <div className="space-y-3">
                {wallets
                  .filter(w => w.currency === selectedCurrency)
                  .map((wallet) => (
                    <button
                      key={wallet.id}
                      onClick={() => setSelectedWallet(wallet)}
                      className={`w-full p-4 border-2 rounded-lg text-left transition ${
                        selectedWallet?.id === wallet.id
                          ? "border-navy bg-blue-50"
                          : "border-gray-300 hover:border-navy"
                      }`}
                    >
                      <div className="font-semibold text-navy">
                        {wallet.network || "Default Network"}
                      </div>
                    </button>
                  ))}
              </div>
            </Card>
          )}

          {/* Step 3: Wallet Address */}
          {selectedWallet && (
            <Card className="mb-6">
              <h2 className="text-h3 text-navy mb-4 font-serif">
                Step 3: Send {selectedCurrency} to This Address
              </h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800 mb-2">
                  ⚠️ Important: Only send {selectedCurrency} on {selectedWallet.network} network!
                </p>
                <p className="text-xs text-yellow-700">
                  Sending other currencies or using wrong network will result in loss of funds.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <label className="text-sm text-charcoal mb-2 block">
                  Wallet Address:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedWallet.wallet_address}
                    readOnly
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white"
                  />
                  <button
                    onClick={() => copyToClipboard(selectedWallet.wallet_address)}
                    className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-opacity-90"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* QR Code Placeholder */}
              <div className="bg-white border border-gray-300 rounded-lg p-4 text-center">
                <p className="text-sm text-charcoal mb-2">QR Code:</p>
                <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">QR Code Here</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Scan with your wallet app
                </p>
              </div>
            </Card>
          )}

          {/* Step 4: Submit Proof */}
          {selectedWallet && (
            <Card>
              <h2 className="text-h3 text-navy mb-4 font-serif">
                Step 4: Submit Payment Proof
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Amount Deposited (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Transaction Hash (Optional)
                  </label>
                  <input
                    type="text"
                    value={transactionHash}
                    onChange={(e) => setTransactionHash(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                    placeholder="Enter blockchain transaction hash"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Payment Proof (Screenshot)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                  {proofFile && (
                    <p className="text-sm text-green-600 mt-2">
                      Selected: {proofFile.name}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleSubmitDeposit}
                  disabled={uploading || !amount}
                  className="w-full bg-navy text-white py-3 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50"
                >
                  {uploading ? "Submitting..." : "Submit Deposit Request"}
                </button>
              </div>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}