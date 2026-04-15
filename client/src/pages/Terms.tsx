import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  const updated = "April 15, 2025";
  const company = "Stellarizon Digitals";
  const contact = "legal@stellarizondigitals.com";
  const site = "ToyPetMe";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" size="default" className="gap-2 mb-6">
            <ArrowLeft size={16} />
            Back to Game
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>Terms of Service</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: {updated}</p>

        <div className="space-y-6 text-foreground">

          <section>
            <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">By accessing or using {site}, you agree to be bound by these Terms of Service. If you do not agree, please do not use the game. {site} is operated by <strong>{company}</strong>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Use of the Service</h2>
            <p className="text-muted-foreground leading-relaxed">{site} is a free-to-play browser game. You may use it for personal, non-commercial entertainment. You agree not to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
              <li>Attempt to exploit, hack, or disrupt the game</li>
              <li>Use automated bots or scripts to interact with the game</li>
              <li>Reproduce, distribute, or create derivative works without permission</li>
              <li>Use the game in any way that violates applicable laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Game Data and Progress</h2>
            <p className="text-muted-foreground leading-relaxed">Your game progress is saved in your browser's localStorage. {company} is not responsible for loss of game data due to browser clearing, device changes, or other factors. No account or login is required to play.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Advertising</h2>
            <p className="text-muted-foreground leading-relaxed">{site} is supported by advertising provided by Google AdSense. Ads are served by Google and are subject to Google's terms. We are not responsible for the content of third-party advertisements.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">All content, graphics, code, and design of {site} are the property of {company} or its licensors. You may not copy, reproduce, or distribute any part of {site} without prior written permission.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">{site} is provided "as is" without warranties of any kind. We do not guarantee uninterrupted, error-free service. We reserve the right to modify, suspend, or discontinue the game at any time without notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">To the fullest extent permitted by law, {company} shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of {site}.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">We reserve the right to modify these Terms at any time. Continued use of {site} after changes constitutes acceptance of the revised Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">9. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">These Terms are governed by the laws applicable to {company}'s place of business. Any disputes shall be resolved in the appropriate courts.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">10. Contact</h2>
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
