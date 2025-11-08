import { Home, Gamepad2, ShoppingBag, Users, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function BottomTabNav() {
  const [activeTab, setActiveTab] = useState("home");

  const tabs = [
    { id: "home", icon: Home, label: "Home" },
    { id: "games", icon: Gamepad2, label: "Games" },
    { id: "shop", icon: ShoppingBag, label: "Shop" },
    { id: "friends", icon: Users, label: "Friends" },
    { id: "profile", icon: User, label: "Me" },
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
                activeTab === tab.id ? "text-primary" : "text-muted-foreground"
              }`}
              onClick={() => {
                setActiveTab(tab.id);
                console.log(`${tab.label} tab clicked`);
              }}
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
