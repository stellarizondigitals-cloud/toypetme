import { useQuery, useMutation } from "@tanstack/react-query";
import GameHeader from "@/components/GameHeader";
import PetDisplay from "@/components/PetDisplay";
import StatsPanel from "@/components/StatsPanel";
import ActionButtons from "@/components/ActionButtons";
import QuickActions from "@/components/QuickActions";
import BottomTabNav from "@/components/BottomTabNav";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Pet, User } from "@shared/schema";

export default function GameHome() {
  const { toast } = useToast();

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Fed your pet!",
        description: "+20 Hunger, +5 XP",
      });
    },
  });

  // Play mutation
  const playMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/pet/play"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Playing with your pet!",
        description: "+15 Happiness, -10 Energy, +10 XP",
      });
    },
  });

  // Clean mutation
  const cleanMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/pet/clean"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Cleaned your pet!",
        description: "+25 Cleanliness, +8 XP",
      });
    },
  });

  // Sleep mutation
  const sleepMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/pet/sleep"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Pet is resting...",
        description: "+30 Energy, +5 XP",
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
        <PetDisplay 
          name={pet.name} 
          level={pet.level} 
          mood={pet.mood as "happy" | "neutral" | "sad" | "sleeping"} 
        />
        
        <StatsPanel
          hunger={pet.hunger}
          happiness={pet.happiness}
          energy={pet.energy}
          cleanliness={pet.cleanliness}
        />
        
        <ActionButtons
          onFeed={() => feedMutation.mutate()}
          onPlay={() => playMutation.mutate()}
          onClean={() => cleanMutation.mutate()}
          onSleep={() => sleepMutation.mutate()}
        />
        
        <QuickActions />
      </main>
      
      <BottomTabNav />
    </div>
  );
}
