import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Lock, Coins } from "lucide-react";

interface MiniGameCardProps {
  id: number;
  name: string;
  description: string;
  reward: number;
  isLocked: boolean;
  image: string;
}

export default function MiniGameCard({ id, name, description, reward, isLocked, image }: MiniGameCardProps) {
  return (
    <Card className={`overflow-hidden ${!isLocked ? 'hover-elevate' : 'opacity-60'}`}>
      <div className="relative aspect-square bg-gradient-to-br from-purple-100 to-pink-100">
        <img
          src={image}
          alt={name}
          className={`w-full h-full object-cover ${isLocked ? 'grayscale' : ''}`}
          data-testid={`img-game-${id}`}
        />
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Lock className="w-12 h-12 text-white" data-testid={`icon-locked-${id}`} />
          </div>
        )}
      </div>
      
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg" data-testid={`text-game-name-${id}`}>
            {name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1" data-testid={`text-game-desc-${id}`}>
            {description}
          </p>
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="gap-1">
            <Coins className="w-3 h-3" />
            <span data-testid={`text-game-reward-${id}`}>+{reward}</span>
          </Badge>
          <Button
            size="sm"
            disabled={isLocked}
            className="gap-2"
            onClick={() => console.log(`Playing game: ${name}`)}
            data-testid={`button-play-game-${id}`}
          >
            <Play className="w-4 h-4" />
            Play
          </Button>
        </div>
      </div>
    </Card>
  );
}
