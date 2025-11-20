import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { getQueryFn } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useRef, useEffect } from "react";
import GameHeader from "@/components/GameHeader";
import BottomTabNav from "@/components/BottomTabNav";
import { Share2, Heart, Sparkles, Trophy, Calendar } from "lucide-react";
import { SiX, SiFacebook, SiInstagram, SiTiktok } from "react-icons/si";
import type { Pet, User } from "@shared/schema";
import { EVOLUTION_STAGES } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Collection() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const { data: user, isLoading: userLoading, isError: userError } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  const { data: pets = [], isLoading: petsLoading } = useQuery<Pet[]>({
    queryKey: ["/api/pets"],
  });

  // Auth guard: redirect to login if user is null (401 response)
  useEffect(() => {
    if (!userLoading && user === null) {
      setLocation("/login");
    }
  }, [user, userLoading, setLocation]);

  // Handle non-401 errors
  if (userError) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-b from-purple-50 to-pink-50">
        <GameHeader coins={0} gems={0} premium={false} notifications={0} />
        <main className="flex-1 overflow-auto p-4 max-w-2xl mx-auto w-full">
          <div className="text-center py-8">
            <p className="text-lg text-muted-foreground">Failed to load your collection</p>
          </div>
        </main>
        <BottomTabNav />
      </div>
    );
  }

  const handleShareClick = (pet: Pet) => {
    setSelectedPet(pet);
    setShowShareModal(true);
  };

  const getEvolutionStage = (stage: number): string => {
    return EVOLUTION_STAGES[stage as keyof typeof EVOLUTION_STAGES] || "Baby";
  };

  const getStatColor = (value: number): string => {
    if (value >= 70) return "text-green-600";
    if (value >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const shareToSocial = (platform: string) => {
    if (!selectedPet) return;

    const shareText = `Check out my ToyPetMe! Meet ${selectedPet.name}, a Level ${selectedPet.level} ${getEvolutionStage(selectedPet.evolutionStage)} ${selectedPet.type}!`;
    const shareUrl = window.location.origin;

    let url = "";
    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case "instagram":
        // Instagram doesn't support web sharing, so copy to clipboard
        navigator.clipboard.writeText(shareText + "\n" + shareUrl);
        toast({
          title: "Copied to Clipboard!",
          description: "Share text copied. Paste it in your Instagram post or story.",
        });
        return;
      case "tiktok":
        // TikTok doesn't have direct web share, copy to clipboard
        navigator.clipboard.writeText(shareText + "\n" + shareUrl);
        toast({
          title: "Copied to Clipboard!",
          description: "Share text copied. Paste it in your TikTok caption.",
        });
        return;
    }

    if (url) {
      window.open(url, "_blank", "width=600,height=400");
    }
  };

  if (userLoading || petsLoading) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-b from-purple-50 to-pink-50">
        <GameHeader coins={0} gems={0} premium={false} notifications={0} />
        <main className="flex-1 overflow-auto p-4 max-w-2xl mx-auto w-full">
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-muted-foreground mt-4">Loading your collection...</p>
          </div>
        </main>
        <BottomTabNav />
      </div>
    );
  }

  const sortedPets = [...pets].sort((a, b) => {
    // Sort by level descending, then by creation date
    if (b.level !== a.level) return b.level - a.level;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <GameHeader coins={user?.coins} gems={user?.gems} premium={user?.premium} notifications={0} />
      
      <main className="flex-1 overflow-auto p-4 max-w-2xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            My Pet Collection
          </h1>
          <p className="text-muted-foreground mt-2">
            {sortedPets.length === 0 
              ? "Start your collection by creating your first pet!"
              : `You've collected ${sortedPets.length} amazing pet${sortedPets.length === 1 ? '' : 's'}!`}
          </p>
        </div>

        {sortedPets.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Sparkles className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Pets Yet</h3>
              <p className="text-muted-foreground mb-4">
                Your collection is waiting to be started!
              </p>
              <Button onClick={() => window.location.href = "/game"} data-testid="button-create-pet">
                Create Your First Pet
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedPets.map((pet) => (
              <Card
                key={pet.id}
                className="hover-elevate transition-all"
                data-testid={`card-pet-${pet.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <span data-testid={`text-pet-name-${pet.id}`}>{pet.name}</span>
                        {pet.level >= 20 && (
                          <Trophy className="w-5 h-5 text-yellow-500" />
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {pet.type}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="ml-2"
                      data-testid={`badge-evolution-${pet.id}`}
                    >
                      {getEvolutionStage(pet.evolutionStage)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">Level:</span>
                      <span className="font-semibold" data-testid={`text-level-${pet.id}`}>
                        {pet.level}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-muted-foreground">Health:</span>
                      <span className={`font-semibold ${getStatColor(pet.health)}`}>
                        {pet.health}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="text-muted-foreground">Age:</span>
                      <span className="font-semibold">{pet.age} days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">XP:</span>
                      <span className="font-semibold">{pet.xp}/100</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Happiness:</span>
                      <span className={`font-semibold ${getStatColor(pet.happiness)}`}>
                        {pet.happiness}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Hunger:</span>
                      <span className={`font-semibold ${getStatColor(pet.hunger)}`}>
                        {pet.hunger}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Energy:</span>
                      <span className={`font-semibold ${getStatColor(pet.energy)}`}>
                        {pet.energy}%
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleShareClick(pet)}
                    className="w-full gap-2"
                    variant="outline"
                    data-testid={`button-share-pet-${pet.id}`}
                  >
                    <Share2 className="w-4 h-4" />
                    Share My Pet
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Pet</DialogTitle>
          </DialogHeader>

          {selectedPet && (
            <div className="space-y-4">
              <div
                ref={shareCardRef}
                className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-lg text-white"
                data-testid="card-shareable"
              >
                <div className="text-center space-y-3">
                  <h2 className="text-2xl font-bold">{selectedPet.name}</h2>
                  <Badge variant="secondary" className="text-lg px-4 py-1">
                    {getEvolutionStage(selectedPet.evolutionStage)} {selectedPet.type}
                  </Badge>
                  
                  <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                      <div className="text-white/80">Level</div>
                      <div className="text-2xl font-bold">{selectedPet.level}</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                      <div className="text-white/80">Health</div>
                      <div className="text-2xl font-bold">{selectedPet.health}%</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                      <div className="text-white/80">Happiness</div>
                      <div className="text-2xl font-bold">{selectedPet.happiness}%</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                      <div className="text-white/80">Age</div>
                      <div className="text-2xl font-bold">{selectedPet.age}d</div>
                    </div>
                  </div>

                  <div className="text-sm text-white/90 mt-4">
                    ToyPetMe Virtual Pet Game
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  Share on social media:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => shareToSocial("twitter")}
                    variant="outline"
                    className="gap-2"
                    data-testid="button-share-twitter"
                  >
                    <SiX className="w-4 h-4" />
                    Twitter
                  </Button>
                  <Button
                    onClick={() => shareToSocial("facebook")}
                    variant="outline"
                    className="gap-2"
                    data-testid="button-share-facebook"
                  >
                    <SiFacebook className="w-4 h-4" />
                    Facebook
                  </Button>
                  <Button
                    onClick={() => shareToSocial("instagram")}
                    variant="outline"
                    className="gap-2"
                    data-testid="button-share-instagram"
                  >
                    <SiInstagram className="w-4 h-4" />
                    Instagram
                  </Button>
                  <Button
                    onClick={() => shareToSocial("tiktok")}
                    variant="outline"
                    className="gap-2"
                    data-testid="button-share-tiktok"
                  >
                    <SiTiktok className="w-4 h-4" />
                    TikTok
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Instagram & TikTok: Copy text to clipboard for manual sharing
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomTabNav />
    </div>
  );
}
