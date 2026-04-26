import { useEffect, useState, useRef } from "react";
import type { Pet } from "@/lib/gameStorage";
import { getHealth, applyDecay } from "@/lib/gameStorage";
import { getStageName } from "@/lib/petData";

interface PetDisplayProps {
  pet: Pet;
  isActing?: string | null;
  size?: number;
}

type Mood = "happy" | "neutral" | "sad" | "tired";

function getMood(pet: Pet): Mood {
  const min = Math.min(pet.hunger, pet.happiness, pet.energy, pet.cleanliness);
  if (pet.energy < 20) return "tired";
  if (min < 25) return "sad";
  if (min > 60) return "happy";
  return "neutral";
}

const DARK = "#1a1a2e";
const PINK = "#FFB6C1";
const WHITE = "white";

// Stage-based scale (baby → adult gets bigger)
const STAGE_SCALE = [0.62, 0.78, 0.90, 1.0];

interface PetBodyProps {
  color: string;
  mood: Mood;
  stage: number;
  blinking: boolean;
}

// ── CAT ────────────────────────────────────────────────────────────────────
function CatBody({ color, mood, stage, blinking }: PetBodyProps) {
  const eyeRy = blinking ? 0.8 : mood === "tired" ? 1.5 : mood === "happy" ? 6.5 : 5;
  const mouthD = mood === "happy"
    ? "M 40,57 Q 50,65 60,57"
    : mood === "sad"
    ? "M 40,60 Q 50,53 60,60"
    : "M 43,58 L 57,58";
  const sc = STAGE_SCALE[stage];

  return (
    <g transform={`translate(50,82) scale(${sc}) translate(-50,-82)`}>
      {/* Tail (behind body) */}
      <path d="M 70,110 C 94,98 96,68 76,46" stroke={color} strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M 70,110 C 94,98 96,68 76,46" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.5" />

      {/* Arms */}
      <ellipse cx="18" cy="92" rx="10" ry="17" fill={color} />
      <ellipse cx="82" cy="92" rx="10" ry="17" fill={color} />

      {/* Body */}
      <rect x="28" y="76" width="44" height="46" rx="14" fill={color} />

      {/* Belly spot */}
      <ellipse cx="50" cy="98" rx="12" ry="14" fill={WHITE} opacity="0.22" />

      {/* Legs */}
      <rect x="30" y="114" width="14" height="42" rx="7" fill={color} />
      <rect x="56" y="114" width="14" height="42" rx="7" fill={color} />
      {/* Paws */}
      <ellipse cx="37" cy="156" rx="8" ry="5" fill={color} />
      <ellipse cx="63" cy="156" rx="8" ry="5" fill={color} />

      {/* Ears */}
      <polygon points="22,48 32,14 46,46" fill={color} />
      <polygon points="54,46 68,14 78,48" fill={color} />
      <polygon points="26,46 32,20 43,45" fill={PINK} opacity="0.65" />
      <polygon points="57,45 68,20 74,46" fill={PINK} opacity="0.65" />

      {/* Head */}
      <circle cx="50" cy="50" r="29" fill={color} />

      {/* Eyes */}
      <ellipse cx="40" cy="46" rx="5.5" ry={eyeRy} fill={DARK} />
      <ellipse cx="60" cy="46" rx="5.5" ry={eyeRy} fill={DARK} />
      {!blinking && <>
        <circle cx="42" cy="44" r="1.8" fill={WHITE} opacity="0.9" />
        <circle cx="62" cy="44" r="1.8" fill={WHITE} opacity="0.9" />
      </>}

      {/* Nose */}
      <ellipse cx="50" cy="54" rx="3" ry="2" fill={PINK} />
      {/* Mouth */}
      <path d={mouthD} stroke={DARK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Whiskers */}
      <line x1="14" y1="52" x2="38" y2="51" stroke={DARK} strokeWidth="0.8" opacity="0.35" />
      <line x1="14" y1="56" x2="38" y2="55" stroke={DARK} strokeWidth="0.8" opacity="0.35" />
      <line x1="86" y1="52" x2="62" y2="51" stroke={DARK} strokeWidth="0.8" opacity="0.35" />
      <line x1="86" y1="56" x2="62" y2="55" stroke={DARK} strokeWidth="0.8" opacity="0.35" />

      {/* Stage 3: Crown */}
      {stage === 3 && (
        <g>
          <polygon points="50,8 44,20 56,20" fill="#F59E0B" />
          <circle cx="50" cy="8" r="3.5" fill="#F59E0B" />
          <circle cx="44" cy="20" r="2.2" fill="#F59E0B" />
          <circle cx="56" cy="20" r="2.2" fill="#F59E0B" />
          <rect x="40" y="19" width="20" height="4" rx="2" fill="#F59E0B" />
        </g>
      )}
    </g>
  );
}

