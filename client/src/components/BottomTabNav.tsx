import { Home, ShoppingBag, Package, PawPrint, Crown, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function BottomTabNav() {
  const [location, setLocation] = useLocation();

  const tabs = [
    { id: "home", icon: Home, label: "Home", path: "/" },
    { id: "collection", icon: Trophy, label: "Collection", path: "/collection" },
    { id: "shop", icon: ShoppingBag, label: "Shop", path: "/shop" },
    { id: "inventory", icon: Package, label: "Items", path: "/inventory" },
    { id: "premium", icon: Crown, label: "Premium", path: "/premium" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t safe-area-bottom">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              className={`flex-1 flex flex-col items-center justify-center gap-1 h-full rounded-none ${
                location === tab.path ? "text-primary" : "text-muted-foreground"
              }`}
              onClick={() => setLocation(tab.path)}
              data-testid={`button-tab-${tab.id}`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
}
