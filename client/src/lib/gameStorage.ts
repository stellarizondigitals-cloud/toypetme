export type Species = "cat" | "dog" | "dragon" | "bunny" | "axolotl";

export interface Pet {
  id: string;
  name: string;
  species: Species;
  color: string;
  stage: number; // 0=baby 1=kid 2=teen 3=adult
  level: number; // 1-50
  xp: number;
  hunger: number; // 0-100
  happiness: number;
  energy: number;
  cleanliness: number;
  lastFed: number;
  lastPlayed: number;
  lastCleaned: number;
  lastSlept: number;
  birthday: number;
  feedCount: number;
  playCount: number;
  cleanCount: number;
  sleepCount: number;
}

export interface Achievement {
  id: string;
  unlockedAt: number;
}

export interface GameState {
  pets: Pet[];
  activePetId: string | null;
  coins: number;
  totalXP: number;
  achievements: Achievement[];
  dailyStreak: number;
  lastLoginDate: string;
  highScores: { [game: string]: number };
  tutorialDone: boolean;
  totalActions: number;
  createdAt: number;
  lastShareDate: string;
}

const STORAGE_KEY = "toypetme_v2";

const XP_TO_LEVEL = (level: number) => level * 50;
const STAGE_LEVELS = [1, 5, 15, 30];

// Stat decay: points per millisecond
const DECAY_RATES = {
  hunger: 2 / (60 * 60 * 1000),      // 2 pts per hour
  happiness: 1.5 / (60 * 60 * 1000),  // 1.5 pts per hour
  energy: 1 / (60 * 60 * 1000),       // 1 pt per hour
  cleanliness: 1 / (60 * 60 * 1000),  // 1 pt per hour
};

// Action cooldowns in ms
export const COOLDOWNS = {
  feed: 5 * 60 * 1000,   // 5 min
  play: 3 * 60 * 1000,   // 3 min
  clean: 10 * 60 * 1000, // 10 min
  sleep: 15 * 60 * 1000, // 15 min
};

export function defaultState(): GameState {
  return {
    pets: [],
    activePetId: null,
    coins: 100,
    totalXP: 0,
    achievements: [],
    dailyStreak: 0,
    lastLoginDate: "",
    highScores: {},
    tutorialDone: false,
    totalActions: 0,
    createdAt: Date.now(),
    lastShareDate: "",
  };
}

export function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const state = JSON.parse(raw) as GameState;
    // Apply stat decay to all pets
    state.pets = state.pets.map(applyDecay);
    return state;
  } catch {
    return defaultState();
  }
}

export function saveState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or unavailable
  }
}

export function applyDecay(pet: Pet): Pet {
  const now = Date.now();
  const decay = (lastTime: number, rate: number) =>
    Math.max(0, (now - lastTime) * rate);

  return {
    ...pet,
    hunger: Math.max(0, pet.hunger - decay(pet.lastFed, DECAY_RATES.hunger)),
    happiness: Math.max(0, pet.happiness - decay(pet.lastPlayed, DECAY_RATES.happiness)),
    energy: Math.max(0, pet.energy - decay(pet.lastSlept, DECAY_RATES.energy)),
    cleanliness: Math.max(0, pet.cleanliness - decay(pet.lastCleaned, DECAY_RATES.cleanliness)),
  };
}

export function getHealth(pet: Pet): number {
  return Math.round((pet.hunger + pet.happiness + pet.energy + pet.cleanliness) / 4);
}

export function createPet(name: string, species: Species, color: string): Pet {
  const now = Date.now();
  return {
    id: Math.random().toString(36).slice(2),
    name,
    species,
    color,
    stage: 0,
    level: 1,
    xp: 0,
    hunger: 80,
    happiness: 80,
    energy: 80,
    cleanliness: 80,
    lastFed: now,
    lastPlayed: now,
    lastCleaned: now,
    lastSlept: now,
    birthday: now,
    feedCount: 0,
    playCount: 0,
    cleanCount: 0,
    sleepCount: 0,
  };
}

export type ActionType = "feed" | "play" | "clean" | "sleep";

