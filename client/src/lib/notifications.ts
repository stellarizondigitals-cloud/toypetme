import { type User, type Pet } from "@shared/schema";

// Request notification permission from the browser
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.warn("This browser does not support desktop notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

// Check if notifications are supported and permissions granted
export function canShowNotifications(): boolean {
  return (
    "Notification" in window &&
    Notification.permission === "granted"
  );
}

// Send a browser notification
export function sendNotification(
  title: string,
  options?: NotificationOptions
): void {
  if (!canShowNotifications()) {
    return;
  }

  try {
    new Notification(title, {
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      ...options,
    });
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
}

// Check pet stats and send notifications if needed
export function checkPetNotifications(
  pet: Pet,
  user: User
): void {
  if (!user.notificationsEnabled || !canShowNotifications()) {
    return;
  }

  // Check hunger
  if (user.notifyHunger && pet.hunger < 30) {
    sendNotificationWithCooldown("🍕 Your pet is hungry!", {
      body: `${pet.name} needs food! Hunger is at ${pet.hunger}%`,
      tag: `hunger-${pet.id}`,
      requireInteraction: false,
    });
  }

  // Check happiness
  if (user.notifyHappiness && pet.happiness < 30) {
    sendNotificationWithCooldown("😢 Your pet is sad!", {
      body: `${pet.name} needs attention! Happiness is at ${pet.happiness}%`,
      tag: `happiness-${pet.id}`,
      requireInteraction: false,
    });
  }

  // Check evolution readiness
  if (user.notifyEvolution && isReadyToEvolve(pet)) {
    sendNotificationWithCooldown("✨ Evolution Available!", {
      body: `${pet.name} is ready to evolve to the next stage!`,
      tag: `evolution-${pet.id}`,
      requireInteraction: true,
    });
  }
}

// Check if pet is ready to evolve
function isReadyToEvolve(pet: Pet): boolean {
  const evolutionThresholds = [
    { stage: 0, minXP: 100 },  // Baby to Child
    { stage: 1, minXP: 300 },  // Child to Teen
    { stage: 2, minXP: 600 },  // Teen to Adult
  ];

  const threshold = evolutionThresholds.find(t => t.stage === pet.evolutionStage);
  return threshold ? pet.xp >= threshold.minXP : false;
}

// Check for daily challenges notification
export function checkDailyChallengesNotification(
  user: User,
  hasUnclaimedChallenges: boolean
): void {
  if (!user.notificationsEnabled || !user.notifyChallenges || !canShowNotifications()) {
    return;
  }

  if (hasUnclaimedChallenges) {
    sendNotificationWithCooldown("🏆 Daily Challenges Available!", {
      body: "New challenges are ready! Complete them to earn rewards.",
      tag: "daily-challenges",
      requireInteraction: true,
    });
  }
}

// Store the last notification time to prevent spam
const notificationCooldowns = new Map<string, number>();
const NOTIFICATION_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

export function shouldSendNotification(tag: string): boolean {
  const now = Date.now();
  const lastSent = notificationCooldowns.get(tag);

  if (lastSent && now - lastSent < NOTIFICATION_COOLDOWN_MS) {
    return false;
  }

  notificationCooldowns.set(tag, now);
  return true;
}

// Enhanced notification sender with cooldown
export function sendNotificationWithCooldown(
  title: string,
  options?: NotificationOptions
): void {
  const tag = options?.tag || title;

  if (!shouldSendNotification(tag)) {
    return;
  }

  sendNotification(title, options);
}
