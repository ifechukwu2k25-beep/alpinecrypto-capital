"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";

// This 'export default' is what was missing!
export default function AllocationPage() {
  return (
    <div className="flex flex-col min-h-screen bg-offwhite">
      <Header />
      <main className="flex-grow py-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold text-navy mb-4">Capital Allocation</h1>
          <p className="text-charcoal mb-8">
            Manage your digital asset distribution and portfolio strategy.
          </p>
          
          <Card className="p-12 border-dashed border-2 border-gray-200">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h2 className="text-xl font-bold text-navy mb-2">No Active Allocations</h2>
              <p className="text-gray-500 max-w-sm mx-auto mb-6">
                You haven&apos;t allocated any capital yet. Start by selecting an investment plan to grow your wealth.
              </p>
              <a 
                href="/invest" 
                className="bg-navy text-white px-8 py-3 rounded-full font-bold hover:bg-amber-500 transition-all"
              >
                View Investment Plans
              </a>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}