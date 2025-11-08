import { useState } from "react";
import GameHeader from "@/components/GameHeader";
import PetDisplay from "@/components/PetDisplay";
import StatsPanel from "@/components/StatsPanel";
import ActionButtons from "@/components/ActionButtons";
import QuickActions from "@/components/QuickActions";
import BottomTabNav from "@/components/BottomTabNav";
import { useToast } from "@/hooks/use-toast";

export default function GameHome() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    hunger: 85,
    happiness: 70,
    energy: 60,
    cleanliness: 90,
  });

  const handleFeed = () => {
    setStats(prev => ({ ...prev, hunger: Math.min(prev.hunger + 20, 100) }));
    toast({
      title: "Fed your pet!",
      description: "+20 Hunger",
    });
  };

  const handlePlay = () => {
    setStats(prev => ({ 
      ...prev, 
      happiness: Math.min(prev.happiness + 15, 100),
      energy: Math.max(prev.energy - 10, 0)
    }));
    toast({
      title: "Playing with your pet!",
      description: "+15 Happiness, -10 Energy",
    });
  };

  const handleClean = () => {
    setStats(prev => ({ ...prev, cleanliness: Math.min(prev.cleanliness + 25, 100) }));
    toast({
      title: "Cleaned your pet!",
      description: "+25 Cleanliness",
    });
  };

  const handleSleep = () => {
    setStats(prev => ({ ...prev, energy: Math.min(prev.energy + 30, 100) }));
    toast({
      title: "Pet is resting...",
      description: "+30 Energy",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 pb-20">
      <GameHeader coins={1250} gems={45} notifications={3} />
      
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <PetDisplay name="Fluffy" level={5} mood="happy" />
        
        <StatsPanel
          hunger={stats.hunger}
          happiness={stats.happiness}
          energy={stats.energy}
          cleanliness={stats.cleanliness}
        />
        
        <ActionButtons
          onFeed={handleFeed}
          onPlay={handlePlay}
          onClean={handleClean}
          onSleep={handleSleep}
        />
        
        <QuickActions />
      </main>
      
      <BottomTabNav />
    </div>
  );
}
