import { useEffect, useState } from "react";
import type { Pet } from "@/lib/gameStorage";
import { getHealth, applyDecay } from "@/lib/gameStorage";
import { getStageName } from "@/lib/petData";

interface PetDisplayProps {
  pet: Pet;
  isActing?: string | null;
}

type Mood = "happy" | "neutral" | "sad" | "tired";

function getMood(pet: Pet): Mood {
  const minStat = Math.min(pet.hunger, pet.happiness, pet.energy, pet.cleanliness);
  if (pet.energy < 20) return "tired";
  if (minStat < 25) return "sad";
  if (minStat > 60) return "happy";
  return "neutral";
}

interface SVGPetProps {
  species: string;
  color: string;
  mood: Mood;
  stage: number;
  size: number;
}

function CatSVG({ color, mood, stage }: Omit<SVGPetProps, "species" | "size">) {
  const eyeH = mood === "tired" ? 2 : mood === "happy" ? 7 : 5;
  const mouthD = mood === "happy"
    ? "M 40,62 Q 50,70 60,62"
    : mood === "sad"
    ? "M 40,65 Q 50,58 60,65"
    : "M 42,62 L 58,62";
  const eyeY = 47;
  const pupilColor = "#1a1a2e";
  return (
    <g>
      {/* Ears */}
      <polygon points="22,46 32,16 44,46" fill={color} />
      <polygon points="56,46 68,16 78,46" fill={color} />
      <polygon points="25,44 32,22 41,44" fill="#FFB6C1" opacity="0.6" />
      <polygon points="59,44 68,22 75,44" fill="#FFB6C1" opacity="0.6" />
      {/* Head */}
      <circle cx="50" cy="58" r="30" fill={color} />
      {/* Eyes */}
      <ellipse cx="40" cy={eyeY} rx="5.5" ry={eyeH} fill={pupilColor} />
      <ellipse cx="60" cy={eyeY} rx="5.5" ry={eyeH} fill={pupilColor} />
      <circle cx="42" cy={eyeY - 2} r="1.8" fill="white" opacity="0.9" />
      <circle cx="62" cy={eyeY - 2} r="1.8" fill="white" opacity="0.9" />
      {/* Nose */}
      <ellipse cx="50" cy="57" rx="3" ry="2" fill="#FFB6C1" />
      {/* Mouth */}
      <path d={mouthD} stroke={pupilColor} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Whiskers */}
      <line x1="16" y1="56" x2="40" y2="55" stroke={pupilColor} strokeWidth="0.8" opacity="0.4" />
      <line x1="16" y1="60" x2="40" y2="59" stroke={pupilColor} strokeWidth="0.8" opacity="0.4" />
      <line x1="84" y1="56" x2="60" y2="55" stroke={pupilColor} strokeWidth="0.8" opacity="0.4" />
      <line x1="84" y1="60" x2="60" y2="59" stroke={pupilColor} strokeWidth="0.8" opacity="0.4" />
      {/* Stage 3: Crown */}
      {stage === 3 && (
        <g>
          <polygon points="50,10 44,22 56,22" fill="#F59E0B" />
          <circle cx="50" cy="10" r="3" fill="#F59E0B" />
          <circle cx="44" cy="22" r="2" fill="#F59E0B" />
          <circle cx="56" cy="22" r="2" fill="#F59E0B" />
        </g>
      )}
    </g>
  );
}

