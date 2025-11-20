import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import GameHeader from "@/components/GameHeader";
import BottomTabNav from "@/components/BottomTabNav";
import { ShoppingBag, Coins, Sparkles, Egg, TrendingUp, CreditCard } from "lucide-react";
import type { User } from "@shared/schema";

interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: "pet-egg" | "coin-pack" | "booster";
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

const storeItems: StoreItem[] = [
  {
    id: "common-egg",
    name: "Common Pet Egg",
    description: "Hatch a common virtual pet with standard traits",
    price: 0.99,
    currency: "GBP",
    category: "pet-egg",
    icon: <Egg className="w-8 h-8" />,
    badge: "Common",
    badgeColor: "bg-gray-500",
  },
  {
    id: "rare-egg",
    name: "Rare Pet Egg",
    description: "Hatch a rare virtual pet with unique abilities",
    price: 2.99,
    currency: "GBP",
    category: "pet-egg",
    icon: <Egg className="w-8 h-8" />,
    badge: "Rare",
    badgeColor: "bg-blue-500",
  },
  {
    id: "legendary-egg",
    name: "Legendary Pet Egg",
    description: "Hatch a legendary pet with exceptional powers",
    price: 4.99,
    currency: "GBP",
    category: "pet-egg",
    icon: <Egg className="w-8 h-8" />,
    badge: "Legendary",
    badgeColor: "bg-purple-600",
  },
  {
    id: "coin-pack-100",
    name: "100 Coins",
    description: "Get 100 coins instantly for pet care and shop items",
    price: 0.99,
    currency: "GBP",
    category: "coin-pack",
    icon: <Coins className="w-8 h-8" />,
  },
  {
    id: "coin-pack-500",
    name: "500 Coins",
    description: "Get 500 coins instantly - best value!",
    price: 3.99,
    currency: "GBP",
    category: "coin-pack",
    icon: <Coins className="w-8 h-8" />,
    badge: "Best Value",
    badgeColor: "bg-green-600",
  },
  {
    id: "evolution-booster",
    name: "Evolution Booster",
    description: "Speed up your pet's evolution and unlock new forms faster",
    price: 1.99,
    currency: "GBP",
    category: "booster",
    icon: <TrendingUp className="w-8 h-8" />,
    badge: "Popular",
    badgeColor: "bg-orange-500",
  },
];

export default function Store() {
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const handlePurchaseClick = (item: StoreItem) => {
    setSelectedItem(item);
    setShowConfirmModal(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedItem) return;

    setIsProcessing(true);

    // Simulate payment processing (placeholder)
    setTimeout(() => {
      setIsProcessing(false);
      setShowConfirmModal(false);
      toast({
        title: "Payment Processing",
        description: `Payment integration is in demo mode. In production, this would process your £${selectedItem.price.toFixed(2)} payment via Stripe/PayPal.`,
      });
      setSelectedItem(null);
    }, 2000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "pet-egg":
        return <Egg className="w-5 h-5" />;
      case "coin-pack":
        return <Coins className="w-5 h-5" />;
      case "booster":
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <ShoppingBag className="w-5 h-5" />;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case "pet-egg":
        return "Pet Eggs";
      case "coin-pack":
        return "Coin Packs";
      case "booster":
        return "Boosters";
      default:
        return "Items";
    }
  };

  const groupedItems = storeItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, StoreItem[]>);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <GameHeader 
        coins={user?.coins} 
        gems={user?.gems} 
        premium={user?.premium}
        notifications={0}
      />

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <ShoppingBag className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Store</h1>
          </div>
          <p className="text-muted-foreground">
            Purchase items to enhance your virtual pet experience
          </p>
        </div>

        {/* Premium Users Notice */}
        {user?.premium && (
          <Card className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 dark:from-amber-500/20 dark:to-yellow-500/20 border-amber-300/30 dark:border-amber-600/40">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-semibold text-sm">Premium Member</p>
                  <p className="text-xs text-muted-foreground">
                    Enjoy exclusive discounts on all store items!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Store Items by Category */}
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2">
              {getCategoryIcon(category)}
              <h2 className="text-xl font-semibold">{getCategoryTitle(category)}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item) => (
                <Card key={item.id} className="hover-elevate" data-testid={`card-store-item-${item.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg text-primary">
                          {item.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          {item.badge && (
                            <Badge className={`${item.badgeColor} text-white text-xs mt-1`}>
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{item.description}</CardDescription>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      £{item.price.toFixed(2)}
                    </div>
                    <Button
                      onClick={() => handlePurchaseClick(item)}
                      className="gap-2"
                      data-testid={`button-purchase-${item.id}`}
                    >
                      <CreditCard className="w-4 h-4" />
                      Purchase
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Payment Methods Notice */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-semibold">Secure Payment Processing</p>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span>Stripe</span>
                <span>•</span>
                <span>PayPal</span>
                <span>•</span>
                <span>SSL Encrypted</span>
              </div>
              <p className="text-xs text-muted-foreground italic">
                Demo Mode: Payment integration placeholders active
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent data-testid="modal-purchase-confirmation">
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              Review your purchase details before proceeding
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-lg text-primary">
                  {selectedItem.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{selectedItem.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedItem.description}
                  </p>
                </div>
              </div>

              <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Item Price:</span>
                  <span className="font-semibold">
                    £{selectedItem.price.toFixed(2)}
                  </span>
                </div>
                {user?.premium && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Premium Discount:</span>
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      -10%
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-primary">
                    £{user?.premium 
                      ? (selectedItem.price * 0.9).toFixed(2)
                      : selectedItem.price.toFixed(2)
                    }
                  </span>
                </div>
              </div>

              <div className="text-xs text-center text-muted-foreground">
                <p>Payment will be processed securely via Stripe</p>
                <p className="italic mt-1">
                  (Demo mode - no actual charge will be made)
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              disabled={isProcessing}
              data-testid="button-cancel-purchase"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPurchase}
              disabled={isProcessing}
              className="gap-2"
              data-testid="button-confirm-purchase"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Confirm Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomTabNav />
    </div>
  );
}
