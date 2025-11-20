import type { Pet } from "@shared/schema";
import {
  PET_COLORS,
  PET_PATTERNS,
  MUTATION_COLORS,
  MUTATION_PATTERNS,
  MUTATION_CHANCE,
} from "@shared/schema";

// Helper to randomly select from an array
function randomChoice<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper to randomly select from two options with equal probability
function randomParent<T>(parent1: T, parent2: T): T {
  return Math.random() < 0.5 ? parent1 : parent2;
}

// Check if mutation should occur (5% chance)
function shouldMutate(): boolean {
  return Math.random() < MUTATION_CHANCE;
}

// Generate genetic traits for a new pet based on parents
export function inheritTraits(parent1: Pet, parent2: Pet): {
  color: string;
  pattern: string;
  isMutation: boolean;
  type: string;
} {
  // Check for mutation
  const isMutation = shouldMutate();
  
  let color: string;
  let pattern: string;
  
  if (isMutation) {
    // Special mutation - rare traits!
    color = randomChoice(MUTATION_COLORS);
    pattern = randomChoice(MUTATION_PATTERNS);
  } else {
    // Normal inheritance - randomly inherit from either parent
    // 50% chance to inherit from parent1, 50% from parent2
    color = randomParent(parent1.color, parent2.color);
    pattern = randomParent(parent1.pattern, parent2.pattern);
    
    // Small chance (10%) for a new natural color/pattern combination
    if (Math.random() < 0.1) {
      color = randomChoice(PET_COLORS);
    }
    if (Math.random() < 0.1) {
      pattern = randomChoice(PET_PATTERNS);
    }
  }
  
  // Type is always inherited from one of the parents
  const type = randomParent(parent1.type, parent2.type);
  
  return {
    color,
    pattern,
    isMutation,
    type,
  };
}

// Generate default random traits for non-bred pets
export function generateRandomTraits(): {
  color: string;
  pattern: string;
} {
  return {
    color: randomChoice(PET_COLORS),
    pattern: randomChoice(PET_PATTERNS),
  };
}

// Generate a cute name for a baby pet
export function generateBabyName(): string {
  const prefixes = [
    "Tiny", "Baby", "Little", "Mini", "Sweet", "Cute", "Precious",
    "Lovely", "Fluffy", "Fuzzy", "Soft", "Snuggly"
  ];
  
  const suffixes = [
    "Bean", "Puff", "Star", "Moon", "Cloud", "Joy", "Love",
    "Heart", "Angel", "Bud", "Dot", "Pip"
  ];
  
  return `${randomChoice(prefixes)} ${randomChoice(suffixes)}`;
}

// Get a description of the pet's genetics for display
export function getGeneticDescription(pet: Pet): string {
  const colorDesc = pet.color.charAt(0).toUpperCase() + pet.color.slice(1);
  const patternDesc = pet.pattern.charAt(0).toUpperCase() + pet.pattern.slice(1);
  
  if (pet.isMutation) {
    return `✨ RARE MUTATION: ${colorDesc} with ${patternDesc}! ✨`;
  }
  
  return `${colorDesc} ${patternDesc}`;
}
