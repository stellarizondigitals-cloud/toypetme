import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { usePageMeta } from "@/lib/usePageMeta";

export default function RefundPolicy() {
  usePageMeta({
    title: "Refund Policy",
    description: "ToyPetMe refund policy for Premium and coin pack purchases. 14-day money-back guarantee.",
    canonicalPath: "/refund-policy",
  });

  const company = "Stellarizon Digitals";
  const contact = "legal@stellarizondigitals.com";
  const updated = "April 26, 2026";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" size="default" className="gap-2 mb-6" data-testid="button-back">
            <ArrowLeft size={16} />
            Back to Game
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>Refund Policy</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: {updated} · Operated by {company}</p>

        <div className="space-y-8 text-foreground">

          <section>
            <h2 className="text-xl font-semibold mb-3">1. Our Commitment</h2>
            <p className="text-muted-foreground leading-relaxed">
              {company} stands behind every purchase made on ToyPetMe. We want you to be satisfied. If you're not, we'll make it right.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. 14-Day Money-Back Guarantee</h2>
            <p className="text-muted-foreground leading-relaxed">
              You are entitled to a full refund within <strong>14 days</strong> of any purchase, with no questions asked. This applies to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2 ml-2">
              <li>ToyPetMe Premium (£0.99 one-time unlock)</li>
              <li>Any Coin Pack (500, 1,500, or 5,000 coins)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              To request a refund, email us at{" "}
              <a href={`mailto:${contact}`} className="underline text-foreground">{contact}</a>{" "}
              with your Stripe payment receipt (sent to your email automatically after purchase). We will process your refund within 5–10 business days to your original payment method.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Eligibility</h2>
            <p className="text-muted-foreground leading-relaxed">
              Refunds are available for purchases made within the past 14 days. Requests made after 14 days will be considered on a case-by-case basis. We may decline refund requests that show clear signs of abuse (e.g. repeatedly purchasing and requesting refunds).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Digital Goods Notice</h2>
            <p className="text-muted-foreground leading-relaxed">
              ToyPetMe Premium and Coin Packs are digital goods that are delivered instantly and stored in your browser's local storage. Under the UK Consumer Rights Act 2015 and EU Consumer Rights Directive, you have a right of withdrawal within 14 days. By requesting that delivery begin immediately, you acknowledge that your right of withdrawal may be limited once the digital content has been accessed — however, we waive this limitation and honour all refund requests within 14 days regardless.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Browser Storage Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              Premium status and coins are stored in your browser's localStorage and are not tied to a user account. If you clear your browser data, your purchase data will be lost. We are not responsible for lost progress due to browser data clearing. If this happens, contact us with your receipt and we may re-issue your purchase at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. How to Request a Refund</h2>
            <ol className="list-decimal list-inside text-muted-foreground space-y-2 ml-2">
              <li>Locate your Stripe receipt email (sent to the email you provided at checkout)</li>
              <li>Email <a href={`mailto:${contact}`} className="underline text-foreground">{contact}</a> with your receipt</li>
              <li>Include "Refund Request" in the subject line</li>
              <li>We'll confirm the refund within 1–2 business days and process it within 5–10 business days</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Questions? Email us at{" "}
              <a href={`mailto:${contact}`} className="underline text-foreground">{contact}</a>.
              We typically respond within one business day.
            </p>
          </section>

          <div className="border-t pt-6">
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
              <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link>
              <Link href="/shop" className="underline hover:text-foreground">Shop</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
