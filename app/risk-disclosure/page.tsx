import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RiskDisclosureContent } from "@/components/compliance/RiskDisclosureContent";

export default function RiskDisclosurePage() {
  return (
    <div className="flex flex-col min-h-screen bg-offwhite">
      <Header />
      <main className="flex-grow py-12 px-4">
        <div className="container-custom">
          <RiskDisclosureContent />
        </div>
      </main>
      <Footer />
    </div>
  );
}
