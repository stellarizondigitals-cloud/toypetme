import { useEffect, useState } from "react";
import { Link, useSearch } from "wouter";
import { CheckCircle2, Coins, Crown, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePageMeta } from "@/lib/usePageMeta";

const PREMIUM_KEY = "toypetme_premium";
const GAME_STATE_KEY = "toypetme_v2";

type Status = "verifying" | "success" | "error";

export default function CheckoutSuccess() {
  usePageMeta({
    title: "Purchase Complete",
    description: "Your ToyPetMe purchase was successful.",
  });

  const search = useSearch();
  const params = new URLSearchParams(search);
  const sessionId = params.get("session_id");
  const productType = params.get("type") ?? "";

  const [status, setStatus] = useState<Status>("verifying");
  const [coinsAdded, setCoinsAdded] = useState(0);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.paid) {
          setStatus("error");
          return;
        }

        if (productType === "premium") {
          localStorage.setItem(PREMIUM_KEY, "1");
          setIsPremium(true);
        } else if (productType.startsWith("coins_")) {
          const coins = parseInt(productType.replace("coins_", ""), 10) || 0;
          if (coins > 0) {
            try {
              const raw = localStorage.getItem(GAME_STATE_KEY);
              if (raw) {
                const state = JSON.parse(raw);
                state.coins = Math.min((state.coins ?? 0) + coins, 999999);
                localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
              }
            } catch {
              // silently ignore parse errors
            }
            setCoinsAdded(coins);
          }
        }
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, [sessionId, productType]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center text-center gap-4 py-10 px-6">
          {status === "verifying" && (
            <>
              <Loader2 size={48} className="animate-spin text-muted-foreground" />
              <h1 className="text-xl font-bold">Confirming your purchase…</h1>
              <p className="text-sm text-muted-foreground">Just a moment while we verify your payment.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <h1 className="text-2xl font-bold">Payment confirmed!</h1>

              {isPremium && (
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <Crown size={18} className="text-yellow-500" />
                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">Premium unlocked</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your premium perks are now active in your browser. Enjoy the ad-free experience and exclusive cosmetics!
                  </p>
                </div>
              )}

              {coinsAdded > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <Coins size={18} className="text-amber-500" />
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      +{coinsAdded.toLocaleString()} coins added!
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your coins have been added to your wallet. Go spend them in the game!
                  </p>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                A receipt has been sent to your email by Stripe. If you have any issues, contact{" "}
                <a href="mailto:legal@stellarizondigitals.com" className="underline">legal@stellarizondigitals.com</a>.
              </p>

              <Link href="/">
                <Button className="w-full" data-testid="button-back-to-game">
                  Back to Game
                </Button>
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-4">
                <AlertCircle size={40} className="text-red-500" />
              </div>
              <h1 className="text-xl font-bold">Something went wrong</h1>
              <p className="text-sm text-muted-foreground">
                We couldn't verify your payment. If you were charged, please contact{" "}
                <a href="mailto:legal@stellarizondigitals.com" className="underline">legal@stellarizondigitals.com</a>{" "}
                and we'll sort it out promptly.
              </p>
              <div className="flex gap-3 w-full">
                <Link href="/shop" className="flex-1">
                  <Button variant="outline" className="w-full" data-testid="button-try-again">Try Again</Button>
                </Link>
                <Link href="/" className="flex-1">
                  <Button className="w-full" data-testid="button-back-home">Back Home</Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
