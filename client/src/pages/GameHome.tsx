import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import GameHeader from "@/components/GameHeader";
import PetDisplay from "@/components/PetDisplay";
import ActionButtons from "@/components/ActionButtons";
import QuickActions from "@/components/QuickActions";
import AdBanner from "@/components/AdBanner";
import BottomTabNav from "@/components/BottomTabNav";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";
import EvolutionAnimation from "@/components/EvolutionAnimation";
import { TutorialContainer } from "@/components/tutorial/TutorialContainer";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Pet, User } from "@shared/schema";
import { formatCurrency, formatCoinReward } from "@/lib/currency";
import { DAILY_LOGIN_BONUS, PET_ACTIONS } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export default function GameHome() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [evolutionState, setEvolutionState] = useState<{
    isOpen: boolean;
    petName: string;
    newStage: number;
    newLevel: number;
  }>({
    isOpen: false,
    petName: "",
    newStage: 0,
    newLevel: 1,
  });
  const [dailyRewardClaimed, setDailyRewardClaimed] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Fetch user data
  const { data: user, isLoading: userLoading, isError: userError } = useQuery<User>({
    queryKey: ["/api/me"],
    retry: 3,
  });

  // Check if user needs to see tutorial
  useEffect(() => {
    if (user && !user.tutorialCompleted) {
      setShowTutorial(true);
    }
  }, [user]);

  // Fetch pet data (skip if tutorial should be shown to avoid 404 errors)
  const shouldFetchPet = user && user.tutorialCompleted;
  const { data: pet, isLoading: petLoading, isError: petError } = useQuery<Pet>({
    queryKey: ["/api/pet"],
    refetchInterval: 30000, // Refresh every 30 seconds to show stat decay
    retry: 3,
    enabled: shouldFetchPet, // Only fetch pet if tutorial is completed
  });

  // Feed mutation
  const feedMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/pet/feed");
      return await response.json();
    },
    onSuccess: (data: any) => {
      queryClient.setQueryData(["/api/pet"], data.pet);
      queryClient.setQueryData(["/api/user"], data.user);
      
      // Handle evolution
      if (data.evolved) {
        setEvolutionState({
          isOpen: true,
          petName: data.pet.name,
          newStage: data.newStage,
          newLevel: data.pet.level,
        });
      } else if (data.leveledUp) {
        toast({
          title: "🎉 Level Up!",
          description: `${data.pet.name} reached level ${data.newLevel}! +5 XP`,
        });
      } else {
        toast({
          title: "Fed your pet!",
          description: `Your pet loves the food! +20 Hunger, +5 XP, ${formatCoinReward(PET_ACTIONS.feed.coinReward)}`,
        });
      }
    },
    onError: (error: any) => {
      const message = error.message || "Failed to feed pet";
      toast({
        title: "Cannot feed right now",
        description: message,
        variant: "destructive",
      });
    },
  });

  // Play mutation
  const playMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/pet/play");
      return await response.json();
    },
    onSuccess: (data: any) => {
      queryClient.setQueryData(["/api/pet"], data.pet);
      queryClient.setQueryData(["/api/user"], data.user);
      
      if (data.evolved) {
        setEvolutionState({
          isOpen: true,
          petName: data.pet.name,
          newStage: data.newStage,
          newLevel: data.pet.level,
        });
      } else if (data.leveledUp) {
        toast({
          title: "🎉 Level Up!",
          description: `${data.pet.name} reached level ${data.newLevel}! +10 XP`,
        });
      } else {
        toast({
          title: "Playing with your pet!",
          description: `So much fun! +15 Happiness, +10 XP, ${formatCoinReward(PET_ACTIONS.play.coinReward)}`,
        });
      }
    },
    onError: (error: any) => {
      const message = error.message || "Failed to play with pet";
      toast({
        title: "Cannot play right now",
        description: message,
        variant: "destructive",
      });
    },
  });

  // Clean mutation
  const cleanMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/pet/clean");
      return await response.json();
    },
    onSuccess: (data: any) => {
      queryClient.setQueryData(["/api/pet"], data.pet);
      queryClient.setQueryData(["/api/user"], data.user);
      
      if (data.evolved) {
        setEvolutionState({
          isOpen: true,
          petName: data.pet.name,
          newStage: data.newStage,
          newLevel: data.pet.level,
        });
      } else if (data.leveledUp) {
        toast({
          title: "🎉 Level Up!",
          description: `${data.pet.name} reached level ${data.newLevel}! +8 XP`,
        });
      } else {
        toast({
          title: "Cleaned your pet!",
          description: `All sparkly and clean! +25 Cleanliness, +8 XP, ${formatCoinReward(PET_ACTIONS.clean.coinReward)}`,
        });
      }
    },
    onError: (error: any) => {
      const message = error.message || "Failed to clean pet";
      toast({
        title: "Cannot clean right now",
        description: message,
        variant: "destructive",
      });
    },
  });

  // Sleep mutation
  const sleepMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/pet/sleep");
      return await response.json();
    },
    onSuccess: (data: any) => {
      queryClient.setQueryData(["/api/pet"], data.pet);
      queryClient.setQueryData(["/api/user"], data.user);
      
      if (data.evolved) {
        setEvolutionState({
          isOpen: true,
          petName: data.pet.name,
          newStage: data.newStage,
          newLevel: data.pet.level,
        });
      } else if (data.leveledUp) {
        toast({
          title: "🎉 Level Up!",
          description: `${data.pet.name} reached level ${data.newLevel}! +5 XP`,
        });
      } else {
        toast({
          title: "Pet is resting...",
          description: `Sweet dreams! +30 Energy, +5 XP, ${formatCoinReward(PET_ACTIONS.sleep.coinReward)}`,
        });
      }
    },
    onError: (error: any) => {
      const message = error.message || "Failed to put pet to sleep";
      toast({
        title: "Cannot sleep right now",
        description: message,
        variant: "destructive",
      });
    },
  });

  // Daily reward mutation
  const dailyRewardMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/daily-reward");
      return await response.json();
    },
    onSuccess: (data: any) => {
      queryClient.setQueryData(["/api/user"], data);
      setDailyRewardClaimed(true);
      toast({
        title: "🎁 Daily Login Bonus!",
        description: `Welcome back! You earned ${formatCurrency(DAILY_LOGIN_BONUS)}`,
        duration: 5000,
      });
    },
    onError: () => {
      // Silently fail if already claimed today
      setDailyRewardClaimed(true);
    },
  });

  // Attempt to claim daily reward on mount
  useEffect(() => {
    if (user && !dailyRewardClaimed) {
      dailyRewardMutation.mutate();
    }
  }, [user?.id]);

  // Show loading state only when waiting for user data or pet data (if tutorial is completed)
  if (userLoading || (user?.tutorialCompleted && petLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-bounce text-4xl mb-4">🐾</div>
          <p className="text-muted-foreground">Loading your pet...</p>
        </div>
      </div>
    );
  }

  if (userError || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center space-y-4 p-4">
          <div className="text-6xl">😔</div>
          <h2 className="text-2xl font-bold">Oops! Something went wrong</h2>
          <p className="text-muted-foreground">
            We couldn't load your account. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover-elevate active-elevate-2"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Show tutorial for new users (check tutorialCompleted directly, not state)
  if (!user.tutorialCompleted) {
    return <TutorialContainer onComplete={() => setShowTutorial(false)} />;
  }

  // After tutorial, we need a pet (only check petError if tutorial is completed)
  if (petError || !pet) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center space-y-4 p-4">
          <div className="text-6xl">😔</div>
          <h2 className="text-2xl font-bold">Oops! Something went wrong</h2>
          <p className="text-muted-foreground">
            We couldn't load your pet. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover-elevate active-elevate-2"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 pb-20">
      <GameHeader 
        coins={user.coins} 
        gems={user.gems} 
        premium={user.premium}
        notifications={0} 
      />
      
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {!user.verified && (
          <EmailVerificationBanner userEmail={user.email} />
        )}
        
        <PetDisplay 
          pet={pet}
          size="large"
          showStats={true}
          showXP={true}
        />
        
        <ActionButtons
          pet={pet}
          onFeed={() => feedMutation.mutate()}
          onPlay={() => playMutation.mutate()}
          onClean={() => cleanMutation.mutate()}
          onSleep={() => sleepMutation.mutate()}
          isLoading={feedMutation.isPending || playMutation.isPending || cleanMutation.isPending || sleepMutation.isPending}
        />
        
        {/* AR Pet View Button */}
        <Button
          onClick={() => setLocation("/ar")}
          size="lg"
          className="w-full bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600"
          data-testid="button-ar-view"
        >
          <Globe className="mr-2 w-4 h-4" />
          View Pet in AR 🌍
        </Button>
        
        <QuickActions />
        
        <AdBanner user={user} />
      </main>
      
      <BottomTabNav />
      
      <EvolutionAnimation
        isOpen={evolutionState.isOpen}
        onClose={() => setEvolutionState(prev => ({ ...prev, isOpen: false }))}
        petName={evolutionState.petName}
        newStage={evolutionState.newStage}
        newLevel={evolutionState.newLevel}
      />
    </div>
  );
}
