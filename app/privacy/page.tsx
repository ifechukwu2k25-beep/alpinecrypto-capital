import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-offwhite">
      <Header />
      <main className="flex-grow py-12 px-4">
        <div className="container-custom">
          <h1 className="text-h1 text-navy mb-8 font-serif">Privacy Policy</h1>
          <Card>
            <p className="text-charcoal mb-6">
              This is a placeholder for the Privacy Policy. Please consult with legal counsel to
              draft a comprehensive privacy policy that complies with GDPR, applicable regional
              privacy laws, and platform requirements.
            </p>
            <h2 className="text-h3 text-navy mt-8 mb-4 font-serif">
              Key Sections to Include
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-charcoal">
              <li>Information We Collect</li>
              <li>How We Use Your Information</li>
              <li>Data Sharing and Disclosure</li>
              <li>Data Security</li>
              <li>Your Rights (GDPR, etc.)</li>
              <li>Cookies and Tracking Technologies</li>
              <li>International Data Transfers</li>
              <li>Data Retention</li>
              <li>Children&apos;s Privacy</li>
              <li>Changes to Privacy Policy</li>
              <li>Contact Information</li>
            </ul>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