// ── DOG ────────────────────────────────────────────────────────────────────
function DogBody({ color, mood, stage, blinking }: PetBodyProps) {
  const eyeRy = blinking ? 0.8 : mood === "tired" ? 1.5 : mood === "happy" ? 6 : 5;
  const mouthD = mood === "happy"
    ? "M 40,56 Q 50,64 60,56"
    : mood === "sad"
    ? "M 40,59 Q 50,52 60,59"
    : "M 43,57 L 57,57";
  const sc = STAGE_SCALE[stage];

  return (
    <g transform={`translate(50,80) scale(${sc}) translate(-50,-80)`}>
      {/* Tail */}
      <path d="M 70,104 Q 86,88 80,72" stroke={color} strokeWidth="9" fill="none" strokeLinecap="round" />

      {/* Arms */}
      <ellipse cx="18" cy="88" rx="10" ry="16" fill={color} opacity="0.9" />
      <ellipse cx="82" cy="88" rx="10" ry="16" fill={color} opacity="0.9" />

      {/* Floppy ears (behind head) */}
      <ellipse cx="22" cy="52" rx="14" ry="22" fill={color} opacity="0.88" />
      <ellipse cx="78" cy="52" rx="14" ry="22" fill={color} opacity="0.88" />
      <ellipse cx="22" cy="52" rx="9" ry="17" fill={color} opacity="0.5" />
      <ellipse cx="78" cy="52" rx="9" ry="17" fill={color} opacity="0.5" />

      {/* Body */}
      <rect x="28" y="72" width="44" height="46" rx="14" fill={color} />
      <ellipse cx="50" cy="94" rx="13" ry="15" fill={WHITE} opacity="0.20" />

      {/* Legs */}
      <rect x="30" y="110" width="14" height="44" rx="7" fill={color} />
      <rect x="56" y="110" width="14" height="44" rx="7" fill={color} />
      <ellipse cx="37" cy="154" rx="9" ry="5.5" fill={color} />
      <ellipse cx="63" cy="154" rx="9" ry="5.5" fill={color} />

      {/* Head */}
      <circle cx="50" cy="46" r="28" fill={color} />

      {/* Snout */}
      <ellipse cx="50" cy="54" rx="14" ry="10" fill={WHITE} opacity="0.32" />
      {/* Nose */}
      <ellipse cx="50" cy="49" rx="7.5" ry="5.5" fill={DARK} />
      <circle cx="48" cy="48" r="1.8" fill={WHITE} opacity="0.45" />

      {/* Eyes */}
      <ellipse cx="39" cy="40" rx="5.5" ry={eyeRy} fill={DARK} />
      <ellipse cx="61" cy="40" rx="5.5" ry={eyeRy} fill={DARK} />
      {!blinking && <>
        <circle cx="41" cy="38" r="1.8" fill={WHITE} opacity="0.9" />
        <circle cx="63" cy="38" r="1.8" fill={WHITE} opacity="0.9" />
      </>}

      {/* Mouth */}
      <path d={mouthD} stroke={DARK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {mood === "happy" && (
        <ellipse cx="50" cy="64" rx="6" ry="5" fill="#F472B6" />
      )}

      {/* Stage 3: Star mark */}
      {stage === 3 && (
        <polygon
          points="50,4 52.5,12 60,12 54,16.5 56.5,24 50,19.5 43.5,24 46,16.5 40,12 47.5,12"
          fill="#F59E0B"
        />
      )}
    </g>
  );
}

// ── DRAGON ─────────────────────────────────────────────────────────────────
function DragonBody({ color, mood, stage, blinking }: PetBodyProps) {
  const eyeRy = blinking ? 0.8 : mood === "tired" ? 1.5 : 5;
  const mouthD = mood === "happy"
    ? "M 38,60 Q 50,70 62,60"
    : mood === "sad"
    ? "M 38,63 Q 50,55 62,63"
    : "M 40,61 L 60,61";
  const sc = STAGE_SCALE[stage];

  return (
    <g transform={`translate(50,80) scale(${sc}) translate(-50,-80)`}>
      {/* Wings (behind body) */}
      <path d="M 28,84 Q 6,60 10,32 Q 18,56 28,76 Z" fill={color} opacity="0.68" />
      <path d="M 72,84 Q 94,60 90,32 Q 82,56 72,76 Z" fill={color} opacity="0.68" />
      <path d="M 28,84 Q 6,60 10,32 Q 16,50 26,72 Z" fill={WHITE} opacity="0.10" />
      <path d="M 72,84 Q 94,60 90,32 Q 84,50 74,72 Z" fill={WHITE} opacity="0.10" />

      {/* Tail (spiky) */}
      <path d="M 68,118 C 90,108 95,86 82,68" stroke={color} strokeWidth="9" fill="none" strokeLinecap="round" />
      <polygon points="82,68 88,58 76,64" fill={color} />

      {/* Body */}
      <ellipse cx="50" cy="104" rx="21" ry="24" fill={color} />
      <ellipse cx="50" cy="104" rx="11" ry="14" fill={WHITE} opacity="0.15" />

      {/* Arms */}
      <ellipse cx="22" cy="92" rx="10" ry="16" fill={color} />
      <ellipse cx="78" cy="92" rx="10" ry="16" fill={color} />

      {/* Legs */}
      <rect x="31" y="120" width="14" height="36" rx="7" fill={color} />
      <rect x="55" y="120" width="14" height="36" rx="7" fill={color} />
      <ellipse cx="38" cy="156" rx="9" ry="5" fill={color} />
      <ellipse cx="62" cy="156" rx="9" ry="5" fill={color} />

      {/* Horns */}
      <polygon points="42,27 38,6 46,24" fill={color} />
      <polygon points="58,27 62,6 54,24" fill={color} />

      {/* Head */}
      <ellipse cx="50" cy="48" rx="29" ry="26" fill={color} />

      {/* Scale texture */}
      <circle cx="40" cy="52" r="4" fill={WHITE} opacity="0.09" />
      <circle cx="56" cy="44" r="3" fill={WHITE} opacity="0.09" />
      <circle cx="48" cy="60" r="4" fill={WHITE} opacity="0.09" />

      {/* Slit eyes */}
      <ellipse cx="40" cy="43" rx="6" ry={eyeRy} fill="#F59E0B" />
      <ellipse cx="60" cy="43" rx="6" ry={eyeRy} fill="#F59E0B" />
      <ellipse cx="40" cy="43" rx="2" ry={eyeRy} fill={DARK} />
      <ellipse cx="60" cy="43" rx="2" ry={eyeRy} fill={DARK} />

      {/* Nostrils */}
      <circle cx="46" cy="54" r="2" fill={DARK} opacity="0.3" />
      <circle cx="54" cy="54" r="2" fill={DARK} opacity="0.3" />

      {/* Mouth */}
      <path d={mouthD} stroke={DARK} strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Stage 3: Fire crown */}
      {stage === 3 && (
        <g>
          <ellipse cx="50" cy="5" rx="7" ry="9" fill="#F59E0B" opacity="0.92" />
          <ellipse cx="43" cy="10" rx="4.5" ry="6.5" fill="#EF4444" opacity="0.82" />
          <ellipse cx="57" cy="10" rx="4.5" ry="6.5" fill="#EF4444" opacity="0.82" />
        </g>
      )}
    </g>
  );
}

