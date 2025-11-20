import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Utensils, Gamepad2, Sparkles, ArrowLeft, Coins } from "lucide-react";

interface InteractiveTutorialProps {
  petName: string;
  petEmoji: string;
  onComplete: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const TUTORIAL_STEPS = [
  {
    id: "feed",
    title: "Feeding Time!",
    description: "Click the Feed button to give your pet food",
    icon: Utensils,
    color: "pink",
    action: "Feed",
    statName: "Hunger",
  },
  {
    id: "play",
    title: "Playtime!",
    description: "Click Play to have fun with your pet",
    icon: Gamepad2,
    color: "yellow",
    action: "Play",
    statName: "Happiness",
  },
  {
    id: "clean",
    title: "Bath Time!",
    description: "Keep your pet clean and healthy",
    icon: Sparkles,
    color: "green",
    action: "Clean",
    statName: "Cleanliness",
  },
];

export function InteractiveTutorial({ petName, petEmoji, onComplete, onBack, onSkip }: InteractiveTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedActions, setCompletedActions] = useState<string[]>([]);

  const step = TUTORIAL_STEPS[currentStep];
  const Icon = step.icon;
  const isActionCompleted = completedActions.includes(step.id);
  const progress = ((currentStep + (isActionCompleted ? 1 : 0)) / TUTORIAL_STEPS.length) * 100;

  const handleAction = () => {
    if (!isActionCompleted) {
      setCompletedActions([...completedActions, step.id]);
      
      // Move to next step after a short delay
      setTimeout(() => {
        if (currentStep < TUTORIAL_STEPS.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          // Tutorial complete
          setTimeout(onComplete, 500);
        }
      }, 1000);
    }
  };

  const buttonColorClasses = {
    pink: "bg-pink-500 hover:bg-pink-600",
    yellow: "bg-yellow-500 hover:bg-yellow-600",
    green: "bg-green-500 hover:bg-green-600",
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-yellow-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            onClick={onBack}
            variant="ghost"
            size="sm"
            data-testid="button-tutorial-back-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            onClick={onSkip}
            variant="ghost"
            size="sm"
            data-testid="button-tutorial-skip-3"
          >
            Skip
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700">Tutorial Progress</h2>
            <span className="text-sm text-gray-500">{completedActions.length}/{TUTORIAL_STEPS.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="text-center space-y-4 py-6">
          <div className="text-6xl mb-4">{petEmoji}</div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Outfit' }}>
            {petName}
          </h1>
          
          {isActionCompleted ? (
            <div className="text-green-600 font-semibold text-lg">
              ✓ Great job! {petName} loves it!
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-gray-700">
                <Icon className="w-6 h-6" />
                <h2 className="text-xl font-semibold" style={{ fontFamily: 'Outfit' }}>
                  {step.title}
                </h2>
              </div>
              <p className="text-gray-600">{step.description}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{step.statName}</span>
              <span className="text-sm text-gray-600">
                {isActionCompleted ? "100%" : "75%"}
              </span>
            </div>
            <Progress value={isActionCompleted ? 100 : 75} className="h-2" />
          </div>

          <Button 
            onClick={handleAction}
            disabled={isActionCompleted}
            className={`w-full text-white ${buttonColorClasses[step.color as keyof typeof buttonColorClasses]}`}
            size="lg"
            data-testid={`button-tutorial-${step.id}`}
          >
            <Icon className="w-5 h-5 mr-2" />
            {step.action}
          </Button>
        </div>

        {isActionCompleted && currentStep === TUTORIAL_STEPS.length - 1 && (
          <div className="text-center pt-4 border-t space-y-3">
            <div className="flex items-center justify-center gap-2 text-purple-600 font-semibold">
              <Coins className="w-5 h-5" />
              <span>Bonus: +100 Coins Reward!</span>
            </div>
            <p className="text-sm text-gray-600">
              Tutorial completed! Your adventure begins now!
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
