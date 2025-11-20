import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Sparkles, Star } from "lucide-react";

interface TutorialWelcomeProps {
  onNext: () => void;
  onSkip: () => void;
}

export function TutorialWelcome({ onNext, onSkip }: TutorialWelcomeProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-yellow-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6 text-center">
        <div className="flex justify-center gap-3 mb-4">
          <Heart className="w-10 h-10 text-pink-500" fill="currentColor" />
          <Sparkles className="w-10 h-10 text-purple-500" />
          <Star className="w-10 h-10 text-yellow-500" fill="currentColor" />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Outfit' }}>
            Welcome to ToyPetMe!
          </h1>
          <p className="text-lg text-gray-700">
            Your adorable virtual pet adventure starts here!
          </p>
        </div>

        <div className="space-y-4 text-left bg-purple-50 p-5 rounded-xl">
          <h2 className="text-lg font-semibold text-gray-900 text-center" style={{ fontFamily: 'Outfit' }}>
            How to Play
          </h2>
          
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex gap-3">
              <span className="text-pink-500 font-bold text-xl">🍔</span>
              <div>
                <p className="font-semibold">Feed Your Pet</p>
                <p className="text-gray-600">Keep hunger high by feeding regularly</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <span className="text-blue-500 font-bold text-xl">🎾</span>
              <div>
                <p className="font-semibold">Play Together</p>
                <p className="text-gray-600">Boost happiness through fun games</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <span className="text-green-500 font-bold text-xl">🛁</span>
              <div>
                <p className="font-semibold">Keep Clean</p>
                <p className="text-gray-600">Regular cleaning maintains health</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <span className="text-purple-500 font-bold text-xl">✨</span>
              <div>
                <p className="font-semibold">Level Up & Evolve</p>
                <p className="text-gray-600">Watch your pet grow through 4 stages</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <Button 
            onClick={onNext}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white"
            size="lg"
            data-testid="button-tutorial-next"
          >
            Let's Get Started!
          </Button>
          
          <Button 
            onClick={onSkip}
            variant="ghost"
            className="w-full text-gray-600"
            data-testid="button-tutorial-skip"
          >
            Skip Tutorial
          </Button>
        </div>
      </Card>
    </div>
  );
}
