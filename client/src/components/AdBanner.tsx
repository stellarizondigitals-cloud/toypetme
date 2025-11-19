import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Clock, Video, Coins } from "lucide-react";
import type { User } from "@shared/schema";

interface AdBannerProps {
  user: User;
}

export default function AdBanner({ user }: AdBannerProps) {
  const { toast } = useToast();
  const [isWatching, setIsWatching] = useState(false);
  const [countdown, setCountdown] = useState(30);

  // Don't show ads for premium users
  if (user.premium) {
    return null;
  }

  const watchAdMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ads/watch-bonus");
      return await response.json();
    },
    onSuccess: (data: { user: User; coinsEarned: number; adsRemaining: number }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Ad Bonus Earned!",
        description: `You earned ${data.coinsEarned} coins! ${data.adsRemaining} ads remaining today.`,
      });
      setIsWatching(false);
      setCountdown(30);
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to watch ad";
      toast({
        title: "Ad Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsWatching(false);
      setCountdown(30);
    },
  });

  const handleWatchAd = () => {
    setIsWatching(true);
    
    // Simulate 30-second ad watching
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          watchAdMutation.mutate();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const MAX_ADS_PER_DAY = 5;
  const adsWatched = user.adsWatchedToday || 0;
  const adsRemaining = MAX_ADS_PER_DAY - adsWatched;
  const hasReachedLimit = adsWatched >= MAX_ADS_PER_DAY;

  return (
    <Card className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-300/30" data-testid="card-ad-banner">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Video className="w-5 h-5 text-purple-600" />
          <div>
            <h3 className="font-semibold text-sm" data-testid="text-ad-title">
              {isWatching ? "Watching Ad..." : "Earn Bonus Coins"}
            </h3>
            <p className="text-xs text-muted-foreground" data-testid="text-ad-count">
              {adsRemaining} of {MAX_ADS_PER_DAY} ads available today
            </p>
          </div>
        </div>

        {isWatching ? (
          <div className="flex items-center gap-2" data-testid="container-ad-watching">
            <Clock className="w-4 h-4 text-purple-600 animate-pulse" />
            <span className="text-sm font-semibold" data-testid="text-ad-countdown">
              {countdown}s
            </span>
          </div>
        ) : (
          <Button
            size="sm"
            onClick={handleWatchAd}
            disabled={hasReachedLimit || watchAdMutation.isPending}
            className="gap-2"
            data-testid="button-watch-ad"
          >
            <Coins className="w-4 h-4" />
            {hasReachedLimit ? "Limit Reached" : "+50 Coins"}
          </Button>
        )}
      </div>

      {isWatching && (
        <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden" data-testid="progress-ad-watching">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 ease-linear"
            style={{ width: `${((30 - countdown) / 30) * 100}%` }}
          />
        </div>
      )}
    </Card>
  );
}
