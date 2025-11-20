import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Brain, Trophy } from "lucide-react";

interface CardType {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryMatchGame() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [gameState, setGameState] = useState<"idle" | "playing" | "ended">("idle");
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(null);

  const emojis = ["🐶", "🐱", "🐰", "🐹", "🐸", "🐢", "🦊", "🐨"];

  const submitScoreMutation = useMutation({
    mutationFn: async (score: number) => {
      const response = await apiRequest("POST", "/api/minigames/memory-match/play", { score });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit score");
      }
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Score Submitted! 🧠",
        description: `Earned ${data.coinsEarned} coins! Matches in ${moves} moves`,
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

  const initializeGame = () => {
    // Create pairs of cards
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(shuffled);
    setFlippedCards([]);
    setMatches(0);
    setMoves(0);
    setGameState("playing");
  };

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      const firstCard = cards.find(c => c.id === first);
      const secondCard = cards.find(c => c.id === second);

      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        // Match found!
        setTimeout(() => {
          setCards(prev =>
            prev.map(card =>
              card.id === first || card.id === second
                ? { ...card, isMatched: true, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
          setMatches(prev => prev + 1);
        }, 600);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev =>
            prev.map(card =>
              card.id === first || card.id === second
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [flippedCards, cards]);

  useEffect(() => {
    if (matches === 8 && gameState === "playing") {
      // Game complete!
      setGameState("ended");
      
      // Calculate score (fewer moves = higher score)
      // Perfect game (16 moves) = 1000 points, 32 moves = 500 points
      const score = Math.max(0, Math.min(1000, Math.floor(1000 - (moves - 16) * 20)));
      
      if (bestScore === null || score > bestScore) {
        setBestScore(score);
      }

      submitScoreMutation.mutate(score);
    }
  }, [matches, gameState, moves, bestScore]);

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length >= 2 || gameState !== "playing") return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    setCards(prev =>
      prev.map(c => (c.id === cardId ? { ...c, isFlipped: true } : c))
    );
    setFlippedCards(prev => [...prev, cardId]);
    
    if (flippedCards.length === 1) {
      setMoves(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
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
              <Brain className="inline-block mr-2 mb-1 text-purple-500" />
              Memory Match
            </h1>
          </div>
          <div className="w-24" /> {/* Spacer */}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Moves</p>
              <p className="text-2xl font-bold" data-testid="text-moves">{moves}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Matches</p>
              <p className="text-2xl font-bold" data-testid="text-matches">{matches}/8</p>
            </CardContent>
          </Card>
        </div>

        {/* Best Score */}
        {bestScore !== null && (
          <Card className="mb-6 bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 text-center">
              <Trophy className="inline-block mr-2 text-yellow-600" />
              <span className="font-semibold" data-testid="text-best-score">Best Score: {bestScore}</span>
            </CardContent>
          </Card>
        )}

        {/* Game Board */}
        {gameState !== "idle" && (
          <div className="grid grid-cols-4 gap-3 mb-6">
            {cards.map(card => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                disabled={card.isMatched || card.isFlipped || flippedCards.length >= 2}
                className={`aspect-square rounded-lg text-4xl flex items-center justify-center transition-all hover-elevate ${
                  card.isMatched
                    ? "bg-green-200 opacity-50"
                    : card.isFlipped
                    ? "bg-white"
                    : "bg-gradient-to-br from-purple-400 to-pink-400"
                }`}
                data-testid={`card-${card.id}`}
              >
                {card.isFlipped || card.isMatched ? card.emoji : "?"}
              </button>
            ))}
          </div>
        )}

        {/* Game Complete Message */}
        {gameState === "ended" && (
          <Card className="mb-6 bg-gradient-to-r from-green-100 to-blue-100 border-green-300">
            <CardContent className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-2 font-['Outfit']" data-testid="text-game-complete">Game Complete! 🎉</h2>
              <p className="text-muted-foreground" data-testid="text-final-moves">
                Completed in {moves} moves!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">How to Play:</h3>
            <ol className="text-sm text-muted-foreground space-y-1">
              <li>1. Click two cards to flip them</li>
              <li>2. Find matching pairs of emojis</li>
              <li>3. Match all 8 pairs to win</li>
              <li>4. Fewer moves = higher score = more coins!</li>
            </ol>
          </CardContent>
        </Card>

        {/* Start/Restart Button */}
        <Button
          onClick={initializeGame}
          disabled={submitScoreMutation.isPending}
          size="lg"
          className="w-full"
          data-testid="button-start"
        >
          {submitScoreMutation.isPending
            ? "Submitting..."
            : gameState === "idle"
            ? "Start Game"
            : "New Game"}
        </Button>
      </div>
    </div>
  );
}
