import type { Species } from "./gameStorage";

export interface PetSpeciesData {
  id: Species;
  name: string;
  tagline: string;
  description: string;
  colors: { id: string; hex: string; name: string }[];
  stageNames: [string, string, string, string];
  personality: string;
}

export const PET_SPECIES: PetSpeciesData[] = [
  {
    id: "cat",
    name: "Mystic Cat",
    tagline: "Mysterious & Magical",
    description: "A magical feline with glowing eyes and cosmic powers. Loves naps and midnight adventures.",
    colors: [
      { id: "orange", hex: "#F97316", name: "Ember" },
      { id: "purple", hex: "#8B5CF6", name: "Mystic" },
      { id: "gray", hex: "#6B7280", name: "Shadow" },
      { id: "pink", hex: "#EC4899", name: "Blossom" },
    ],
    stageNames: ["Kitten", "Cat", "Elder Cat", "Cosmic Cat"],
    personality: "Curious",
  },
  {
    id: "dog",
    name: "Star Pup",
    tagline: "Loyal & Energetic",
    description: "A cheerful pup born from stardust. Always excited to play and never stops wagging its tail.",
    colors: [
      { id: "golden", hex: "#EAB308", name: "Golden" },
      { id: "brown", hex: "#92400E", name: "Cocoa" },
      { id: "white", hex: "#E5E7EB", name: "Snowball" },
      { id: "blue", hex: "#3B82F6", name: "Galaxy" },
    ],
    stageNames: ["Puppy", "Pup", "Dog", "Star Hound"],
    personality: "Playful",
  },
  {
    id: "dragon",
    name: "Fire Drake",
    tagline: "Fierce & Ancient",
    description: "A legendary dragon hatchling with immense potential. Becomes more powerful with every evolution.",
    colors: [
      { id: "red", hex: "#EF4444", name: "Inferno" },
      { id: "green", hex: "#10B981", name: "Forest" },
      { id: "blue", hex: "#3B82F6", name: "Frost" },
      { id: "gold", hex: "#F59E0B", name: "Aurum" },
    ],
    stageNames: ["Egg", "Hatchling", "Drake", "Elder Dragon"],
    personality: "Fierce",
  },
  {
    id: "bunny",
    name: "Moon Bunny",
    tagline: "Sweet & Speedy",
    description: "A fluffy bunny that hops between moonbeams. Loves carrots and racing at lightning speed.",
    colors: [
      { id: "white", hex: "#F3F4F6", name: "Luna" },
      { id: "pink", hex: "#F472B6", name: "Sakura" },
      { id: "lavender", hex: "#A78BFA", name: "Lavender" },
      { id: "caramel", hex: "#D97706", name: "Caramel" },
    ],
    stageNames: ["Bunling", "Bunny", "Swift Hare", "Moon Rabbit"],
    personality: "Gentle",
  },
  {
    id: "axolotl",
    name: "Crystal Axolotl",
    tagline: "Rare & Mystical",
    description: "An ultra-rare aquatic creature with regenerative powers and crystalline gills. The rarest pet in ToyPetMe!",
    colors: [
      { id: "pink", hex: "#FB7185", name: "Rosy" },
      { id: "cyan", hex: "#22D3EE", name: "Aqua" },
      { id: "gold", hex: "#FBBF24", name: "Golden" },
      { id: "purple", hex: "#C084FC", name: "Amethyst" },
    ],
    stageNames: ["Larva", "Axolotl", "Crystal Axo", "Divine Axolotl"],
    personality: "Rare",
  },
];

