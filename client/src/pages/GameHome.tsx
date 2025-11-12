import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import GameHeader from "@/components/GameHeader";
import PetDisplay from "@/components/PetDisplay";
import ActionButtons from "@/components/ActionButtons";
import QuickActions from "@/components/QuickActions";
import BottomTabNav from "@/components/BottomTabNav";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";
import EvolutionAnimation from "@/components/EvolutionAnimation";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Pet, User } from "@shared/schema";

export default function GameHome() {
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

  // Fetch user data
  const { data: user, isLoading: userLoading, isError: userError } = useQuery<User>({
    queryKey: ["/api/user"],
    retry: 3,
  });

  // Fetch pet data
  const { data: pet, isLoading: petLoading, isError: petError } = useQuery<Pet>({
    queryKey: ["/api/pet"],
    refetchInterval: 30000, // Refresh every 30 seconds to show stat decay
    retry: 3,
  });

  // Feed mutation
  const feedMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/pet/feed"),
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
          description: "Your pet loves the food! +20 Hunger, +5 XP",
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
    mutationFn: () => apiRequest("POST", "/api/pet/play"),
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
          description: "So much fun! +15 Happiness, +10 XP",
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
    mutationFn: () => apiRequest("POST", "/api/pet/clean"),
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
          description: "All sparkly and clean! +25 Cleanliness, +8 XP",
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
    mutationFn: () => apiRequest("POST", "/api/pet/sleep"),
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
          description: "Sweet dreams! +30 Energy, +5 XP",
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

  if (userLoading || petLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-bounce text-4xl mb-4">🐾</div>
          <p className="text-muted-foreground">Loading your pet...</p>
        </div>
      </div>
    );
  }

  if (userError || petError || !user || !pet) {
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
        
        <QuickActions />
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