function DogSVG({ color, mood, stage }: Omit<SVGPetProps, "species" | "size">) {
  const eyeH = mood === "tired" ? 2.5 : mood === "happy" ? 6 : 5;
  const mouthD = mood === "happy"
    ? "M 40,62 Q 50,70 60,62"
    : mood === "sad"
    ? "M 40,65 Q 50,59 60,65"
    : "M 42,63 L 58,63";
  const eyeY = 46;
  return (
    <g>
      {/* Floppy ears */}
      <ellipse cx="26" cy="58" rx="14" ry="20" fill={color} opacity="0.85" />
      <ellipse cx="74" cy="58" rx="14" ry="20" fill={color} opacity="0.85" />
      {/* Head */}
      <circle cx="50" cy="55" r="30" fill={color} />
      {/* Snout */}
      <ellipse cx="50" cy="62" rx="14" ry="10" fill="white" opacity="0.4" />
      {/* Nose */}
      <ellipse cx="50" cy="58" rx="7" ry="5" fill="#1a1a2e" />
      <circle cx="48" cy="57" r="1.5" fill="white" opacity="0.5" />
      {/* Eyes */}
      <ellipse cx="39" cy={eyeY} rx="5.5" ry={eyeH} fill="#1a1a2e" />
      <ellipse cx="61" cy={eyeY} rx="5.5" ry={eyeH} fill="#1a1a2e" />
      <circle cx="41" cy={eyeY - 1.5} r="1.8" fill="white" opacity="0.9" />
      <circle cx="63" cy={eyeY - 1.5} r="1.8" fill="white" opacity="0.9" />
      {/* Mouth */}
      <path d={mouthD} stroke="#1a1a2e" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Tongue when happy */}
      {mood === "happy" && (
        <ellipse cx="50" cy="70" rx="6" ry="5" fill="#F472B6" />
      )}
      {/* Stage 3: Star mark */}
      {stage === 3 && (
        <polygon points="50,5 52,13 60,13 54,18 56,26 50,21 44,26 46,18 40,13 48,13" fill="#F59E0B" />
      )}
    </g>
  );
}

function DragonSVG({ color, mood, stage }: Omit<SVGPetProps, "species" | "size">) {
  const eyeH = mood === "tired" ? 1.5 : 5;
  const mouthD = mood === "happy"
    ? "M 38,65 Q 50,74 62,65"
    : mood === "sad"
    ? "M 38,68 Q 50,60 62,68"
    : "M 40,65 L 60,65";
  const eyeY = 50;
  return (
    <g>
      {/* Wings */}
      <path d="M 12,50 Q 5,30 20,25 Q 30,40 25,55 Z" fill={color} opacity="0.7" />
      <path d="M 88,50 Q 95,30 80,25 Q 70,40 75,55 Z" fill={color} opacity="0.7" />
      {/* Head */}
      <ellipse cx="50" cy="55" rx="30" ry="28" fill={color} />
      {/* Horns */}
      <polygon points="40,30 36,12 44,28" fill={color} />
      <polygon points="60,30 64,12 56,28" fill={color} />
      {/* Scale texture */}
      <circle cx="40" cy="55" r="4" fill="white" opacity="0.1" />
      <circle cx="55" cy="48" r="3" fill="white" opacity="0.1" />
      <circle cx="48" cy="63" r="4" fill="white" opacity="0.1" />
      {/* Slit eyes */}
      <ellipse cx="40" cy={eyeY} rx="6" ry={eyeH} fill="#F59E0B" />
      <ellipse cx="60" cy={eyeY} rx="6" ry={eyeH} fill="#F59E0B" />
      <ellipse cx="40" cy={eyeY} rx="2" ry={eyeH} fill="#1a1a2e" />
      <ellipse cx="60" cy={eyeY} rx="2" ry={eyeH} fill="#1a1a2e" />
      {/* Mouth */}
      <path d={mouthD} stroke="#1a1a2e" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Nostrils */}
      <circle cx="46" cy="59" r="2" fill="#1a1a2e" opacity="0.3" />
      <circle cx="54" cy="59" r="2" fill="#1a1a2e" opacity="0.3" />
      {/* Stage 3: Fire breath */}
      {stage === 3 && (
        <g>
          <ellipse cx="50" cy="7" rx="6" ry="8" fill="#F59E0B" opacity="0.9" />
          <ellipse cx="44" cy="12" rx="4" ry="6" fill="#EF4444" opacity="0.8" />
          <ellipse cx="56" cy="12" rx="4" ry="6" fill="#EF4444" opacity="0.8" />
        </g>
      )}
    </g>
  );
}