export interface ActionResult {
  success: boolean;
  reason?: string;
  coinsEarned: number;
  xpEarned: number;
  leveledUp: boolean;
  evolved: boolean;
  pet: Pet;
  newAchievements: string[];
}

export function performAction(
  state: GameState,
  petId: string,
  action: ActionType
): { state: GameState; result: ActionResult } {
  const petIndex = state.pets.findIndex((p) => p.id === petId);
  if (petIndex === -1) {
    return {
      state,
      result: { success: false, reason: "Pet not found", coinsEarned: 0, xpEarned: 0, leveledUp: false, evolved: false, pet: state.pets[0], newAchievements: [] },
    };
  }

  let pet = applyDecay(state.pets[petIndex]);
  const now = Date.now();

  // Check cooldown
  const lastTime = {
    feed: pet.lastFed,
    play: pet.lastPlayed,
    clean: pet.lastCleaned,
    sleep: pet.lastSlept,
  }[action];

  if (now - lastTime < COOLDOWNS[action]) {
    const remaining = Math.ceil((COOLDOWNS[action] - (now - lastTime)) / 1000);
    return {
      state: { ...state, pets: state.pets.map((p, i) => (i === petIndex ? pet : p)) },
      result: { success: false, reason: `Wait ${remaining}s`, coinsEarned: 0, xpEarned: 0, leveledUp: false, evolved: false, pet, newAchievements: [] },
    };
  }

  // Apply action effects
  const effects: Record<ActionType, Partial<Pet> & { coins: number; xp: number }> = {
    feed:  { hunger: Math.min(100, pet.hunger + 25), lastFed: now, feedCount: pet.feedCount + 1, coins: 8, xp: 12 },
    play:  { happiness: Math.min(100, pet.happiness + 20), energy: Math.max(0, pet.energy - 8), lastPlayed: now, playCount: pet.playCount + 1, coins: 10, xp: 15 },
    clean: { cleanliness: Math.min(100, pet.cleanliness + 30), lastCleaned: now, cleanCount: pet.cleanCount + 1, coins: 6, xp: 8 },
    sleep: { energy: Math.min(100, pet.energy + 35), happiness: Math.min(100, pet.happiness + 5), lastSlept: now, sleepCount: pet.sleepCount + 1, coins: 5, xp: 10 },
  };

  const effect = effects[action];
  const coinsEarned = effect.coins as number;
  const xpEarned = effect.xp as number;
  const { coins: _c, xp: _x, ...statUpdates } = effect;

  pet = { ...pet, ...statUpdates, xp: pet.xp + xpEarned };

  // Level up
  let leveledUp = false;
  while (pet.xp >= XP_TO_LEVEL(pet.level)) {
    pet = { ...pet, xp: pet.xp - XP_TO_LEVEL(pet.level), level: pet.level + 1 };
    leveledUp = true;
  }

  // Evolution check
  let evolved = false;
  const newStage = STAGE_LEVELS.findIndex((l) => pet.level < l) - 1;
  const targetStage = newStage === -1 ? 3 : Math.max(0, newStage);
  if (targetStage > pet.stage) {
    pet = { ...pet, stage: targetStage };
    evolved = true;
  }

  const newCoins = Math.min(9999, state.coins + coinsEarned);
  const newTotalXP = state.totalXP + xpEarned;
  const newTotalActions = state.totalActions + 1;

  const newPets = state.pets.map((p, i) => (i === petIndex ? pet : p));

  // Check achievements
  const newAchievements = checkAchievements(
    { ...state, pets: newPets, coins: newCoins, totalXP: newTotalXP, totalActions: newTotalActions },
    pet, action, evolved, leveledUp
  ).filter((a) => !state.achievements.some((existing) => existing.id === a));

  const updatedState: GameState = {
    ...state,
    pets: newPets,
    coins: newCoins,
    totalXP: newTotalXP,
    totalActions: newTotalActions,
    achievements: [
      ...state.achievements,
      ...newAchievements.map((id) => ({ id, unlockedAt: Date.now() })),
    ],
  };

  return {
    state: updatedState,
    result: { success: true, coinsEarned, xpEarned, leveledUp, evolved, pet, newAchievements },
  };
}