// ── BUNNY ──────────────────────────────────────────────────────────────────
function BunnyBody({ color, mood, stage, blinking }: PetBodyProps) {
  const eyeRy = blinking ? 0.8 : mood === "tired" ? 1.5 : mood === "happy" ? 6 : 5;
  const mouthD = mood === "happy"
    ? "M 40,61 Q 50,70 60,61"
    : mood === "sad"
    ? "M 40,64 Q 50,56 60,64"
    : "M 43,62 L 57,62";
  const sc = STAGE_SCALE[stage];

  return (
    <g transform={`translate(50,82) scale(${sc}) translate(-50,-82)`}>
      {/* Long ears */}
      <ellipse cx="35" cy="18" rx="10" ry="28" fill={color} />
      <ellipse cx="65" cy="18" rx="10" ry="28" fill={color} />
      <ellipse cx="35" cy="18" rx="6" ry="22" fill={PINK} opacity="0.58" />
      <ellipse cx="65" cy="18" rx="6" ry="22" fill={PINK} opacity="0.58" />

      {/* Fluffy tail */}
      <circle cx="80" cy="108" r="11" fill={WHITE} opacity="0.5" />
      <circle cx="80" cy="108" r="8" fill={WHITE} opacity="0.35" />

      {/* Arms */}
      <ellipse cx="18" cy="96" rx="9" ry="15" fill={color} />
      <ellipse cx="82" cy="96" rx="9" ry="15" fill={color} />

      {/* Body */}
      <ellipse cx="50" cy="108" rx="27" ry="26" fill={color} />
      <ellipse cx="50" cy="108" rx="14" ry="16" fill={WHITE} opacity="0.22" />

      {/* Stubby legs */}
      <ellipse cx="36" cy="132" rx="13" ry="10" fill={color} />
      <ellipse cx="64" cy="132" rx="13" ry="10" fill={color} />
      <ellipse cx="36" cy="140" rx="13" ry="7" fill={color} />
      <ellipse cx="64" cy="140" rx="13" ry="7" fill={color} />

      {/* Head */}
      <circle cx="50" cy="56" r="28" fill={color} />

      {/* Cheeks */}
      <circle cx="33" cy="64" r="7" fill={PINK} opacity="0.4" />
      <circle cx="67" cy="64" r="7" fill={PINK} opacity="0.4" />

      {/* Eyes */}
      <ellipse cx="40" cy="52" rx="5" ry={eyeRy} fill={DARK} />
      <ellipse cx="60" cy="52" rx="5" ry={eyeRy} fill={DARK} />
      {!blinking && <>
        <circle cx="42" cy="50" r="1.5" fill={WHITE} opacity="0.9" />
        <circle cx="62" cy="50" r="1.5" fill={WHITE} opacity="0.9" />
      </>}

      {/* Nose */}
      <ellipse cx="50" cy="60" rx="4" ry="2.5" fill={PINK} />
      {/* Mouth */}
      <path d={mouthD} stroke={DARK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <line x1="50" y1="62" x2="50" y2="66" stroke={DARK} strokeWidth="1.6" />

      {/* Stage 3: Halo */}
      {stage === 3 && (
        <ellipse cx="50" cy="5" rx="16" ry="5" fill="none" stroke="#F59E0B" strokeWidth="3" opacity="0.92" />
      )}
    </g>
  );
}

// ── AXOLOTL ────────────────────────────────────────────────────────────────
function AxolotlBody({ color, mood, stage, blinking }: PetBodyProps) {
  const eyeRy = blinking ? 0.8 : mood === "tired" ? 1.5 : mood === "happy" ? 6 : 5;
  const mouthD = mood === "happy"
    ? "M 36,57 Q 50,68 64,57"
    : mood === "sad"
    ? "M 36,62 Q 50,52 64,62"
    : "M 40,59 L 60,59";
  const sc = STAGE_SCALE[stage];

  return (
    <g transform={`translate(50,78) scale(${sc}) translate(-50,-78)`}>
      {/* Fin tail */}
      <path d="M 66,100 Q 86,96 90,108 Q 86,120 66,116 Z" fill={color} opacity="0.7" />

      {/* Body */}
      <ellipse cx="50" cy="100" rx="31" ry="24" fill={color} />
      <ellipse cx="50" cy="100" rx="16" ry="13" fill={WHITE} opacity="0.18" />

      {/* 4 stubby legs */}
      <ellipse cx="24" cy="112" rx="10" ry="14" fill={color} />
      <ellipse cx="76" cy="112" rx="10" ry="14" fill={color} />
      <ellipse cx="28" cy="130" rx="9" ry="12" fill={color} />
      <ellipse cx="72" cy="130" rx="9" ry="12" fill={color} />
      {/* Feet */}
      <ellipse cx="24" cy="126" rx="9" ry="5" fill={color} />
      <ellipse cx="76" cy="126" rx="9" ry="5" fill={color} />
      <ellipse cx="28" cy="142" rx="9" ry="5" fill={color} />
      <ellipse cx="72" cy="142" rx="9" ry="5" fill={color} />

      {/* Gill frills (left) */}
      <line x1="18" y1="40" x2="6" y2="22" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      <line x1="20" y1="45" x2="5" y2="34" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      <line x1="22" y1="51" x2="8" y2="46" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="6" cy="22" r="4" fill={PINK} />
      <circle cx="5" cy="34" r="4" fill={PINK} />
      <circle cx="8" cy="46" r="4" fill={PINK} />
      {/* Gill frills (right) */}
      <line x1="82" y1="40" x2="94" y2="22" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      <line x1="80" y1="45" x2="95" y2="34" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      <line x1="78" y1="51" x2="92" y2="46" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="94" cy="22" r="4" fill={PINK} />
      <circle cx="95" cy="34" r="4" fill={PINK} />
      <circle cx="92" cy="46" r="4" fill={PINK} />

      {/* Wide head */}
      <ellipse cx="50" cy="48" rx="33" ry="26" fill={color} />

      {/* Cheeks */}
      <circle cx="30" cy="56" r="8" fill={PINK} opacity="0.42" />
      <circle cx="70" cy="56" r="8" fill={PINK} opacity="0.42" />

      {/* Eyes */}
      <ellipse cx="38" cy="44" rx="6.5" ry={eyeRy} fill={DARK} />
      <ellipse cx="62" cy="44" rx="6.5" ry={eyeRy} fill={DARK} />
      {!blinking && <>
        <circle cx="40" cy="42" r="2" fill={WHITE} opacity="0.9" />
        <circle cx="64" cy="42" r="2" fill={WHITE} opacity="0.9" />
      </>}

      {/* Mouth */}
      <path d={mouthD} stroke={DARK} strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Stage 3: Crystal */}
      {stage === 3 && (
        <g>
          <polygon points="50,4 56,16 50,22 44,16" fill="#A5F3FC" opacity="0.92" />
          <polygon points="50,4 57,9 50,22 43,9" fill="#67E8F9" opacity="0.7" />
          <polygon points="50,4 53,10 50,14 47,10" fill={WHITE} opacity="0.4" />
        </g>
      )}
    </g>
  );
}

