import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-offwhite">
      <Header />
      <main className="flex-grow py-12 px-4">
        <div className="container-custom">
          <h1 className="text-h1 text-navy mb-8 font-serif">Terms of Service</h1>
          <Card>
            <p className="text-charcoal mb-6">
              This is a placeholder for the Terms of Service. Please consult with legal counsel to
              draft comprehensive terms of service that comply with applicable regulations in your
              jurisdiction.
            </p>
            <h2 className="text-h3 text-navy mt-8 mb-4 font-serif">
              Key Sections to Include
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-charcoal">
              <li>Acceptance of Terms</li>
              <li>Description of Service</li>
              <li>User Eligibility and Registration</li>
              <li>Investment Risks and Disclaimers</li>
              <li>User Obligations</li>
              <li>Intellectual Property</li>
              <li>Limitation of Liability</li>
              <li>Governing Law and Jurisdiction</li>
              <li>Modifications to Terms</li>
              <li>Contact Information</li>
            </ul>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
