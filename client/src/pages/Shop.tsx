import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Star, Coins, Zap, Crown, Lock, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { usePageMeta } from "@/lib/usePageMeta";
import AdSlot, { InContentAd } from "@/components/AdSlot";
import Footer from "@/components/Footer";
import BottomTabNav from "@/components/BottomTabNav";

interface Product {
  id: string;
  name: string;
  description: string;
  metadata: Record<string, string>;
  price_id: string;
  unit_amount: number;
  currency: string;
}

const PREMIUM_PERKS = [
  "Exclusive Premium cosmetics unlocked in Dress Up",
  "Double daily streak coin bonus every day",
  "Gold premium badge displayed on your pet",
  "Bonus XP on every action you take",
  "Priority access to new features and species",
];

const COIN_ICONS: Record<number, { icon: string; label: string; badge?: string }> = {
  99:  { icon: "small", label: "Starter Pack", badge: undefined },
  199: { icon: "medium", label: "Value Pack", badge: "Popular" },
  499: { icon: "large", label: "Ultimate Pack", badge: "Best Value" },
};

export const PREMIUM_KEY = "toypetme_premium";
export const COINS_KEY = "toypetme_v2";

function isPremium(): boolean {
  return localStorage.getItem(PREMIUM_KEY) === "1";
}

