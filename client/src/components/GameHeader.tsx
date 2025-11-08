import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Bell, Coins, Gem } from "lucide-react";

interface GameHeaderProps {
  coins: number;
  gems: number;
  notifications: number;
}

export default function GameHeader({ coins, gems, notifications }: GameHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-card px-3 py-1.5 rounded-full border">
              <Coins className="w-4 h-4 text-chart-4" />
              <span className="text-sm font-semibold" data-testid="text-coins">
                {coins.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-card px-3 py-1.5 rounded-full border">
              <Gem className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold" data-testid="text-gems">
                {gems.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              size="icon" 
              variant="ghost" 
              className="relative"
              data-testid="button-notifications"
            >
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  data-testid="badge-notification-count"
                >
                  {notifications}
                </Badge>
              )}
            </Button>
            <Button 
              size="icon" 
              variant="ghost"
              data-testid="button-settings"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
