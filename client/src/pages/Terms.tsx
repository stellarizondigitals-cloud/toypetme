import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { usePageMeta } from "@/lib/usePageMeta";

export default function Terms() {
  const updated = "April 26, 2026";
  const company = "Stellarizon Digitals";
  const contact = "legal@stellarizondigitals.com";
  const site = "ToyPetMe";

  usePageMeta({
    title: "Terms of Service",
    description: "ToyPetMe Terms of Service — rules, in-app purchases, refund rights, and legal information.",
    canonicalPath: "/terms",
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" size="default" className="gap-2 mb-6" data-testid="button-back">
            <ArrowLeft size={16} />
            Back to Game
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>Terms of Service</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: {updated} · {company}</p>

        <div className="space-y-6 text-foreground">

          <section>
            <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">By accessing or using {site}, you agree to be bound by these Terms of Service. If you do not agree, please do not use the game. {site} is operated by <strong>{company}</strong>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Use of the Service</h2>
            <p className="text-muted-foreground leading-relaxed">{site} is a free-to-play browser game with optional paid enhancements. You may use it for personal, non-commercial entertainment. You agree not to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
              <li>Attempt to exploit, hack, or disrupt the game</li>
              <li>Use automated bots or scripts to interact with the game</li>
              <li>Reproduce, distribute, or create derivative works without permission</li>
              <li>Use the game in any way that violates applicable laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. In-App Purchases</h2>
            <p className="text-muted-foreground leading-relaxed">
              {site} offers optional paid content including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
              <li><strong>ToyPetMe Premium</strong> (£0.99) — a one-time purchase that removes ads, unlocks exclusive cosmetics, and doubles daily coin bonuses.</li>
              <li><strong>Coin Packs</strong> (£0.99 – £4.99) — virtual coins used to purchase in-game items such as food, toys, and cosmetics.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              All purchases are processed securely by Stripe. You must be 18 or over (or have a parent/guardian's permission) to make a purchase. Prices include VAT where applicable. Virtual items have no real-world monetary value and cannot be transferred or resold.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Digital purchases are stored in your browser's localStorage and are not linked to an account. {company} is not responsible for data lost due to browser data clearing. Contact us at <a href={`mailto:${contact}`} className="underline text-foreground">{contact}</a> if you lose purchased content and we may re-issue it at our discretion upon proof of purchase.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Refunds</h2>
            <p className="text-muted-foreground leading-relaxed">
              You have a right to a full refund within <strong>14 days</strong> of any purchase. No questions asked. To request a refund, email <a href={`mailto:${contact}`} className="underline text-foreground">{contact}</a> with your Stripe receipt. See our full <Link href="/refund-policy" className="underline text-foreground">Refund Policy</Link> for details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Game Data and Progress</h2>
            <p className="text-muted-foreground leading-relaxed">Your game progress is saved in your browser's localStorage. {company} is not responsible for loss of game data due to browser clearing, device changes, or other factors. No account or login is required to play.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Advertising</h2>
            <p className="text-muted-foreground leading-relaxed">{site} is supported by advertising provided by Google AdSense. Ads are served by Google and are subject to Google's terms. Purchasing Premium removes ads from your session. We are not responsible for the content of third-party advertisements.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">All content, graphics, code, and design of {site} are the property of {company} or its licensors. You may not copy, reproduce, or distribute any part of {site} without prior written permission.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">{site} is provided "as is" without warranties of any kind. We do not guarantee uninterrupted, error-free service. We reserve the right to modify, suspend, or discontinue the game at any time without notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">9. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">To the fullest extent permitted by law, {company} shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of {site}. Our total liability for any claim arising from a purchase shall not exceed the amount you paid.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">10. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">We reserve the right to modify these Terms at any time. Continued use of {site} after changes constitutes acceptance of the revised Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">11. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">12. Contact</h2>
            <div className="mt-2 p-4 bg-muted rounded-lg">
              <p className="font-semibold">{company}</p>
              <p className="text-muted-foreground">Website: <a href="https://stellarizondigitals.com" className="underline text-foreground hover:opacity-80">stellarizondigitals.com</a></p>
              <p className="text-muted-foreground">Email: <a href={`mailto:${contact}`} className="underline text-foreground hover:opacity-80">{contact}</a></p>
            </div>
          </section>

          <div className="border-t pt-4">
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
              <Link href="/refund-policy" className="underline hover:text-foreground">Refund Policy</Link>
              <Link href="/shop" className="underline hover:text-foreground">Shop</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
