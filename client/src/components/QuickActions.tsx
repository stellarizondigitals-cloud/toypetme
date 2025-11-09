import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Calendar, Trophy, Gamepad2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function QuickActions() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const dailyRewardMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/daily-reward");
      return await response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Daily Reward Claimed!",
        description: `+${50 + (data.dailyStreak * 10)} coins! Streak: ${data.dailyStreak} days`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Already Claimed",
        description: "Come back tomorrow for your next reward!",
        variant: "destructive",
      });
    },
  });

  const actions = [
    { 
      icon: Gift, 
      label: "Daily Gift", 
      color: "text-pink-500", 
      testId: "button-daily-gift",
      onClick: () => dailyRewardMutation.mutate()
    },
    { 
      icon: Gamepad2, 
      label: "Play Game", 
      color: "text-blue-500", 
      testId: "button-play-game",
      onClick: () => setLocation("/game")
    },
    { 
      icon: Trophy, 
      label: "Quests", 
      color: "text-yellow-500", 
      testId: "button-quests",
      onClick: () => toast({ title: "Coming soon!", description: "Daily quests feature" })
    },
    { 
      icon: Calendar, 
      label: "Streak", 
      color: "text-purple-500", 
      testId: "button-streak",
      onClick: () => toast({ title: "Coming soon!", description: "Streak calendar feature" })
    },
  ];

  return (
    <Card className="p-4">
      <div className="grid grid-cols-4 gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="ghost"
            className="flex flex-col items-center gap-2 h-auto py-3 hover-elevate"
            onClick={action.onClick}
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
