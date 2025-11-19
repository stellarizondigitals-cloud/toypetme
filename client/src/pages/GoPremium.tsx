import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Crown, 
  Sparkles, 
  Users, 
  TrendingUp, 
  Star, 
  Zap,
  Check 
} from "lucide-react";

export default function GoPremium() {
  const { toast } = useToast();

  // Fetch user data
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  // Toggle premium mutation
  const togglePremiumMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/user/toggle-premium");
      return await response.json();
    },
    onSuccess: (updatedUser: User) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
      toast({
        title: updatedUser.premium ? "Premium Activated!" : "Premium Deactivated",
        description: updatedUser.premium 
          ? "You now have access to all premium features!"
          : "Premium features have been disabled.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to toggle premium status. Please try again.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const benefits = [
    {
      icon: Users,
      title: "Unlimited Pet Slots",
      description: "Create and care for as many pets as you want! Free users are limited to 1 pet.",
      highlight: true,
    },
    {
      icon: Star,
      title: "Exclusive Pet Types",
      description: "Access rare and legendary pet species not available to free users.",
      highlight: true,
    },
    {
      icon: TrendingUp,
      title: "2x Coin Earnings",
      description: "Earn double coins from all activities: Feed (+$10), Play (+$20), Clean (+$16), Sleep (+$10).",
      highlight: true,
    },
    {
      icon: Sparkles,
      title: "Rare Evolution Paths",
      description: "Unlock special evolution stages and unique appearances for your pets.",
      highlight: false,
    },
    {
      icon: Zap,
      title: "No Advertisements",
      description: "Enjoy an ad-free experience with uninterrupted gameplay.",
      highlight: false,
    },
    {
      icon: Crown,
      title: "Premium Badge",
      description: "Show off your premium status with an exclusive badge on your profile.",
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Crown className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Go Premium</h1>
          </div>
          <p className="text-muted-foreground">
            Unlock the full ToyPetMe experience with premium features
          </p>
        </div>

        {/* Current Status Card */}
        {user && (
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">Current Status</h2>
                  {user.premium && (
                    <Badge variant="default" className="gap-1">
                      <Crown className="w-3 h-3" />
                      Premium
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {user.premium 
                    ? "You have access to all premium features" 
                    : "You're currently using the free plan"}
                </p>
              </div>
              <Button
                onClick={() => togglePremiumMutation.mutate()}
                disabled={togglePremiumMutation.isPending}
                variant={user.premium ? "outline" : "default"}
                className="gap-2"
                data-testid={user.premium ? "button-deactivate-premium" : "button-activate-premium"}
              >
                <Crown className="w-4 h-4" />
                {togglePremiumMutation.isPending 
                  ? "Processing..." 
                  : user.premium 
                    ? "Deactivate Premium" 
                    : "Activate Premium"}
              </Button>
            </div>
          </Card>
        )}

        {/* Testing Notice */}
        <Card className="p-4 bg-muted/50">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-primary mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-semibold text-sm">Testing Mode</h3>
              <p className="text-xs text-muted-foreground">
                Premium features can be toggled manually for testing. In production, 
                this would be a payment flow integrated with a service like Stripe.
              </p>
            </div>
          </div>
        </Card>

        {/* Benefits Grid */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Premium Benefits</h2>
          <div className="grid gap-3">
            {benefits.map((benefit, index) => (
              <Card 
                key={index} 
                className="p-4 hover-elevate"
                data-testid={`card-benefit-${index}`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <benefit.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{benefit.title}</h3>
                      {benefit.highlight && (
                        <Badge variant="secondary" className="text-xs">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                  <Check className="w-5 h-5 text-muted-foreground" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        {user && !user.premium && (
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="text-center space-y-4">
              <div>
                <h2 className="text-2xl font-bold">Ready to upgrade?</h2>
                <p className="text-muted-foreground">
                  Get instant access to all premium features
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => togglePremiumMutation.mutate()}
                disabled={togglePremiumMutation.isPending}
                className="gap-2"
                data-testid="button-cta-activate-premium"
              >
                <Crown className="w-5 h-5" />
                Activate Premium Now
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
