import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BottomTabNav from "@/components/BottomTabNav";
import GameHeader from "@/components/GameHeader";
import AdSlot from "@/components/AdSlot";
import Footer from "@/components/Footer";
import { loadState } from "@/lib/gameStorage";
import { ACHIEVEMENTS } from "@/lib/petData";
import { Lock, CheckCircle } from "lucide-react";

export default function Achievements() {
  const state = useMemo(() => loadState(), []);
  const unlockedIds = new Set(state.achievements.map((a) => a.id));
  const unlockedCount = unlockedIds.size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 pb-40">
      <GameHeader />

      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
              Achievements
            </h1>
            <p className="text-sm text-muted-foreground">
              {unlockedCount} / {ACHIEVEMENTS.length} unlocked
            </p>
          </div>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {Math.round((unlockedCount / ACHIEVEMENTS.length) * 100)}% complete
          </Badge>
        </div>

        <div className="w-full bg-muted rounded-full h-2 mb-6">
          <div
            className="bg-gradient-to-r from-violet-500 to-pink-500 h-2 rounded-full transition-all duration-700"
            style={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}
          />
        </div>

        <AdSlot format="banner" className="mx-auto mb-4" />

        <div className="grid gap-3">
          {ACHIEVEMENTS.map((achievement) => {
            const isUnlocked = unlockedIds.has(achievement.id);
            const unlockedData = state.achievements.find((a) => a.id === achievement.id);
            return (
              <Card
                key={achievement.id}
                className={`transition-all duration-300 ${
                  isUnlocked
                    ? "border-primary/30 bg-gradient-to-r from-violet-50 to-pink-50"
                    : "opacity-60"
                }`}
                data-testid={`achievement-${achievement.id}`}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${
                      isUnlocked
                        ? "bg-gradient-to-br from-violet-400 to-pink-400"
                        : "bg-muted"
                    }`}
                  >
                    {isUnlocked ? (
                      <span>{achievement.icon}</span>
                    ) : (
                      <Lock size={18} className="text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-foreground">{achievement.name}</p>
                      {isUnlocked && (
                        <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    {unlockedData && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Unlocked {new Date(unlockedData.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {achievement.reward > 0 && (
                    <div className={`text-right flex-shrink-0 ${isUnlocked ? "text-amber-600" : "text-muted-foreground"}`}>
                      <p className="text-sm font-bold">+{achievement.reward}</p>
                      <p className="text-xs">coins</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <AdSlot format="rectangle" className="mx-auto mt-4 mb-2" />
        <Footer />
      </div>

      <BottomTabNav />
    </div>
  );
}
