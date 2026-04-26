import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Star, Coins, Zap, Crown, Lock, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { usePageMeta } from "@/lib/usePageMeta";
import AdSlot from "@/components/AdSlot";
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
  "No ads while playing",
  "Exclusive Premium cosmetics unlocked",
  "Double daily streak coin bonus",
  "Gold premium badge on your pet",
  "Priority access to new features",
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

  const premiumProduct = products.find((p) => p.metadata?.type === "premium");
  const coinProducts = products.filter((p) => p.metadata?.type === "coins");

  const formatPrice = (amount: number, currency: string) => {
    const symbol = currency === "gbp" ? "£" : currency === "usd" ? "$" : "€";
    return `${symbol}${(amount / 100).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Shop</h1>
        </div>

        <AdSlot format="banner" className="mb-4" />

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-muted-foreground" size={32} />
          </div>
        ) : (
          <>
            {/* Premium Card */}
            <Card className="mb-6 border-2 border-yellow-400/60 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Crown size={20} className="text-yellow-500" />
                    <CardTitle className="text-lg">ToyPetMe Premium</CardTitle>
                  </div>
                  <Badge className="bg-yellow-400 text-yellow-900">One-Time</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Unlock everything, forever. No subscription.</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 mb-4">
                  {PREMIUM_PERKS.map((perk) => (
                    <li key={perk} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 size={14} className="text-yellow-500 shrink-0" />
                      {perk}
                    </li>
                  ))}
                </ul>

                {hasPremium ? (
                  <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                    <CheckCircle2 size={16} />
                    You already have Premium!
                  </div>
                ) : premiumProduct ? (
                  <Button
                    className="w-full bg-yellow-500 text-yellow-950"
                    data-testid="button-buy-premium"
                    disabled={purchasing === premiumProduct.price_id}
                    onClick={() => handleBuy(premiumProduct.price_id, "premium")}
                  >
                    {purchasing === premiumProduct.price_id ? (
                      <><Loader2 size={14} className="animate-spin mr-2" /> Processing…</>
                    ) : (
                      <><Star size={14} className="mr-2" /> Unlock Premium — {formatPrice(premiumProduct.unit_amount, premiumProduct.currency)}</>
                    )}
                  </Button>
                ) : (
                  <Button className="w-full" disabled>
                    <Lock size={14} className="mr-2" /> Loading…
                  </Button>
                )}

                <p className="text-[10px] text-muted-foreground/60 mt-2 text-center">
                  Secure payment via Stripe. You may request a refund within 14 days.
                </p>
              </CardContent>
            </Card>

            {/* Coin Packs */}
            <h2 className="font-semibold text-base mb-3 flex items-center gap-2">
              <Coins size={16} className="text-amber-500" />
              Coin Packs
            </h2>

            <div className="space-y-3 mb-6">
              {coinProducts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Coin packs unavailable right now — check back soon.
                </p>
              )}
              {coinProducts.map((product) => {
                const coins = parseInt(product.metadata?.coins ?? "0", 10);
                const info = COIN_ICONS[product.unit_amount] ?? { label: "Coin Pack", badge: undefined };
                return (
                  <Card key={product.id} className="flex-row">
                    <CardContent className="flex items-center gap-4 py-4 px-4 w-full">
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-md bg-amber-100 dark:bg-amber-900/30 shrink-0">
                        <Zap size={18} className="text-amber-500" />
                        <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">{coins >= 1000 ? `${coins / 1000}k` : coins}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{info.label}</span>
                          {info.badge && <Badge variant="secondary" className="text-[10px]">{info.badge}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{coins.toLocaleString()} coins added instantly</p>
                      </div>
                      <Button
                        size="sm"
                        data-testid={`button-buy-coins-${coins}`}
                        disabled={purchasing === product.price_id}
                        onClick={() => handleBuy(product.price_id, `coins_${coins}`)}
                      >
                        {purchasing === product.price_id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          formatPrice(product.unit_amount, product.currency)
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <AdSlot format="rectangle" className="mb-4" />

            <div className="text-center text-xs text-muted-foreground space-y-1 px-2">
              <p>All prices include VAT where applicable. Payments processed securely by Stripe.</p>
              <p>
                Coin packs add coins to your browser-based wallet (localStorage). Premium is also stored in your browser.
                Progress is not tied to an account — clearing your browser data will reset it.
              </p>
              <p>
                <Link href="/refund-policy" className="underline hover:text-foreground">Refund Policy</Link>
                {" · "}
                <Link href="/terms" className="underline hover:text-foreground">Terms</Link>
                {" · "}
                <Link href="/privacy" className="underline hover:text-foreground">Privacy</Link>
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