// ── PARTICLES ──────────────────────────────────────────────────────────────
interface Particle {
  id: number;
  x: number;
  y: number;
  symbol: string;
}

const ACTION_PARTICLES: Record<string, string[]> = {
  feed:  ["✦", "✦", "◆"],
  play:  ["★", "★", "✦"],
  clean: ["·", "◦", "·"],
  sleep: ["z", "Z", "z"],
};
const ACTION_COLORS: Record<string, string> = {
  feed:  "#F97316",
  play:  "#8B5CF6",
  clean: "#06B6D4",
  sleep: "#6366F1",
};

// ── MAIN EXPORT ────────────────────────────────────────────────────────────
const moodColors: Record<Mood, string> = {
  happy:   "from-violet-100 to-pink-100",
  neutral: "from-blue-50 to-violet-50",
  sad:     "from-gray-100 to-blue-100",
  tired:   "from-indigo-50 to-gray-100",
};
const moodLabel: Record<Mood, string> = {
  happy:   "Feeling great!",
  neutral: "Doing okay",
  sad:     "Feeling down...",
  tired:   "Very sleepy...",
};

export default function PetDisplay({ pet, isActing, size = 180 }: PetDisplayProps) {
  const [animClass, setAnimClass] = useState("pet-anim-bounce");
  const [blinking, setBlinking] = useState(false);
  const [floatingText, setFloatingText] = useState<{ text: string; key: number } | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blinkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Blinking system
  useEffect(() => {
    const scheduleBlink = () => {
      blinkIntervalRef.current = setInterval(() => {
        setBlinking(true);
        blinkTimerRef.current = setTimeout(() => setBlinking(false), 140);
      }, 3200 + Math.random() * 1800);
    };
    scheduleBlink();
    return () => {
      if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current);
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, []);

  // Action animation & floating text
  useEffect(() => {
    if (!isActing) {
      setAnimClass("pet-anim-bounce");
      setParticles([]);
      return;
    }

    const animMap: Record<string, string> = {
      feed:  "pet-anim-jump",
      play:  "pet-anim-spin",
      clean: "pet-anim-shimmy",
      sleep: "pet-anim-sleep",
    };
    const textMap: Record<string, string> = {
      feed:  "+25 Hunger",
      play:  "+20 Happy",
      clean: "+30 Clean",
      sleep: "+35 Energy",
    };
    const durations: Record<string, number> = {
      feed: 700, play: 900, clean: 750, sleep: 2400,
    };

    setAnimClass(animMap[isActing] ?? "pet-anim-pop");
    setFloatingText({ text: textMap[isActing] ?? "", key: Date.now() });

    // Spawn particles
    const syms = ACTION_PARTICLES[isActing] ?? ["✦"];
    const newParticles: Particle[] = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      x: 20 + Math.random() * 60,
      y: 10 + Math.random() * 60,
      symbol: syms[i % syms.length],
    }));
    setParticles(newParticles);

    const t1 = setTimeout(() => setFloatingText(null), 1600);
    const t2 = setTimeout(() => setParticles([]), 900);
    const t3 = setTimeout(() => {
      if (isActing !== "sleep") setAnimClass("pet-anim-bounce");
    }, durations[isActing] ?? 700);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isActing]);

  const decayedPet = applyDecay(pet);
  const mood = getMood(decayedPet);
  const health = getHealth(decayedPet);
  const stage = pet.stage;
  const stageName = getStageName(pet.species as any, stage);

  const bodyProps: PetBodyProps = { color: pet.color, mood, stage, blinking };

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
          className={`absolute rounded-full bg-gradient-to-br ${moodColors[mood]} opacity-60 blur-xl`}
          style={{ width: size * 1.1, height: size * 0.7 }}
        />

        {/* Pet SVG with animation class */}
        <div
          className={`relative z-10 ${animClass}`}
          data-testid="pet-display"
          style={{ transformOrigin: "center bottom" }}
        >
          <svg
            viewBox="0 0 100 160"
            width={size}
            height={size * 1.6}
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: "visible" }}
          >
            {pet.species === "cat"     && <CatBody     {...bodyProps} />}
            {pet.species === "dog"     && <DogBody     {...bodyProps} />}
            {pet.species === "dragon"  && <DragonBody  {...bodyProps} />}
            {pet.species === "bunny"   && <BunnyBody   {...bodyProps} />}
            {pet.species === "axolotl" && <AxolotlBody {...bodyProps} />}
          </svg>

          {/* Action particles */}
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute pointer-events-none font-bold text-sm"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                color: ACTION_COLORS[isActing ?? ""] ?? "#8B5CF6",
                animation: "floatUpFade 0.85s ease-out forwards",
              }}
            >
              {p.symbol}
            </div>
          ))}
        </div>

        {/* Floating stat text */}
        {floatingText && (
          <div
            key={floatingText.key}
            className="absolute -top-2 left-1/2 text-sm font-bold text-primary whitespace-nowrap pointer-events-none"
            style={{ animation: "floatUp 1.6s ease-out forwards" }}
          >
            {floatingText.text}
          </div>
        )}
      </div>

      {/* Name & mood */}
      <div className="text-center mt-1">
        <p className="text-xl font-bold text-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
          {pet.name}
        </p>
        <p className="text-xs text-muted-foreground">{moodLabel[mood]}</p>
      </div>

      {/* Health bar */}
      <div className="w-44 flex items-center gap-2">
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

// Export PetBodyProps + species SVGs for DressUp page
export type { PetBodyProps };
export { CatBody, DogBody, DragonBody, BunnyBody, AxolotlBody };
