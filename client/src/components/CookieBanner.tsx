import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { X } from "lucide-react";

const COOKIE_KEY = "toypetme_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      setTimeout(() => setVisible(true), 1200);
    }
  }, []);

  function accept() {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(COOKIE_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-16 left-0 right-0 z-50 px-3 pb-2"
      data-testid="cookie-banner"
    >
      <div className="max-w-lg mx-auto bg-card border border-border rounded-lg shadow-lg p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-foreground font-medium">We use cookies</p>
          <button
            onClick={decline}
            className="text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Close cookie banner"
            data-testid="button-cookie-close"
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          ToyPetMe uses Google AdSense cookies to show relevant ads and help keep the game free. Your game data stays in your browser only.{" "}
          <Link href="/privacy" className="underline hover:text-foreground">Learn more</Link>.
        </p>
        <div className="flex gap-2">
          <Button size="sm" onClick={accept} className="flex-1" data-testid="button-cookie-accept">
            Accept All
          </Button>
          <Button size="sm" variant="outline" onClick={decline} className="flex-1" data-testid="button-cookie-decline">
            Decline
          </Button>
        </div>
      </div>
    </div>
  );
}
