import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Zap, Leaf, ArrowLeft } from "lucide-react";

interface StarterPetSelectionProps {
  onNext: (petName: string, petType: string) => void;
  onBack: () => void;
  onSkip: () => void;
}

const STARTER_PETS = [
  {
    type: "Fluffy",
    name: "Fluffy Bunny",
    description: "Gentle and loves cuddles",
    emoji: "🐰",
    color: "pink",
    icon: Heart,
    stats: "High Happiness",
  },
  {
    type: "Sparky",
    name: "Sparky Pup",
    description: "Energetic and playful",
    emoji: "🐶",
    color: "yellow",
    icon: Zap,
    stats: "High Energy",
  },
  {
    type: "Leafy",
    name: "Leafy Turtle",
    description: "Calm and easy-going",
    emoji: "🐢",
    color: "green",
    icon: Leaf,
    stats: "Low Maintenance",
  },
];

export function StarterPetSelection({ onNext, onBack, onSkip }: StarterPetSelectionProps) {
  const [selectedType, setSelectedType] = useState<string>("");
  const [petName, setPetName] = useState<string>("");

  const handleContinue = () => {
    if (selectedType && petName.trim()) {
      onNext(petName.trim(), selectedType);
    }
  };

  const selectedPet = STARTER_PETS.find(p => p.type === selectedType);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-yellow-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl p-6 md:p-8 space-y-6 my-4">
        <div className="flex items-center justify-between">
          <Button 
            onClick={onBack}
            variant="ghost"
            size="sm"
            data-testid="button-tutorial-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            onClick={onSkip}
            variant="ghost"
            size="sm"
            data-testid="button-tutorial-skip-2"
          >
            Skip
          </Button>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: 'Outfit' }}>
            Choose Your Starter Pet
          </h1>
          <p className="text-gray-600">
            Pick a companion to start your journey!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STARTER_PETS.map((pet) => {
            const Icon = pet.icon;
            const isSelected = selectedType === pet.type;
            const colorClasses = {
              pink: isSelected ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300',
              yellow: isSelected ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300',
              green: isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300',
            };

            return (
              <button
                key={pet.type}
                onClick={() => setSelectedType(pet.type)}
                className={`p-5 rounded-xl border-2 transition-all text-center space-y-3 hover-elevate ${colorClasses[pet.color as keyof typeof colorClasses]}`}
                data-testid={`button-pet-${pet.type.toLowerCase()}`}
              >
                <div className="text-5xl">{pet.emoji}</div>
                <div>
                  <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Outfit' }}>
                    {pet.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{pet.description}</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Icon className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 font-medium">{pet.stats}</span>
                </div>
                {isSelected && (
                  <div className="text-sm font-semibold text-purple-600">
                    ✓ Selected
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {selectedPet && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="pet-name" className="text-base font-semibold">
                Name Your {selectedPet.name}
              </Label>
              <Input
                id="pet-name"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="Enter a cute name..."
                className="text-lg"
                maxLength={20}
                data-testid="input-pet-name"
              />
              <p className="text-sm text-gray-500">
                {petName.length}/20 characters
              </p>
            </div>

            <Button 
              onClick={handleContinue}
              disabled={!petName.trim()}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white"
              size="lg"
              data-testid="button-confirm-pet"
            >
              Continue with {petName || "your pet"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
