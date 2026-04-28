import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { usePageMeta } from "@/lib/usePageMeta";

export default function PrivacyPolicy() {
  usePageMeta({
    title: "Privacy Policy",
    description: "ToyPetMe Privacy Policy — how we handle your data, cookies, Google AdSense, GDPR and CCPA rights. Operated by Stellarizon Digitals.",
    canonicalPath: "/privacy",
  });

  const updated = "April 26, 2026";
  const company = "Stellarizon Digitals";
  const contact = "legal@stellarizondigitals.com";
  const site = "ToyPetMe";
  const siteUrl = "https://toypetme.com";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" size="default" className="gap-2 mb-6">
            <ArrowLeft size={16} />
            Back to Game
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: {updated}</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">

          <section>
            <h2 className="text-xl font-semibold mb-2">1. Who We Are</h2>
            <p className="text-muted-foreground leading-relaxed">
              {site} (<a href={siteUrl} className="text-primary hover:underline">{siteUrl}</a>) is operated by <strong>{company}</strong> ("we", "our", or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we handle information when you use {site}.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Contact: <a href={`mailto:${contact}`} className="text-primary hover:underline">{contact}</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed"><strong>Game data (stored locally):</strong> {site} saves your game progress — pet names, levels, achievements, high scores — directly in your browser's localStorage. This data never leaves your device and is not transmitted to our servers.</p>
            <p className="text-muted-foreground leading-relaxed mt-2"><strong>Payment data:</strong> If you make a purchase (Premium or Coin Packs), payment is processed securely by <strong>Stripe, Inc.</strong> We do not store your card details. Stripe collects your name, email, and payment information in accordance with their <a href="https://stripe.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>. We receive confirmation of payment and your email address for receipt purposes only. We retain purchase records for up to 7 years for legal and accounting purposes.</p>
            <p className="text-muted-foreground leading-relaxed mt-2"><strong>Usage data via third-party ads:</strong> We use Google AdSense to display advertisements (shown only to non-Premium users). Google may collect data through cookies and similar technologies to serve personalised or contextual ads. We do not control this data collection.</p>
            <p className="text-muted-foreground leading-relaxed mt-2"><strong>Analytics (if applicable):</strong> We may use Google Analytics to understand how players use the game. This may involve collecting anonymised usage data.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">We use cookies and similar tracking technologies solely through our third-party advertising partner, Google AdSense. These cookies allow Google to serve ads based on your prior visits to our site and other sites on the internet.</p>
            <p className="text-muted-foreground leading-relaxed mt-2">You can opt out of personalised advertising by visiting <a href="https://www.google.com/settings/ads" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Ad Settings</a>. You can also opt out via the <a href="https://optout.networkadvertising.org" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">NAI opt-out page</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. How We Use Information</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>To provide and improve the {site} game experience</li>
              <li>To display relevant advertisements through Google AdSense</li>
              <li>To analyse how the game is used (aggregated, anonymous data only)</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">We do not sell, rent, or share your personal information with third parties except as required by law. Advertising data collected by Google AdSense is governed by <a href="https://policies.google.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google's Privacy Policy</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">{site} is a general audience game. We do not knowingly collect personal information from children under 13. If you believe a child has submitted personal information, please contact us at {contact} and we will promptly delete it.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Your Rights (GDPR / CCPA)</h2>
            <p className="text-muted-foreground leading-relaxed">If you are in the European Economic Area or California, you have rights including: the right to access, correct, or delete any personal data we hold about you; the right to object to processing; and the right to data portability.</p>
            <p className="text-muted-foreground leading-relaxed mt-2">Since all game data is stored in your browser, you can delete it at any time by clearing your browser's localStorage or site data. For advertising-related data requests, contact Google directly.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">Game data is stored locally in your browser until you clear it. We do not retain personal data on our servers.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">9. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date. Continued use of {site} after changes constitutes acceptance of the new policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">10. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">If you have any questions about this Privacy Policy, please contact us at:</p>
            <div className="mt-2 p-4 bg-muted rounded-lg">
              <p className="font-semibold">{company}</p>
              <p className="text-muted-foreground">Website: <a href="https://stellarizondigitals.com" className="text-primary hover:underline">stellarizondigitals.com</a></p>
              <p className="text-muted-foreground">Email: <a href={`mailto:${contact}`} className="text-primary hover:underline">{contact}</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