export default function Shop() {
  usePageMeta({
    title: "Shop — Premium & Coin Packs",
    description: "Unlock ToyPetMe Premium for £0.99 or grab a coin pack. One-time payment, instant delivery, no subscription.",
    canonicalPath: "/shop",
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [hasPremium, setHasPremium] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setHasPremium(isPremium());
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.data ?? []);
      })
      .catch(() => {
        toast({ title: "Couldn't load shop", description: "Please try again shortly.", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleBuy = async (priceId: string, productType: string) => {
    setPurchasing(priceId);
    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, productType }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error ?? "Failed to start checkout");
      }
    } catch (err: any) {
      toast({ title: "Checkout failed", description: err.message, variant: "destructive" });
    } finally {
      setPurchasing(null);
    }
  };

  const premiumProduct = products.find((p) => p.metadata?.productType === "premium");
  const coinProducts = products.filter((p) => p.metadata?.productType?.startsWith("coins_"));

  const formatPrice = (amount: number, currency: string) => {
    const symbol = currency === "gbp" ? "£" : currency === "usd" ? "$" : "€";
    return `${symbol}${(amount / 100).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black">Shop</h1>
            <p className="text-xs text-muted-foreground">No account needed — pay once, done.</p>
          </div>
        </div>

        <AdSlot format="banner" className="mb-5" />

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-muted-foreground" size={32} />
          </div>
        ) : (
          <>
            {/* ── PREMIUM ── */}
            <div
              className="rounded-xl mb-6 overflow-hidden border-2 border-yellow-400"
              style={{ background: "linear-gradient(135deg,#FFFBEB,#FEF3C7)" }}
            >
              {/* Top banner */}
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{ background: "linear-gradient(90deg,#F59E0B,#EAB308)" }}
              >
                <div className="flex items-center gap-2">
                  <Crown size={20} className="text-white" />
                  <span className="text-white font-black text-lg tracking-tight">ToyPetMe Premium</span>
                </div>
                <div className="bg-white/25 text-white text-xs font-bold px-3 py-1 rounded-full">
                  ONE-TIME · NO SUB
                </div>
              </div>

              <div className="px-5 py-4 space-y-4">
                {/* Big why */}
                <div>
                  <p className="text-sm font-bold text-amber-900 mb-0.5">Why go Premium?</p>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    Pay just <span className="font-black text-base text-amber-900">£0.99</span> once — no subscription,
                    no account, no email. Your upgrade is stored in your browser instantly.
                  </p>
                </div>

                {/* Perks list */}
                <ul className="space-y-2">
                  {PREMIUM_PERKS.map((perk) => (
                    <li key={perk} className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-amber-600 shrink-0" />
                      <span className="text-sm font-semibold text-amber-900">{perk}</span>
                    </li>
                  ))}
                </ul>

                {/* How it works */}
                <div className="bg-amber-100/70 rounded-lg px-4 py-3 space-y-1.5">
                  <p className="text-xs font-black text-amber-900 uppercase tracking-wide">How it works</p>
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-amber-700 w-4 shrink-0">1.</span>
                    <span className="text-xs text-amber-800">Tap "Unlock Premium" below — no account or email required</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-amber-700 w-4 shrink-0">2.</span>
                    <span className="text-xs text-amber-800">Complete a secure £0.99 card payment via Stripe</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-amber-700 w-4 shrink-0">3.</span>
                    <span className="text-xs text-amber-800">You're redirected back and Premium is activated instantly</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-amber-700 w-4 shrink-0">4.</span>
                    <span className="text-xs text-amber-800">All perks active immediately — your browser saves your status</span>
                  </div>
                </div>

                {/* CTA */}
                {hasPremium ? (
                  <div className="flex items-center gap-2 bg-green-100 text-green-700 rounded-lg px-4 py-3 font-semibold text-sm" data-testid="premium-active-msg">
                    <CheckCircle2 size={18} />
                    You already have Premium — enjoy your perks!
                  </div>
                ) : premiumProduct ? (
                  <Button
                    className="w-full text-base font-black py-3"
                    style={{ background: "linear-gradient(90deg,#F59E0B,#EAB308)", color: "#78350F" }}
                    data-testid="button-buy-premium"
                    disabled={purchasing === premiumProduct.price_id}
                    onClick={() => handleBuy(premiumProduct.price_id, "premium")}
                  >
                    {purchasing === premiumProduct.price_id ? (
                      <><Loader2 size={16} className="animate-spin mr-2" />Processing…</>
                    ) : (
                      <><Star size={16} className="mr-2" />Unlock Premium — {formatPrice(premiumProduct.unit_amount, premiumProduct.currency)}</>
                    )}
                  </Button>
                ) : (
                  <Button className="w-full text-base font-bold" disabled data-testid="button-premium-loading">
                    <Lock size={14} className="mr-2" />Loading shop…
                  </Button>
                )}

                <p className="text-[11px] text-amber-700/70 text-center leading-relaxed">
                  Secure payment via Stripe · 14-day refund policy · No account or email needed
                </p>
              </div>
            </div>

            {/* In-content ad between Premium and Coin Packs */}
            <InContentAd format="rectangle" />

            {/* ── COIN PACKS ── */}
            <div className="mb-2">
              <h2 className="font-black text-lg mb-0.5 flex items-center gap-2">
                <Coins size={18} className="text-amber-500" />
                Coin Packs
              </h2>
              <p className="text-sm text-muted-foreground mb-3">
                Coins let you unlock cosmetics in the Dress Up room. No account needed — added instantly to your game.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {coinProducts.length === 0 && (
                <Card>
                  <CardContent className="py-6 text-center text-muted-foreground text-sm">
                    Coin packs unavailable right now — check back soon.
                  </CardContent>
                </Card>
              )}
              {coinProducts.map((product) => {
                const coins = parseInt((product.metadata?.productType ?? "coins_0").replace("coins_", ""), 10);
                const info = COIN_ICONS[product.unit_amount] ?? { label: "Coin Pack", badge: undefined };
                return (
                  <Card key={product.id}>
                    <CardContent className="flex items-center gap-4 py-4 px-4 w-full">
                      <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-amber-100 dark:bg-amber-900/30 shrink-0">
                        <Zap size={20} className="text-amber-500" />
                        <span className="text-xs font-black text-amber-700 dark:text-amber-400">
                          {coins >= 1000 ? `${coins / 1000}k` : coins}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="font-black text-base">{info.label}</span>
                          {info.badge && (
                            <Badge variant="secondary" className="text-[10px] font-bold">{info.badge}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-bold text-foreground">{coins.toLocaleString()} coins</span> added instantly · No account needed
                        </p>
                      </div>
                      <Button
                        size="default"
                        data-testid={`button-buy-coins-${coins}`}
                        disabled={purchasing === product.price_id}
                        onClick={() => handleBuy(product.price_id, `coins_${coins}`)}
                      >
                        {purchasing === product.price_id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <span className="font-black">{formatPrice(product.unit_amount, product.currency)}</span>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <AdSlot format="rectangle" className="mb-5" />

            {/* Legal footer */}
            <div className="rounded-lg bg-muted/40 px-4 py-3 space-y-2 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground text-sm">Important to know</p>
              <p>All prices include VAT where applicable. Payments processed securely by Stripe.</p>
              <p>
                Purchases are stored in your browser (localStorage). If you clear your browser data, your Premium or
                coins will be lost — there is no account to restore from. This is intentional to keep the game
                completely sign-up free.
              </p>
              <p>
                <Link href="/refund-policy" className="underline hover:text-foreground font-medium">14-Day Refund Policy</Link>
                {" · "}
                <Link href="/terms" className="underline hover:text-foreground font-medium">Terms</Link>
                {" · "}
                <Link href="/privacy" className="underline hover:text-foreground font-medium">Privacy</Link>
              </p>
            </div>
          </>
        )}
      </div>
      <Footer />
      <BottomTabNav />
    </div>
  );
}
