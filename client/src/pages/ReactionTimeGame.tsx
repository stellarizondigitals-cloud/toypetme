import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Zap, Trophy } from "lucide-react";

export default function ReactionTimeGame() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [gameState, setGameState] = useState<"idle" | "waiting" | "react" | "ended">("idle");
  const [reactionTime, setReactionTime] = useState<number>(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [backgroundColor, setBackgroundColor] = useState("bg-red-500");
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const submitScoreMutation = useMutation({
    mutationFn: async (score: number) => {
      const response = await apiRequest("POST", "/api/minigames/reaction-time/play", { score });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit score");
      }
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Score Submitted! ⚡",
        description: `Earned ${data.coinsEarned} coins! Reaction time: ${reactionTime}ms`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/minigames/sessions"] });
    },
    onError: (error: any) => {
      if (error.message.includes("Cooldown active")) {
        toast({
          variant: "destructive",
          title: "Cooldown Active",
          description: error.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: error.message,
        });
      }
    },
  });

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const startGame = () => {
    setGameState("waiting");
    setBackgroundColor("bg-red-500");
    setReactionTime(0);

    // Random delay between 2-5 seconds
    const delay = 2000 + Math.random() * 3000;

    timeoutRef.current = setTimeout(() => {
      setGameState("react");
      setBackgroundColor("bg-green-500");
      startTimeRef.current = Date.now();
    }, delay);
  };

  const handleClick = () => {
    if (gameState === "waiting") {
      // Clicked too early
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      toast({
        variant: "destructive",
        title: "Too Early!",
        description: "Wait for the green screen!",
      });
      setGameState("idle");
      setBackgroundColor("bg-red-500");
      return;
    }

    if (gameState === "react") {
      const endTime = Date.now();
      const time = endTime - startTimeRef.current;
      setReactionTime(time);
      setGameState("ended");
      setBackgroundColor("bg-blue-500");

      if (bestTime === null || time < bestTime) {
        setBestTime(time);
      }

      // Convert time to score (lower is better)
      // Perfect score (100ms) = 1000 points, 1000ms = 100 points
      const score = Math.max(0, Math.min(1000, Math.floor(1000 - (time * 0.9))));
      submitScoreMutation.mutate(score);
    }
  };

  const getMessage = () => {
    if (gameState === "idle") {
      return "Click 'Start' to begin!";
    }
    if (gameState === "waiting") {
      return "Wait for GREEN...";
    }
    if (gameState === "react") {
      return "CLICK NOW!";
    }
    return `Reaction Time: ${reactionTime}ms`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/minigames")}
            data-testid="button-back"
          >
            <ArrowLeft className="mr-2" />
            Back to Hub
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold font-['Outfit']" data-testid="text-page-title">
              <Zap className="inline-block mr-2 mb-1 text-yellow-500" />
              Reaction Time
            </h1>
          </div>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>

        {/* Best Time */}
        {bestTime !== null && (
          <Card className="mb-6 bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 text-center">
              <Trophy className="inline-block mr-2 text-yellow-600" />
              <span className="font-semibold" data-testid="text-best-time">Best Time: {bestTime}ms</span>
            </CardContent>
          </Card>
        )}

        {/* Game Area */}
        <Card
          className={`h-96 flex items-center justify-center cursor-pointer transition-colors ${backgroundColor}`}
          onClick={handleClick}
        >
          <div className="text-center" data-testid="game-interaction-area">
            <p className="text-3xl font-bold text-white mb-4 font-['Outfit']" data-testid="text-game-message">
              {getMessage()}
            </p>
            {gameState === "ended" && (
              <p className="text-xl text-white/80" data-testid="text-final-score">
                Score: {Math.max(0, Math.min(1000, Math.floor(1000 - (reactionTime * 0.9))))}
              </p>
            )}
          </div>
        </Card>

        {/* Instructions */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">How to Play:</h3>
            <ol className="text-sm text-muted-foreground space-y-1">
              <li>1. Click "Start" to begin</li>
              <li>2. Wait for the screen to turn GREEN</li>
              <li>3. Click as fast as you can when it turns green!</li>
              <li>4. Faster reactions = more coins (20-50 coins per game)</li>
            </ol>
          </CardContent>
        </Card>

        {/* Start/Retry Button */}
        <Button
          onClick={startGame}
          disabled={gameState === "waiting" || gameState === "react" || submitScoreMutation.isPending}
          size="lg"
          className="w-full mt-4"
          data-testid="button-start"
        >
          {submitScoreMutation.isPending ? "Submitting..." : gameState === "ended" ? "Play Again" : "Start Game"}
        </Button>
      </div>
    </div>
  );
}