export const ACHIEVEMENTS: {
  id: string;
  name: string;
  description: string;
  icon: string;
  reward: number;
}[] = [
  { id: "first_action", name: "First Steps", description: "Perform your first action", icon: "⭐", reward: 10 },
  { id: "hungry_10", name: "Feeding Time", description: "Feed your pet 10 times", icon: "🍖", reward: 20 },
  { id: "hungry_50", name: "Master Chef", description: "Feed your pet 50 times", icon: "🍱", reward: 100 },
  { id: "playful_10", name: "Playful Partner", description: "Play with your pet 10 times", icon: "🎮", reward: 20 },
  { id: "playful_50", name: "Play Champion", description: "Play with your pet 50 times", icon: "🏆", reward: 100 },
  { id: "clean_10", name: "Spotless", description: "Clean your pet 10 times", icon: "✨", reward: 20 },
  { id: "first_evolution", name: "Growing Up!", description: "Evolve your pet for the first time", icon: "🌟", reward: 50 },
  { id: "adult_stage", name: "All Grown Up", description: "Reach the Adult stage", icon: "👑", reward: 200 },
  { id: "level_5", name: "Level 5", description: "Reach level 5", icon: "5️⃣", reward: 25 },
  { id: "level_10", name: "Level 10", description: "Reach level 10", icon: "🔟", reward: 50 },
  { id: "level_20", name: "Level 20", description: "Reach level 20", icon: "💪", reward: 150 },
  { id: "level_30", name: "Legend", description: "Reach level 30", icon: "🌈", reward: 500 },
  { id: "coins_500", name: "Rich Pet", description: "Accumulate 500 coins", icon: "💰", reward: 0 },
  { id: "coins_1000", name: "Millionaire Pet", description: "Accumulate 1000 coins", icon: "💎", reward: 50 },
  { id: "actions_100", name: "Dedicated", description: "Perform 100 total actions", icon: "🎯", reward: 100 },
  { id: "two_pets", name: "Pet Family", description: "Own 2 pets", icon: "🐾", reward: 50 },
  { id: "five_pets", name: "Shelter", description: "Own 5 pets", icon: "🏠", reward: 200 },
  { id: "collector_3", name: "Collector", description: "Own 3 different species", icon: "📦", reward: 100 },
  { id: "collector_all", name: "Master Collector", description: "Own all 5 species", icon: "🦄", reward: 500 },
  { id: "streak_3", name: "3-Day Streak", description: "Log in 3 days in a row", icon: "🔥", reward: 50 },
  { id: "streak_7", name: "Week Warrior", description: "Log in 7 days in a row", icon: "🔥🔥", reward: 200 },
  { id: "tap_score_10", name: "Tapper", description: "Score 10+ in Tap Rush", icon: "👆", reward: 25 },
  { id: "tap_score_50", name: "Tap Master", description: "Score 50+ in Tap Rush", icon: "⚡", reward: 100 },
  { id: "memory_score_10", name: "Memory Starter", description: "Score 10+ in Memory Match", icon: "🧠", reward: 25 },
  { id: "memory_score_50", name: "Memory Master", description: "Score 50+ in Memory Match", icon: "🧠✨", reward: 100 },
  { id: "catch_score_10", name: "Food Catcher", description: "Score 10+ in Feed Frenzy", icon: "🍎", reward: 25 },
  { id: "catch_score_50", name: "Frenzy Master", description: "Score 50+ in Feed Frenzy", icon: "🍱", reward: 100 },
];

export function getSpeciesData(species: Species): PetSpeciesData {
  return PET_SPECIES.find((s) => s.id === species) ?? PET_SPECIES[0];
}

export function getStageName(species: Species, stage: number): string {
  return getSpeciesData(species).stageNames[stage] ?? "Unknown";
}

export const PET_NAME_SUGGESTIONS: Record<Species, string[]> = {
  cat: ["Luna", "Shadow", "Midnight", "Stella", "Nova", "Ember"],
  dog: ["Max", "Buddy", "Charlie", "Zigzag", "Comet", "Sparky"],
  dragon: ["Blaze", "Ember", "Inferno", "Azure", "Frost", "Aurum"],
  bunny: ["Daisy", "Clover", "Snowball", "Pebbles", "Cotton", "Mochi"],
  axolotl: ["Crystal", "Aqua", "Pixel", "Gem", "Ripple", "Shimmer"],
};
