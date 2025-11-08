import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Inventory as InventoryItem, ShopItem, User } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Sparkles } from "lucide-react";
import GameHeader from "@/components/GameHeader";
import BottomTabNav from "@/components/BottomTabNav";

export default function Inventory() {
  const { toast } = useToast();

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: inventory = [], isLoading: inventoryLoading } = useQuery<
    (InventoryItem & { item: ShopItem })[]
  >({
    queryKey: ["/api/inventory"],
  });

  const useItemMutation = useMutation({
    mutationFn: (itemId: string) =>
      apiRequest("/api/inventory/use", "POST", { itemId }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pet"] });
      toast({
        title: "Item Used!",
        description: "Your pet feels better now",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to use item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (inventoryLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 animate-bounce mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading inventory...</p>
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
            <h1 className="text-3xl font-bold">My Inventory</h1>
            <p className="text-muted-foreground">
              Use items to care for your pet
            </p>
          </div>
          <Sparkles className="w-8 h-8 text-purple-500" />
        </div>

        {inventory.length === 0 ? (
          <Card className="p-12 text-center space-y-4">
            <Package className="w-16 h-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-xl font-semibold mb-2">No Items Yet</h3>
              <p className="text-muted-foreground">
                Visit the shop to buy items for your pet!
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {inventory.map((invItem) => (
              <Card
                key={invItem.itemId}
                className="p-4 space-y-3 hover-elevate"
                data-testid={`inventory-item-${invItem.itemId}`}
              >
                <div className="text-center">
                  <div className="text-5xl mb-2">{invItem.item.image}</div>
                  <h3 className="font-semibold">{invItem.item.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    Quantity: {invItem.quantity}
                  </p>
                </div>

                <Button
                  onClick={() => useItemMutation.mutate(invItem.itemId)}
                  disabled={useItemMutation.isPending}
                  className="w-full"
                  size="sm"
                  data-testid={`button-use-${invItem.itemId}`}
                >
                  Use Item
                </Button>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomTabNav />
    </div>
  );
}
