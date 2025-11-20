import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import { Gamepad2, Trophy, Clock, Coins } from "lucide-react";
import type { MiniGame, UserMiniGameSession } from "@shared/schema";

export default function MiniGamesHub() {
  const [, setLocation] = useLocation();

  const { data: games = [], isLoading: gamesLoading } = useQuery<MiniGame[]>({
    queryKey: ["/api/minigames"],
  });

  const { data: sessions = [] } = useQuery<UserMiniGameSession[]>({
    queryKey: ["/api/minigames/sessions"],
  });

  // Calculate cooldown status for each game
  const getGameStatus = (gameId: string) => {
    const lastSession = sessions
      .filter(s => s.gameId === gameId)
      .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime())[0];

    if (!lastSession) {
      return { canPlay: true, remainingMs: 0 };
    }

    const timeSinceLastPlay = Date.now() - new Date(lastSession.playedAt).getTime();
    const cooldownMs = 3600000; // 1 hour
    const remainingMs = cooldownMs - timeSinceLastPlay;

    return {
      canPlay: remainingMs <= 0,
      remainingMs: Math.max(0, remainingMs),
      lastScore: lastSession.score,
      lastCoins: lastSession.coinsEarned,
    };
  };

  // Format remaining time as MM:SS
  const formatTimeRemaining = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Game route mapping
  const getGameRoute = (gameName: string) => {
    const routes: Record<string, string> = {
      "Memory Match": "/minigames/memory-match",
      "Reaction Time": "/minigames/reaction-time",
      "Feed Frenzy": "/minigames/feed-frenzy",
    };
    return routes[gameName] || "/minigames";
  };

  // Game icon mapping
  const getGameIcon = (gameName: string) => {
    if (gameName.includes("Memory")) return "🧠";
    if (gameName.includes("Reaction")) return "⚡";
    if (gameName.includes("Feed")) return "🍕";
    return "🎮";
  };

  if (gamesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <p className="text-lg text-muted-foreground">Loading games...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-24">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 font-['Outfit']" data-testid="text-page-title">
            <Gamepad2 className="inline-block mr-2 mb-1" />
            Mini-Games Hub
          </h1>
          <p className="text-center text-muted-foreground" data-testid="text-page-subtitle">
            Play games to earn coins and have fun with your pet!
          </p>
        </div>

        {/* Reward Info */}
        <Card className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Coins className="text-yellow-600" />
              <p className="text-sm font-medium text-yellow-800">
                Earn 20-50 coins per game based on your score!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Games Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {games.map((game) => {
            const status = getGameStatus(game.id);
            const icon = getGameIcon(game.name);

            return (
              <Card 
                key={game.id} 
                className="hover-elevate transition-all"
                data-testid={`card-game-${game.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{icon}</div>
                      <div>
                        <CardTitle className="text-xl font-['Outfit']">
                          {game.name}
                        </CardTitle>
                        {status.lastScore !== undefined && (
                          <div className="flex items-center gap-2 mt-1">
                            <Trophy className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm text-muted-foreground" data-testid={`text-last-score-${game.id}`}>
                              Best: {status.lastScore}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {!status.canPlay && (
                      <Badge variant="secondary" className="flex items-center gap-1" data-testid={`badge-cooldown-${game.id}`}>
                        <Clock className="w-3 h-3" />
                        {formatTimeRemaining(status.remainingMs)}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <CardDescription className="mb-4">
                    {game.description}
                  </CardDescription>

                  {status.lastCoins !== undefined && (
                    <div className="flex items-center gap-1 mb-4 text-sm text-muted-foreground">
                      <Coins className="w-4 h-4 text-yellow-600" />
                      <span data-testid={`text-last-coins-${game.id}`}>Last earned: {status.lastCoins} coins</span>
                    </div>
                  )}

                  <Button
                    onClick={() => setLocation(getGameRoute(game.name))}
                    disabled={!status.canPlay}
                    className="w-full"
                    data-testid={`button-play-${game.id}`}
                  >
                    {status.canPlay ? "Play Now" : "Cooldown Active"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Card */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800">
              <strong>Cooldown:</strong> Each game can be played once per hour. 
              The better your score, the more coins you earn (20-50 coins)!
            </p>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
