import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { TutorialWelcome } from "./TutorialWelcome";
import { StarterPetSelection } from "./StarterPetSelection";
import { InteractiveTutorial } from "./InteractiveTutorial";
import { useToast } from "@/hooks/use-toast";

interface TutorialContainerProps {
  onComplete: () => void;
}

type TutorialStep = "welcome" | "selection" | "interactive" | "completing";

export function TutorialContainer({ onComplete }: TutorialContainerProps) {
  const [step, setStep] = useState<TutorialStep>("welcome");
  const [selectedPetName, setSelectedPetName] = useState("");
  const [selectedPetType, setSelectedPetType] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const completeTutorialMutation = useMutation({
    mutationFn: async (data: { petName: string; petType: string }) => {
      const response = await apiRequest("POST", "/api/tutorial/complete", data);
      return await response.json();
    },
    onSuccess: (data: { user: any; pet: any }) => {
      // Update user in cache
      queryClient.setQueryData(["/api/me"], data.user);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
      
      toast({
        title: "Welcome to ToyPetMe!",
        description: `${selectedPetName} is ready to play! You've earned 100 bonus coins!`,
      });
      
      onComplete();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete tutorial",
        variant: "destructive",
      });
    },
  });

  const handleSkip = () => {
    if (confirm("Are you sure you want to skip the tutorial? You'll miss out on 100 bonus coins!")) {
      onComplete();
    }
  };

  const handleWelcomeNext = () => {
    setStep("selection");
  };

  const handleSelectionNext = (petName: string, petType: string) => {
    setSelectedPetName(petName);
    setSelectedPetType(petType);
    setStep("interactive");
  };

  const handleInteractiveComplete = () => {
    setStep("completing");
    completeTutorialMutation.mutate({
      petName: selectedPetName,
      petType: selectedPetType,
    });
  };

  const getPetEmoji = (type: string) => {
    const emojiMap: Record<string, string> = {
      "Fluffy": "🐰",
      "Sparky": "🐶",
      "Leafy": "🐢",
    };
    return emojiMap[type] || "🐾";
  };

  if (step === "welcome") {
    return <TutorialWelcome onNext={handleWelcomeNext} onSkip={handleSkip} />;
  }

  if (step === "selection") {
    return (
      <StarterPetSelection 
        onNext={handleSelectionNext}
        onBack={() => setStep("welcome")}
        onSkip={handleSkip}
      />
    );
  }

  if (step === "interactive") {
    return (
      <InteractiveTutorial 
        petName={selectedPetName}
        petEmoji={getPetEmoji(selectedPetType)}
        onComplete={handleInteractiveComplete}
        onBack={() => setStep("selection")}
        onSkip={handleSkip}
      />
    );
  }

  // Completing step - show loading
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-yellow-50 z-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-bounce text-6xl">✨</div>
        <p className="text-xl font-semibold text-gray-700">
          Creating your pet...
        </p>
      </div>
    </div>
  );
}
