import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import { Heart, Coins, Clock, Sparkles } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Pet, User } from "@shared/schema";

export default function BreedingCenter() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedParent1, setSelectedParent1] = useState<string | null>(null);
  const [selectedParent2, setSelectedParent2] = useState<string | null>(null);

  const { data: pets = [], isLoading: petsLoading } = useQuery<Pet[]>({
    queryKey: ["/api/pet"],
  });

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const breedMutation = useMutation({
    mutationFn: async (data: { parent1Id: string; parent2Id: string }) => {
      const response = await apiRequest("POST", "/api/breeding/start", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to start breeding");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Breeding Started! 💕",
        description: "Your pets are bonding! Check back in 24 hours for an egg.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/breeding"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] }); // Refresh coins
      setSelectedParent1(null);
      setSelectedParent2(null);
      setLocation("/eggs"); // Navigate to eggs page
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Breeding Failed",
        description: error.message || "An error occurred",
      });
    },
  });

  const handleStartBreeding = () => {
    if (!selectedParent1 || !selectedParent2) {
      toast({
        variant: "destructive",
        title: "Select Two Pets",
        description: "You need to select two pets to start breeding.",
      });
      return;
    }

    if (selectedParent1 === selectedParent2) {
      toast({
        variant: "destructive",
        title: "Invalid Selection",
        description: "Please select two different pets.",
      });
      return;
    }

    breedMutation.mutate({
      parent1Id: selectedParent1,
      parent2Id: selectedParent2,
    });
  };

  const toggleParentSelection = (petId: string, slot: 1 | 2) => {
    if (slot === 1) {
      setSelectedParent1(selectedParent1 === petId ? null : petId);
      // Unselect from parent 2 if it was there
      if (selectedParent2 === petId) {
        setSelectedParent2(null);
      }
    } else {
      setSelectedParent2(selectedParent2 === petId ? null : petId);
      // Unselect from parent 1 if it was there
      if (selectedParent1 === petId) {
        setSelectedParent1(null);
      }
    }
  };

  const getPetEmoji = (type: string) => {
    const emojiMap: Record<string, string> = {
      bunny: "🐰",
      puppy: "🐶",
      turtle: "🐢",
      cat: "🐱",
      hamster: "🐹",
    };
    return emojiMap[type.toLowerCase()] || "🐾";
  };

  const getColorStyle = (color: string) => {
    const colorMap: Record<string, string> = {
      brown: "bg-amber-100 border-amber-300",
      white: "bg-gray-100 border-gray-300",
      black: "bg-gray-800 text-white border-gray-900",
      gray: "bg-gray-200 border-gray-400",
      orange: "bg-orange-100 border-orange-300",
      yellow: "bg-yellow-100 border-yellow-300",
      pink: "bg-pink-100 border-pink-300",
      blue: "bg-blue-100 border-blue-300",
    };
    return colorMap[color.toLowerCase()] || "bg-gray-100 border-gray-300";
  };

  if (petsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <p className="text-lg text-muted-foreground">Loading pets...</p>
      </div>
    );
  }

  const eligiblePets = pets.filter(p => p.level >= 5); // Must be level 5+ to breed

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pb-24">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 font-['Outfit']" data-testid="text-page-title">
            <Heart className="inline-block mr-2 mb-1 text-pink-500" />
            Breeding Center
          </h1>
          <p className="text-center text-muted-foreground" data-testid="text-page-subtitle">
            Select two pets to create a new egg with unique traits!
          </p>
        </div>

        {/* Cost Info */}
        <Card className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="text-yellow-600" />
                <p className="text-sm font-medium text-yellow-800">
                  Breeding Cost: 200 coins
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="text-blue-600" />
                <p className="text-sm font-medium text-blue-800">
                  24 hour wait
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User's Coins */}
        {user && (
          <div className="mb-6 text-center">
            <Badge variant="secondary" className="text-lg px-4 py-2" data-testid="badge-user-coins">
              <Coins className="w-5 h-5 mr-2 text-yellow-600" />
              {user.coins} coins available
            </Badge>
          </div>
        )}

        {/* Selected Parents Preview */}
        {(selectedParent1 || selectedParent2) && (
          <Card className="mb-6 bg-gradient-to-r from-pink-100 to-purple-100 border-pink-300">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Sparkles className="text-purple-600" />
                Selected Parents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Parent 1</p>
                  {selectedParent1 ? (
                    <div className="text-2xl" data-testid="text-selected-parent1">
                      {getPetEmoji(pets.find(p => p.id === selectedParent1)?.type || "")}
                      <p className="text-sm font-medium mt-1">
                        {pets.find(p => p.id === selectedParent1)?.name}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Not selected</p>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Parent 2</p>
                  {selectedParent2 ? (
                    <div className="text-2xl" data-testid="text-selected-parent2">
                      {getPetEmoji(pets.find(p => p.id === selectedParent2)?.type || "")}
                      <p className="text-sm font-medium mt-1">
                        {pets.find(p => p.id === selectedParent2)?.name}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Not selected</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pets Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 font-['Outfit']">
            Your Pets {eligiblePets.length > 0 && `(${eligiblePets.length})`}
          </h2>
          
          {eligiblePets.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4" data-testid="text-no-eligible-pets">
                  You need at least one level 5+ pet to breed.
                </p>
                <Button onClick={() => setLocation("/")} data-testid="button-go-home">
                  Go Home
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {eligiblePets.map((pet) => {
                const isParent1 = selectedParent1 === pet.id;
                const isParent2 = selectedParent2 === pet.id;
                const isSelected = isParent1 || isParent2;

                return (
                  <Card
                    key={pet.id}
                    className={`hover-elevate transition-all cursor-pointer ${
                      isSelected ? "ring-2 ring-purple-500 bg-purple-50" : ""
                    }`}
                    onClick={() => {
                      if (!selectedParent1) {
                        toggleParentSelection(pet.id, 1);
                      } else if (!selectedParent2 && selectedParent1 !== pet.id) {
                        toggleParentSelection(pet.id, 2);
                      } else if (isSelected) {
                        // Deselect
                        if (isParent1) setSelectedParent1(null);
                        if (isParent2) setSelectedParent2(null);
                      }
                    }}
                    data-testid={`card-pet-${pet.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-4xl">{getPetEmoji(pet.type)}</div>
                          <div>
                            <p className="font-semibold font-['Outfit']">{pet.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Level {pet.level} • {pet.type}
                            </p>
                            <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${getColorStyle(pet.color)}`}>
                              {pet.color} {pet.pattern && `• ${pet.pattern}`}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <Badge variant="default" className="bg-purple-500">
                            {isParent1 ? "Parent 1" : "Parent 2"}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Breed Button */}
        {eligiblePets.length >= 2 && (
          <Button
            onClick={handleStartBreeding}
            disabled={!selectedParent1 || !selectedParent2 || breedMutation.isPending}
            size="lg"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            data-testid="button-start-breeding"
          >
            {breedMutation.isPending ? (
              "Starting Breeding..."
            ) : (
              <>
                <Heart className="mr-2" />
                Start Breeding (200 coins)
              </>
            )}
          </Button>
        )}

        {/* Info Card */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800">
              <strong>How breeding works:</strong> Select two level 5+ pets. After 24 hours, 
              you'll receive an egg with traits inherited from both parents! There's even a 5% 
              chance for rare mutations.
            </p>
          </CardContent>
        </Card>

        {/* View Eggs Button */}
        <Button
          variant="outline"
          onClick={() => setLocation("/eggs")}
          className="w-full mt-4"
          data-testid="button-view-eggs"
        >
          View My Eggs
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
