import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { createPetRequestSchema, type Pet, type User, type CreatePetRequest } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, Sparkles, Battery, Droplets, Plus, PawPrint } from "lucide-react";
import GameHeader from "@/components/GameHeader";
import BottomTabNav from "@/components/BottomTabNav";

export default function MyPets() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const form = useForm<CreatePetRequest>({
    resolver: zodResolver(createPetRequestSchema),
    defaultValues: {
      name: "",
      type: "Fluffy",
    },
  });

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: pets = [], isLoading } = useQuery<Pet[]>({
    queryKey: ["/api/pets"],
  });

  const createPetMutation = useMutation({
    mutationFn: (data: CreatePetRequest) =>
      apiRequest("POST", "/api/pets", data),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
      toast({
        title: "Pet Created!",
        description: `${variables.name} has joined your collection`,
      });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create pet",
        variant: "destructive",
      });
    },
  });

  const handleCreatePet = (data: CreatePetRequest) => {
    createPetMutation.mutate(data);
  };

  const getStatColor = (value: number) => {
    if (value >= 70) return "text-green-600";
    if (value >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getEvolutionStageName = (stage: number) => {
    if (stage === 1) return "Baby";
    if (stage === 2) return "Teen";
    return "Adult";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <PawPrint className="w-12 h-12 animate-bounce mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading pets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 pb-20">
      <GameHeader
        coins={user?.coins || 0}
        gems={user?.gems || 0}
        notifications={0}
      />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">My Pets</h1>
            <p className="text-muted-foreground">
              Manage your pet collection ({pets.length}/20)
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                disabled={pets.length >= 20}
                data-testid="button-create-pet"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Pet
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-create-pet">
              <DialogHeader>
                <DialogTitle>Create a New Pet</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreatePet)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pet Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter pet name"
                            maxLength={50}
                            data-testid="input-pet-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pet Type</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Fluffy, Dragon, Unicorn"
                            data-testid="input-pet-type"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createPetMutation.isPending}
                    data-testid="button-submit-create-pet"
                  >
                    {createPetMutation.isPending ? "Creating..." : "Create Pet"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {pets.length === 0 ? (
          <Card className="p-8 text-center">
            <PawPrint className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No Pets Yet</h2>
            <p className="text-muted-foreground mb-4">
              Create your first pet to get started!
            </p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              data-testid="button-create-first-pet"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Pet
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pets.map((pet) => (
              <Card
                key={pet.id}
                className="p-4 space-y-3 hover-elevate"
                data-testid={`pet-card-${pet.id}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold" data-testid={`text-pet-name-${pet.id}`}>
                      {pet.name}
                    </h3>
                    <p className="text-sm text-muted-foreground" data-testid={`text-pet-type-${pet.id}`}>
                      {pet.type} • Level {pet.level}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getEvolutionStageName(pet.evolutionStage)} • {pet.age} days old
                    </p>
                  </div>
                  <div className="text-2xl">🐾</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-muted-foreground">Health</span>
                    </div>
                    <span className={`font-semibold ${getStatColor(pet.health)}`} data-testid={`text-pet-health-${pet.id}`}>
                      {pet.health}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-muted-foreground">Hunger</span>
                    </div>
                    <span className={`font-semibold ${getStatColor(pet.hunger)}`} data-testid={`text-pet-hunger-${pet.id}`}>
                      {pet.hunger}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      <span className="text-muted-foreground">Happiness</span>
                    </div>
                    <span className={`font-semibold ${getStatColor(pet.happiness)}`} data-testid={`text-pet-happiness-${pet.id}`}>
                      {pet.happiness}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Battery className="w-4 h-4 text-green-500" />
                      <span className="text-muted-foreground">Energy</span>
                    </div>
                    <span className={`font-semibold ${getStatColor(pet.energy)}`} data-testid={`text-pet-energy-${pet.id}`}>
                      {pet.energy}%
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Mood: {pet.mood}</span>
                    <span>{pet.xp} XP</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomTabNav />
    </div>
  );
}
