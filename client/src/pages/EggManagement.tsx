import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import BottomNav from "@/components/BottomNav";
import { Egg, Clock, Sparkles, Heart } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Egg as EggType, BreedingRecord } from "@shared/schema";

export default function EggManagement() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: eggs = [], isLoading: eggsLoading } = useQuery<EggType[]>({
    queryKey: ["/api/eggs"],
  });

  const { data: breedingRecords = [] } = useQuery<BreedingRecord[]>({
    queryKey: ["/api/breeding"],
  });

  const hatchMutation = useMutation({
    mutationFn: async (eggId: string) => {
      const response = await apiRequest("POST", `/api/eggs/${eggId}/hatch`, {});
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to hatch egg");
      }
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Egg Hatched! 🎉",
        description: `Welcome ${data.pet.name} to your family!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/eggs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/breeding"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Hatching Failed",
        description: error.message || "An error occurred",
      });
    },
  });

  const getEggProgress = (eggId: string) => {
    const record = breedingRecords.find(r => r.eggId === eggId);
    if (!record || !record.readyAt) return { isReady: false, progress: 0, remainingMs: 0 };

    const now = Date.now();
    const completedTime = new Date(record.readyAt).getTime();
    const isReady = now >= completedTime;
    const remainingMs = Math.max(0, completedTime - now);
    
    // Calculate progress (breeding started to completion)
    if (record.startedAt) {
      const startTime = new Date(record.startedAt).getTime();
      const totalDuration = completedTime - startTime;
      const elapsed = now - startTime;
      const progress = Math.min(100, (elapsed / totalDuration) * 100);
      return { isReady, progress, remainingMs };
    }

    return { isReady, progress: 100, remainingMs };
  };

  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getColorStyle = (color: string) => {
    const colorMap: Record<string, string> = {
      brown: "from-amber-100 to-amber-200",
      white: "from-gray-100 to-gray-200",
      black: "from-gray-700 to-gray-900",
      gray: "from-gray-200 to-gray-300",
      orange: "from-orange-100 to-orange-200",
      yellow: "from-yellow-100 to-yellow-200",
      pink: "from-pink-100 to-pink-200",
      blue: "from-blue-100 to-blue-200",
      rainbow: "from-purple-200 via-pink-200 to-yellow-200",
      starry: "from-indigo-200 via-purple-200 to-blue-200",
      crystal: "from-cyan-100 to-blue-100",
      shadow: "from-gray-800 to-purple-900",
    };
    return colorMap[color.toLowerCase()] || "from-gray-100 to-gray-200";
  };

  if (eggsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <p className="text-lg text-muted-foreground">Loading eggs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-24">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 font-['Outfit']" data-testid="text-page-title">
            <Egg className="inline-block mr-2 mb-1 text-purple-500" />
            My Eggs
          </h1>
          <p className="text-center text-muted-foreground" data-testid="text-page-subtitle">
            Watch your eggs incubate and hatch them when ready!
          </p>
        </div>

        {/* Eggs Grid */}
        {eggs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Egg className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4" data-testid="text-no-eggs">
                You don't have any eggs yet. Start breeding pets to get eggs!
              </p>
              <Button onClick={() => setLocation("/breeding")} data-testid="button-go-breeding">
                <Heart className="mr-2" />
                Go to Breeding Center
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {eggs.map((egg) => {
              const { isReady, progress, remainingMs } = getEggProgress(egg.id);

              return (
                <Card
                  key={egg.id}
                  className={`hover-elevate transition-all ${
                    isReady ? "ring-2 ring-green-400 bg-green-50" : ""
                  }`}
                  data-testid={`card-egg-${egg.id}`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-['Outfit']">
                        {egg.name}
                      </CardTitle>
                      {isReady ? (
                        <Badge variant="default" className="bg-green-500" data-testid={`badge-egg-ready-${egg.id}`}>
                          Ready!
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1" data-testid={`badge-egg-cooldown-${egg.id}`}>
                          <Clock className="w-3 h-3" />
                          {formatTimeRemaining(remainingMs)}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* Egg Visual */}
                    <div className={`relative w-full h-32 rounded-lg bg-gradient-to-br ${getColorStyle(egg.color)} flex items-center justify-center mb-4`}>
                      <Egg className="w-16 h-16 text-white/70" />
                      {egg.isMutation && (
                        <Sparkles className="absolute top-2 right-2 w-6 h-6 text-yellow-400" />
                      )}
                    </div>

                    {/* Traits */}
                    <CardDescription className="mb-3">
                      <span className="font-medium">Type:</span> {egg.type}
                      <br />
                      <span className="font-medium">Color:</span> {egg.color}
                      {egg.pattern && (
                        <>
                          <br />
                          <span className="font-medium">Pattern:</span> {egg.pattern}
                        </>
                      )}
                      {egg.isMutation && (
                        <>
                          <br />
                          <span className="font-medium text-yellow-600">✨ Special Mutation!</span>
                        </>
                      )}
                    </CardDescription>

                    {/* Progress Bar */}
                    {!isReady && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Incubating...</span>
                          <span className="text-xs font-medium" data-testid={`text-egg-progress-${egg.id}`}>{Math.floor(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" data-testid={`progress-egg-${egg.id}`} />
                      </div>
                    )}

                    {/* Hatch Button */}
                    <Button
                      onClick={() => hatchMutation.mutate(egg.id)}
                      disabled={!isReady || hatchMutation.isPending}
                      className="w-full"
                      variant={isReady ? "default" : "secondary"}
                      data-testid={`button-hatch-${egg.id}`}
                    >
                      {hatchMutation.isPending ? (
                        "Hatching..."
                      ) : isReady ? (
                        <>
                          <Sparkles className="mr-2" />
                          Hatch Egg
                        </>
                      ) : (
                        "Not Ready Yet"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800">
              <strong>About eggs:</strong> Eggs take 24 hours to incubate. Once ready, 
              hatch them to add a new pet to your collection! Traits are inherited from 
              both parents, with a 5% chance for rare mutations.
            </p>
          </CardContent>
        </Card>

        {/* Breeding Center Button */}
        <Button
          variant="outline"
          onClick={() => setLocation("/breeding")}
          className="w-full mt-4"
          data-testid="button-go-breeding-center"
        >
          <Heart className="mr-2" />
          Go to Breeding Center
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
