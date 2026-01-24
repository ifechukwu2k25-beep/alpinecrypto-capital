import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/home/Hero";
import { InvestmentApproach } from "@/components/home/InvestmentApproach";
import { RiskManagement } from "@/components/home/RiskManagement";
import { Transparency } from "@/components/home/Transparency";
import { RegulatoryDisclosures } from "@/components/home/RegulatoryDisclosures";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
        <InvestmentApproach />
        <RiskManagement />
        <Transparency />
        <RegulatoryDisclosures />
      </main>
      <Footer />
    </div>
  );
}
