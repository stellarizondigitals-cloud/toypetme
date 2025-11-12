import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ShopItem, User } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, ShoppingBag, Sparkles } from "lucide-react";
import GameHeader from "@/components/GameHeader";
import BottomTabNav from "@/components/BottomTabNav";

export default function Shop() {
  const { toast } = useToast();

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: shopItems = [], isLoading } = useQuery<ShopItem[]>({
    queryKey: ["/api/shop"],
  });

  const buyMutation = useMutation({
    mutationFn: (itemId: string) =>
      apiRequest("POST", "/api/shop/purchase", { itemId }),
    onSuccess: (_, itemId) => {
      const item = shopItems.find((i) => i.id === itemId);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({
        title: "Purchase Successful!",
        description: `${item?.name} added to your inventory`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Not enough money",
        variant: "destructive",
      });
    },
  });

  const categories = [
    { id: "food", label: "Food", icon: "🍎" },
    { id: "toy", label: "Toys", icon: "⚽" },
    { id: "cosmetic", label: "Cosmetics", icon: "✨" },
  ];

  const groupedItems = shopItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ShopItem[]>);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-12 h-12 animate-bounce mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading shop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 pb-20">
      <GameHeader
        coins={user?.coins || 0}
        gems={user?.gems || 0}
        notifications={0}
      />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pet Shop</h1>
            <p className="text-muted-foreground">
              Buy items to care for your pet
            </p>
          </div>
          <Sparkles className="w-8 h-8 text-yellow-500" />
        </div>

        {categories.map((category) => {
          const items = groupedItems[category.id] || [];
          if (items.length === 0) return null;

          return (
            <div key={category.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{category.icon}</span>
                <h2 className="text-xl font-bold">{category.label}</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {items.map((item) => (
                  <Card
                    key={item.id}
                    className="p-4 space-y-3 hover-elevate"
                    data-testid={`shop-item-${item.id}`}
                  >
                    <div className="text-center">
                      <div className="text-5xl mb-2">{item.image}</div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-1 text-green-600 font-bold">
                      <DollarSign className="w-4 h-4" />
                      <span>{item.price}</span>
                    </div>

                    <Button
                      onClick={() => buyMutation.mutate(item.id)}
                      disabled={
                        buyMutation.isPending || (user?.coins || 0) < item.price
                      }
                      className="w-full"
                      size="sm"
                      data-testid={`button-buy-${item.id}`}
                    >
                      {(user?.coins || 0) < item.price ? "Not Enough Money" : "Buy"}
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </main>

      <BottomTabNav />
    </div>
  );
}