function BunnySVG({ color, mood, stage }: Omit<SVGPetProps, "species" | "size">) {
  const eyeH = mood === "tired" ? 2 : mood === "happy" ? 6 : 5;
  const mouthD = mood === "happy"
    ? "M 40,63 Q 50,71 60,63"
    : mood === "sad"
    ? "M 40,66 Q 50,59 60,66"
    : "M 42,64 L 58,64";
  const eyeY = 52;
  return (
    <g>
      {/* Long ears */}
      <ellipse cx="37" cy="24" rx="10" ry="22" fill={color} />
      <ellipse cx="63" cy="24" rx="10" ry="22" fill={color} />
      <ellipse cx="37" cy="24" rx="6" ry="18" fill="#FFB6C1" opacity="0.6" />
      <ellipse cx="63" cy="24" rx="6" ry="18" fill="#FFB6C1" opacity="0.6" />
      {/* Head */}
      <circle cx="50" cy="60" r="28" fill={color} />
      {/* Cheeks */}
      <circle cx="34" cy="64" r="7" fill="#FFB6C1" opacity="0.4" />
      <circle cx="66" cy="64" r="7" fill="#FFB6C1" opacity="0.4" />
      {/* Eyes */}
      <ellipse cx="40" cy={eyeY} rx="5" ry={eyeH} fill="#1a1a2e" />
      <ellipse cx="60" cy={eyeY} rx="5" ry={eyeH} fill="#1a1a2e" />
      <circle cx="42" cy={eyeY - 1.5} r="1.5" fill="white" opacity="0.9" />
      <circle cx="62" cy={eyeY - 1.5} r="1.5" fill="white" opacity="0.9" />
      {/* Nose */}
      <ellipse cx="50" cy="61" rx="4" ry="2.5" fill="#FFB6C1" />
      {/* Mouth */}
      <path d={mouthD} stroke="#1a1a2e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <line x1="50" y1="63" x2="50" y2="67" stroke="#1a1a2e" strokeWidth="1.5" />
      {/* Stage 3: Halo */}
      {stage === 3 && (
        <ellipse cx="50" cy="6" rx="14" ry="4" fill="none" stroke="#F59E0B" strokeWidth="2.5" opacity="0.9" />
      )}
    </g>
  );
}

function AxolotlSVG({ color, mood, stage }: Omit<SVGPetProps, "species" | "size">) {
  const eyeH = mood === "tired" ? 2 : mood === "happy" ? 6 : 5;
  const mouthD = mood === "happy"
    ? "M 37,63 Q 50,73 63,63"
    : mood === "sad"
    ? "M 37,67 Q 50,58 63,67"
    : "M 40,64 L 60,64";
  const eyeY = 51;
  return (
    <g>
      {/* External gills left */}
      <line x1="20" y1="45" x2="10" y2="28" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1="22" y1="48" x2="8" y2="38" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1="24" y1="52" x2="10" y2="48" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <circle cx="10" cy="28" r="3" fill="#FFB6C1" />
      <circle cx="8" cy="38" r="3" fill="#FFB6C1" />
      <circle cx="10" cy="48" r="3" fill="#FFB6C1" />
      {/* External gills right */}
      <line x1="80" y1="45" x2="90" y2="28" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1="78" y1="48" x2="92" y2="38" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1="76" y1="52" x2="90" y2="48" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <circle cx="90" cy="28" r="3" fill="#FFB6C1" />
      <circle cx="92" cy="38" r="3" fill="#FFB6C1" />
      <circle cx="90" cy="48" r="3" fill="#FFB6C1" />
      {/* Wide oval head */}
      <ellipse cx="50" cy="57" rx="32" ry="26" fill={color} />
      {/* Eyes */}
      <ellipse cx="38" cy={eyeY} rx="6" ry={eyeH} fill="#1a1a2e" />
      <ellipse cx="62" cy={eyeY} rx="6" ry={eyeH} fill="#1a1a2e" />
      <circle cx="40" cy={eyeY - 2} r="2" fill="white" opacity="0.9" />
      <circle cx="64" cy={eyeY - 2} r="2" fill="white" opacity="0.9" />
      {/* Smile marks */}
      <path d={mouthD} stroke="#1a1a2e" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Cheeks */}
      <circle cx="32" cy="62" r="7" fill="#FFB6C1" opacity="0.5" />
      <circle cx="68" cy="62" r="7" fill="#FFB6C1" opacity="0.5" />
      {/* Stage 3: Crystal */}
      {stage === 3 && (
        <g>
          <polygon points="50,5 55,16 50,20 45,16" fill="#A5F3FC" opacity="0.9" />
          <polygon points="50,5 56,10 50,20 44,10" fill="#67E8F9" opacity="0.7" />
        </g>
      )}
    </g>
  );
}

