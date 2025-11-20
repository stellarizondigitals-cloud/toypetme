import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Coins, Users, Crown } from "lucide-react";
import GameHeader from "@/components/GameHeader";
import BottomTabNav from "@/components/BottomTabNav";
import type { User } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";

type LeaderboardCategory = "highest-level" | "most-pets" | "total-coins";

type HighestLevelEntry = {
  userId: string;
  username: string;
  maxLevel: number;
  petName: string;
  rank: number;
};

type MostPetsEntry = {
  userId: string;
  username: string;
  petCount: number;
  rank: number;
};

type TotalCoinsEntry = {
  userId: string;
  username: string;
  coins: number;
  rank: number;
};

export default function Leaderboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<LeaderboardCategory>("highest-level");

  const { data: user, isLoading: userLoading, isError: userError } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  // Leaderboard queries
  const { data: highestLevelData, isLoading: loadingHighestLevel } = useQuery<{
    leaderboard: HighestLevelEntry[];
    currentUserRank: number | null;
  }>({
    queryKey: ["/api/leaderboard/highest-level"],
    enabled: activeTab === "highest-level",
  });

  const { data: mostPetsData, isLoading: loadingMostPets } = useQuery<{
    leaderboard: MostPetsEntry[];
    currentUserRank: number | null;
  }>({
    queryKey: ["/api/leaderboard/most-pets"],
    enabled: activeTab === "most-pets",
  });

  const { data: totalCoinsData, isLoading: loadingTotalCoins } = useQuery<{
    leaderboard: TotalCoinsEntry[];
    currentUserRank: number | null;
  }>({
    queryKey: ["/api/leaderboard/total-coins"],
    enabled: activeTab === "total-coins",
  });

  // Auth guard
  useEffect(() => {
    if (!userLoading && user === null) {
      setLocation("/login");
    }
  }, [user, userLoading, setLocation]);

  if (userError) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-b from-purple-50 to-pink-50">
        <GameHeader coins={0} gems={0} premium={false} notifications={0} />
        <main className="flex-1 overflow-auto p-4 max-w-2xl mx-auto w-full">
          <div className="text-center py-8">
            <p className="text-lg text-muted-foreground">Failed to load leaderboard</p>
          </div>
        </main>
        <BottomTabNav />
      </div>
    );
  }

  if (userLoading) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-b from-purple-50 to-pink-50">
        <GameHeader coins={0} gems={0} premium={false} notifications={0} />
        <main className="flex-1 overflow-auto p-4 max-w-2xl mx-auto w-full">
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-muted-foreground mt-4">Loading...</p>
          </div>
        </main>
        <BottomTabNav />
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" data-testid={`icon-trophy-${rank}`} />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" data-testid={`icon-medal-${rank}`} />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" data-testid={`icon-medal-${rank}`} />;
    return <span className="text-muted-foreground font-semibold" data-testid={`text-rank-${rank}`}>#{rank}</span>;
  };

  const renderLeaderboard = () => {
    if (activeTab === "highest-level") {
      if (loadingHighestLevel) {
        return (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        );
      }

      const leaderboard = highestLevelData?.leaderboard || [];
      const currentUserRank = highestLevelData?.currentUserRank;

      return (
        <>
          {currentUserRank && (
            <Card className="mb-4 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-primary">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Crown className="w-6 h-6 text-primary" data-testid="icon-crown-user" />
                    <div>
                      <p className="font-semibold text-gray-800" data-testid="text-your-rank">Your Rank: #{currentUserRank}</p>
                      <p className="text-sm text-muted-foreground">Keep climbing!</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <Card
                key={entry.userId}
                className={entry.userId === user?.id ? "border-2 border-primary bg-purple-50" : ""}
                data-testid={`card-leaderboard-${entry.rank}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 flex justify-center">{getRankIcon(entry.rank)}</div>
                      <div>
                        <p className="font-semibold text-gray-800" data-testid={`text-username-${entry.rank}`}>
                          {entry.username}
                          {entry.userId === user?.id && " (You)"}
                        </p>
                        <p className="text-sm text-muted-foreground" data-testid={`text-petname-${entry.rank}`}>
                          {entry.petName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-primary" data-testid={`text-level-${entry.rank}`}>
                        Level {entry.maxLevel}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {leaderboard.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No leaderboard data yet. Create some pets to get started!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      );
    }

    if (activeTab === "most-pets") {
      if (loadingMostPets) {
        return (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        );
      }

      const leaderboard = mostPetsData?.leaderboard || [];
      const currentUserRank = mostPetsData?.currentUserRank;

      return (
        <>
          {currentUserRank && (
            <Card className="mb-4 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-primary">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Crown className="w-6 h-6 text-primary" data-testid="icon-crown-user" />
                    <div>
                      <p className="font-semibold text-gray-800" data-testid="text-your-rank">Your Rank: #{currentUserRank}</p>
                      <p className="text-sm text-muted-foreground">Keep collecting!</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <Card
                key={entry.userId}
                className={entry.userId === user?.id ? "border-2 border-primary bg-purple-50" : ""}
                data-testid={`card-leaderboard-${entry.rank}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 flex justify-center">{getRankIcon(entry.rank)}</div>
                      <div>
                        <p className="font-semibold text-gray-800" data-testid={`text-username-${entry.rank}`}>
                          {entry.username}
                          {entry.userId === user?.id && " (You)"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-primary" data-testid={`text-petcount-${entry.rank}`}>
                        {entry.petCount} {entry.petCount === 1 ? "Pet" : "Pets"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {leaderboard.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No leaderboard data yet. Create some pets to get started!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      );
    }

    if (activeTab === "total-coins") {
      if (loadingTotalCoins) {
        return (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        );
      }

      const leaderboard = totalCoinsData?.leaderboard || [];
      const currentUserRank = totalCoinsData?.currentUserRank;

      return (
        <>
          {currentUserRank && (
            <Card className="mb-4 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-primary">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Crown className="w-6 h-6 text-primary" data-testid="icon-crown-user" />
                    <div>
                      <p className="font-semibold text-gray-800" data-testid="text-your-rank">Your Rank: #{currentUserRank}</p>
                      <p className="text-sm text-muted-foreground">Keep earning!</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <Card
                key={entry.userId}
                className={entry.userId === user?.id ? "border-2 border-primary bg-purple-50" : ""}
                data-testid={`card-leaderboard-${entry.rank}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 flex justify-center">{getRankIcon(entry.rank)}</div>
                      <div>
                        <p className="font-semibold text-gray-800" data-testid={`text-username-${entry.rank}`}>
                          {entry.username}
                          {entry.userId === user?.id && " (You)"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-amber-600" data-testid={`text-coins-${entry.rank}`}>
                        {entry.coins} Coins
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {leaderboard.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No leaderboard data yet. Start earning coins!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <GameHeader coins={user?.coins} gems={user?.gems} premium={user?.premium} notifications={0} />

      <main className="flex-1 overflow-auto p-4 max-w-2xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Global Leaderboard
          </h1>
          <p className="text-muted-foreground mt-2">
            See how you rank against other ToyPetMe players
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as LeaderboardCategory)}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="highest-level" data-testid="tab-highest-level">
              <Trophy className="w-4 h-4 mr-2" />
              Highest Level
            </TabsTrigger>
            <TabsTrigger value="most-pets" data-testid="tab-most-pets">
              <Users className="w-4 h-4 mr-2" />
              Most Pets
            </TabsTrigger>
            <TabsTrigger value="total-coins" data-testid="tab-total-coins">
              <Coins className="w-4 h-4 mr-2" />
              Total Coins
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>{renderLeaderboard()}</TabsContent>
        </Tabs>
      </main>

      <BottomTabNav />
    </div>
  );
}
