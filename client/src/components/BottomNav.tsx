import { Home, Search, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function BottomNav() {
  const [activeTab, setActiveTab] = useState("home");

  const tabs = [
    { id: "home", icon: Home, label: "Home" },
    { id: "search", icon: Search, label: "Search" },
    { id: "cart", icon: ShoppingCart, label: "Cart" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            className={`flex-1 flex flex-col items-center justify-center gap-1 h-full rounded-none ${
              activeTab === tab.id ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => {
              setActiveTab(tab.id);
              console.log(`${tab.label} tab clicked`);
            }}
            data-testid={`button-nav-${tab.id}`}
          >
            <tab.icon className="h-5 w-5" />
            <span className="text-xs">{tab.label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
}