function PetSVG({ species, color, mood, stage, size }: SVGPetProps) {
  const props = { color, mood, stage };
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {species === "cat" && <CatSVG {...props} />}
      {species === "dog" && <DogSVG {...props} />}
      {species === "dragon" && <DragonSVG {...props} />}
      {species === "bunny" && <BunnySVG {...props} />}
      {species === "axolotl" && <AxolotlSVG {...props} />}
    </svg>
  );
}

const moodColors: Record<Mood, string> = {
  happy: "from-violet-100 to-pink-100",
  neutral: "from-blue-50 to-violet-50",
  sad: "from-gray-100 to-blue-100",
  tired: "from-indigo-50 to-gray-100",
};

const moodLabel: Record<Mood, string> = {
  happy: "Feeling great!",
  neutral: "Doing okay",
  sad: "Feeling down...",
  tired: "Very sleepy...",
};

export default function PetDisplay({ pet, isActing }: PetDisplayProps) {
  const [tick, setTick] = useState(0);
  const [floatingText, setFloatingText] = useState<{ text: string; key: number } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isActing) {
      const texts: Record<string, string> = {
        feed: "+25 hunger",
        play: "+20 happy",
        clean: "+30 clean",
        sleep: "+35 energy",
      };
      setFloatingText({ text: texts[isActing] ?? "", key: Date.now() });
      const t = setTimeout(() => setFloatingText(null), 1500);
      return () => clearTimeout(t);
    }
  }, [isActing]);

  const decayedPet = applyDecay(pet);
  const mood = getMood(decayedPet);
  const health = getHealth(decayedPet);
  const stage = pet.stage;
  const stageName = getStageName(pet.species as any, stage);

  const bounce = Math.sin(tick * 0.15) * 4;

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      {/* Stage badge */}
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-semibold px-3 py-0.5 rounded-full text-white"
          style={{ background: "linear-gradient(135deg, #8B5CF6, #EC4899)" }}
        >
          {stageName}
        </span>
        <span className="text-xs text-muted-foreground font-medium">Lv {pet.level}</span>
      </div>

      {/* Pet container */}
      <div className="relative flex items-center justify-center">
        {/* Glow aura */}
        <div
          className={`absolute w-36 h-36 rounded-full bg-gradient-to-br ${moodColors[mood]} opacity-70 blur-lg`}
          style={{ transform: `translateY(${bounce}px)` }}
        />
        {/* Pet SVG with animation */}
        <div
          className="relative z-10 transition-transform duration-100"
          style={{ transform: `translateY(${bounce}px)` }}
          data-testid="pet-display"
        >
          <PetSVG
            species={pet.species}
            color={pet.color}
            mood={mood}
            stage={stage}
            size={150}
          />
          {/* Acting sparkle overlay */}
          {isActing && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-ping"
                  style={{
                    background: "#8B5CF6",
                    top: `${20 + Math.random() * 60}%`,
                    left: `${10 + Math.random() * 80}%`,
                    animationDelay: `${i * 0.1}s`,
                    opacity: 0.6,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Floating text */}
        {floatingText && (
          <div
            key={floatingText.key}
            className="absolute -top-4 left-1/2 -translate-x-1/2 text-sm font-bold text-primary whitespace-nowrap pointer-events-none"
            style={{ animation: "floatUp 1.5s ease-out forwards" }}
          >
            {floatingText.text}
          </div>
        )}
      </div>

      {/* Name & mood */}
      <div className="text-center">
        <p className="text-xl font-bold text-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
          {pet.name}
        </p>
        <p className="text-xs text-muted-foreground">{moodLabel[mood]}</p>
      </div>

      {/* Health bar */}
      <div className="w-40 flex items-center gap-2">
        <span className="text-xs text-muted-foreground w-6">HP</span>
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${health}%`,
              background:
                health > 60
                  ? "linear-gradient(90deg, #22C55E, #10B981)"
                  : health > 30
                  ? "linear-gradient(90deg, #EAB308, #F97316)"
                  : "linear-gradient(90deg, #EF4444, #F97316)",
            }}
          />
        </div>
        <span className="text-xs font-semibold text-foreground w-6 text-right">{health}</span>
      </div>
    </div>
  );
}
