import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Trophy, Coins } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Ball {
  id: number;
  x: number;
  y: number;
  speed: number;
  color: string;
}

export default function MiniGame() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [gameState, setGameState] = useState<"idle" | "playing" | "ended">("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [basketX, setBasketX] = useState(50);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [highScore, setHighScore] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const ballIdCounter = useRef(0);
  const scoreRef = useRef(0); // Track current score for useEffect closures

  const rewardMutation = useMutation({
    mutationFn: (score: number) => {
      console.log("📤 Sending score to server:", score);
      return apiRequest("POST", "/api/minigame/reward", { score });
    },
    onSuccess: async (data: any) => {
      console.log("🎮 Game reward received - full response:", JSON.stringify(data));
      console.log("💰 Coins earned:", data.coinsEarned, "type:", typeof data.coinsEarned);
      
      // Ensure coinsEarned is a valid number
      const coinsEarned = Number(data.coinsEarned) || 0;
      
      // Update the cached user data directly with new coin count
      queryClient.setQueryData(["/api/user"], (oldData: any) => {
        if (!oldData) {
          console.log("⚠️ No cached user data found");
          return oldData;
        }
        const newCoins = oldData.coins + coinsEarned;
        console.log("💰 Updating coins from", oldData.coins, "to", newCoins);
        return {
          ...oldData,
          coins: newCoins,
          gems: oldData.gems
        };
      });
      
      // Also invalidate pet data to update happiness
      queryClient.invalidateQueries({ queryKey: ["/api/pet"] });
      
      toast({
        title: "Game Complete!",
        description: `Earned ${coinsEarned} coins and +${data.happinessGained} happiness!`,
      });
    },
  });

  // Spawn balls periodically
  useEffect(() => {
    if (gameState !== "playing") return;

    const spawnInterval = setInterval(() => {
      const newBall: Ball = {
        id: ballIdCounter.current++,
        x: Math.random() * 80 + 10,
        y: 0,
        speed: Math.random() * 2 + 2,
        color: ["#FF6B9D", "#C084FC", "#60A5FA", "#FCD34D"][
          Math.floor(Math.random() * 4)
        ],
      };
      setBalls((prev) => [...prev, newBall]);
    }, 800);

    return () => clearInterval(spawnInterval);
  }, [gameState]);

  // Move balls downward
  useEffect(() => {
    if (gameState !== "playing") return;

    const moveInterval = setInterval(() => {
      setBalls((prev) =>
        prev
          .map((ball) => ({ ...ball, y: ball.y + ball.speed }))
          .filter((ball) => {
            // Check collision with basket
            if (
              ball.y > 85 &&
              ball.y < 95 &&
              ball.x > basketX - 10 &&
              ball.x < basketX + 10
            ) {
              setScore((s) => {
                const newScore = s + 10;
                scoreRef.current = newScore; // Keep ref in sync
                return newScore;
              });
              return false; // Remove caught ball
            }
            // Remove balls that went off screen
            return ball.y < 100;
          })
      );
    }, 50);

    return () => clearInterval(moveInterval);
  }, [gameState, basketX]);

  // Game timer
  useEffect(() => {
    if (gameState !== "playing") return;

    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [gameState]);

  // Mouse/touch controls
  useEffect(() => {
    if (gameState !== "playing") return;

    const handleMove = (clientX: number) => {
      if (!gameAreaRef.current) return;
      const rect = gameAreaRef.current.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      setBasketX(Math.max(10, Math.min(90, x)));
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleMove(e.touches[0].clientX);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [gameState]);

  const startGame = () => {
    setGameState("playing");
    setScore(0);
    scoreRef.current = 0; // Reset ref
    setTimeLeft(30);
    setBalls([]);
    ballIdCounter.current = 0;
  };

  const endGame = () => {
    setGameState("ended");
    const finalScore = scoreRef.current; // Use ref for current value
    console.log("🎯 Game ending with final score:", finalScore);
    if (finalScore > highScore) {
      setHighScore(finalScore);
    }
    rewardMutation.mutate(finalScore);
  };

  const resetGame = () => {
    setGameState("idle");
    setScore(0);
    setTimeLeft(30);
    setBalls([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Ball Catch Game</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            data-testid="button-close-game"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {gameState === "idle" && (
          <Card className="p-8 text-center space-y-6">
            <div className="text-6xl">🎯</div>
            <h2 className="text-3xl font-bold">Ball Catch</h2>
            <p className="text-muted-foreground">
              Move your basket to catch falling balls! Each ball is worth 10
              points. You have 30 seconds!
            </p>
            {highScore > 0 && (
              <div className="flex items-center justify-center gap-2 text-lg">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold">High Score: {highScore}</span>
              </div>
            )}
            <Button
              onClick={startGame}
              size="lg"
              className="w-full"
              data-testid="button-start-game"
            >
              Start Game
            </Button>
          </Card>
        )}

        {gameState === "playing" && (
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold text-xl">{score}</span>
                </div>
                <div className="text-xl font-bold">⏱️ {timeLeft}s</div>
              </div>
            </Card>

            <Card className="p-0 overflow-hidden">
              <div
                ref={gameAreaRef}
                className="relative bg-gradient-to-b from-sky-200 to-sky-100 h-[500px] cursor-none select-none"
                data-testid="game-area"
              >
                {/* Falling balls */}
                {balls.map((ball) => (
                  <div
                    key={ball.id}
                    className="absolute w-8 h-8 rounded-full shadow-lg transition-none"
                    style={{
                      left: `${ball.x}%`,
                      top: `${ball.y}%`,
                      backgroundColor: ball.color,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                ))}

                {/* Basket */}
                <div
                  className="absolute bottom-8 w-20 h-16 flex items-end justify-center transition-none"
                  style={{
                    left: `${basketX}%`,
                    transform: "translateX(-50%)",
                  }}
                  data-testid="basket"
                >
                  <div className="w-16 h-3 bg-amber-700 rounded-t-lg" />
                  <div className="absolute bottom-0 w-20 h-12 border-4 border-amber-700 border-t-0 rounded-b-2xl bg-amber-600" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {gameState === "ended" && (
          <Card className="p-8 text-center space-y-6">
            <div className="text-6xl">🎉</div>
            <h2 className="text-3xl font-bold">Game Over!</h2>
            <div className="text-5xl font-bold text-primary">{score}</div>
            <p className="text-muted-foreground">Points Earned</p>
            <div className="flex items-center justify-center gap-2 text-xl">
              <Coins className="w-6 h-6 text-yellow-500" />
              <span className="font-semibold">
                +{Math.floor(score / 2)} Coins
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={resetGame}
                variant="outline"
                className="flex-1"
                data-testid="button-play-again"
              >
                Play Again
              </Button>
              <Button
                onClick={() => setLocation("/")}
                className="flex-1"
                data-testid="button-back-home"
              >
                Back to Pet
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
