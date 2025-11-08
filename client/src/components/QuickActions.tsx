import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Calendar, Trophy, Star } from "lucide-react";

export default function QuickActions() {
  const actions = [
    { icon: Gift, label: "Daily Gift", color: "text-pink-500", testId: "button-daily-gift" },
    { icon: Calendar, label: "Streak", color: "text-blue-500", testId: "button-streak" },
    { icon: Trophy, label: "Quests", color: "text-yellow-500", testId: "button-quests" },
    { icon: Star, label: "Rewards", color: "text-purple-500", testId: "button-rewards" },
  ];

  return (
    <Card className="p-4">
      <div className="grid grid-cols-4 gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="ghost"
            className="flex flex-col items-center gap-2 h-auto py-3 hover-elevate"
            onClick={() => console.log(`${action.label} clicked`)}
            data-testid={action.testId}
          >
            <action.icon className={`w-6 h-6 ${action.color}`} />
            <span className="text-xs text-center">{action.label}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
}
