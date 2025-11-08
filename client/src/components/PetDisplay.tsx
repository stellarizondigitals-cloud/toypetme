import { useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import petImage from "@assets/generated_images/Cute_virtual_pet_character_457c2893.png";
import roomBg from "@assets/generated_images/Virtual_pet_room_background_21c0414b.png";

interface PetDisplayProps {
  name: string;
  level: number;
  mood: "happy" | "neutral" | "sad" | "sleeping";
}

export default function PetDisplay({ name, level, mood }: PetDisplayProps) {
  const [showHearts, setShowHearts] = useState(false);

  const handlePetClick = () => {
    setShowHearts(true);
    console.log(`Pet ${name} was petted!`);
    setTimeout(() => setShowHearts(false), 1500);
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-purple-100 to-pink-100 min-h-[400px] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${roomBg})` }}
      />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-4 text-center">
          <h2 
            className="text-3xl font-bold text-primary mb-1" 
            style={{ fontFamily: 'Outfit, sans-serif' }}
            data-testid="text-pet-name"
          >
            {name}
          </h2>
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
            <Sparkles className="w-4 h-4 text-chart-4" />
            <span className="text-sm font-semibold" data-testid="text-pet-level">Level {level}</span>
          </div>
        </div>

        <div 
          className="relative cursor-pointer active:scale-95 transition-transform"
          onClick={handlePetClick}
          data-testid="button-pet-interact"
        >
          <img
            src={petImage}
            alt={name}
            className="w-64 h-64 object-contain drop-shadow-lg animate-bounce-slow"
            data-testid="img-pet"
          />
          
          {showHearts && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  className="absolute text-pink-500 fill-pink-500 animate-float-up"
                  style={{
                    left: `${30 + i * 20}%`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                  data-testid={`heart-${i}`}
                />
              ))}
            </div>
          )}
        </div>

        <p className="mt-4 text-sm text-muted-foreground capitalize" data-testid="text-pet-mood">
          Feeling {mood}
        </p>
      </div>
    </div>
  );
}