function checkAchievements(state: GameState, pet: Pet, action: ActionType, evolved: boolean, leveledUp: boolean): string[] {
  const earned: string[] = [];
  const has = (id: string) => state.achievements.some((a) => a.id === id);

  if (!has("first_action")) earned.push("first_action");
  if (pet.feedCount >= 10 && !has("hungry_10")) earned.push("hungry_10");
  if (pet.feedCount >= 50 && !has("hungry_50")) earned.push("hungry_50");
  if (pet.playCount >= 10 && !has("playful_10")) earned.push("playful_10");
  if (pet.playCount >= 50 && !has("playful_50")) earned.push("playful_50");
  if (pet.cleanCount >= 10 && !has("clean_10")) earned.push("clean_10");
  if (evolved && !has("first_evolution")) earned.push("first_evolution");
  if (pet.stage === 3 && !has("adult_stage")) earned.push("adult_stage");
  if (pet.level >= 5 && !has("level_5")) earned.push("level_5");
  if (pet.level >= 10 && !has("level_10")) earned.push("level_10");
  if (pet.level >= 20 && !has("level_20")) earned.push("level_20");
  if (pet.level >= 30 && !has("level_30")) earned.push("level_30");
  if (state.coins >= 500 && !has("coins_500")) earned.push("coins_500");
  if (state.coins >= 1000 && !has("coins_1000")) earned.push("coins_1000");
  if (state.totalActions >= 100 && !has("actions_100")) earned.push("actions_100");
  if (state.pets.length >= 2 && !has("two_pets")) earned.push("two_pets");
  if (state.pets.length >= 5 && !has("five_pets")) earned.push("five_pets");
  const speciesOwned = new Set(state.pets.map((p) => p.species)).size;
  if (speciesOwned >= 3 && !has("collector_3")) earned.push("collector_3");
  if (speciesOwned >= 5 && !has("collector_all")) earned.push("collector_all");
  if (state.dailyStreak >= 3 && !has("streak_3")) earned.push("streak_3");
  if (state.dailyStreak >= 7 && !has("streak_7")) earned.push("streak_7");

  return earned;
}

export function checkDailyLogin(state: GameState): { state: GameState; isNew: boolean; bonus: number } {
  const today = new Date().toDateString();
  if (state.lastLoginDate === today) return { state, isNew: false, bonus: 0 };

  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const newStreak = state.lastLoginDate === yesterday ? state.dailyStreak + 1 : 1;

  const bonusMap: Record<number, number> = { 1: 50, 3: 100, 7: 200, 14: 500, 30: 1000 };
  const bonus = bonusMap[newStreak] ?? 30;

  return {
    state: {
      ...state,
      lastLoginDate: today,
      dailyStreak: newStreak,
      coins: Math.min(9999, state.coins + bonus),
    },
    isNew: true,
    bonus,
  };
}

export function getCooldownRemaining(pet: Pet, action: ActionType): number {
  const lastTime = { feed: pet.lastFed, play: pet.lastPlayed, clean: pet.lastCleaned, sleep: pet.lastSlept }[action];
  return Math.max(0, COOLDOWNS[action] - (Date.now() - lastTime));
}

export function formatCooldown(ms: number): string {
  if (ms <= 0) return "";
  const s = Math.ceil(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.ceil(s / 60)}m`;
}

export function updateHighScore(state: GameState, game: string, score: number): GameState {
  const current = state.highScores[game] ?? 0;
  if (score <= current) return state;

  const newAchievements = [...state.achievements];
  const achievementId = `${game}_score_${score >= 50 ? "50" : score >= 20 ? "20" : "10"}`;
  if (score >= 10 && !newAchievements.some((a) => a.id === `${game}_score_10`)) {
    newAchievements.push({ id: `${game}_score_10`, unlockedAt: Date.now() });
  }
  if (score >= 50 && !newAchievements.some((a) => a.id === `${game}_score_50`)) {
    newAchievements.push({ id: `${game}_score_50`, unlockedAt: Date.now() });
  }

  return { ...state, highScores: { ...state.highScores, [game]: score }, achievements: newAchievements };
}
