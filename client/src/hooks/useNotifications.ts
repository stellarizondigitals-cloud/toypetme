import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { type User, type Pet } from "@shared/schema";
import {
  requestNotificationPermission,
  checkPetNotifications,
  checkDailyChallengesNotification,
  sendNotificationWithCooldown,
} from "@/lib/notifications";

// Hook to manage notification permissions and monitoring
export function useNotifications() {
  const permissionRequested = useRef(false);
  const monitoringInterval = useRef<NodeJS.Timeout | null>(null);

  // Get current user data
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  // Get user's pets
  const { data: pets } = useQuery<Pet[]>({
    queryKey: ["/api/pets"],
  });

  // Request permission on first visit
  useEffect(() => {
    if (!permissionRequested.current && user?.notificationsEnabled) {
      requestNotificationPermission().catch(console.error);
      permissionRequested.current = true;
    }
  }, [user?.notificationsEnabled]);

  // Start monitoring pet stats
  useEffect(() => {
    if (!user || !user.notificationsEnabled || !pets || pets.length === 0) {
      // Clear interval if notifications are disabled
      if (monitoringInterval.current) {
        clearInterval(monitoringInterval.current);
        monitoringInterval.current = null;
      }
      return;
    }

    // Check notifications immediately
    pets.forEach((pet) => checkPetNotifications(pet, user));

    // Set up periodic checking (every 5 minutes)
    if (!monitoringInterval.current) {
      monitoringInterval.current = setInterval(() => {
        pets.forEach((pet) => checkPetNotifications(pet, user));
      }, 5 * 60 * 1000);
    }

    // Clean up interval on unmount
    return () => {
      if (monitoringInterval.current) {
        clearInterval(monitoringInterval.current);
        monitoringInterval.current = null;
      }
    };
  }, [user, pets]);

  // Send welcome notification on first login (if notifications enabled)
  useEffect(() => {
    if (user?.notificationsEnabled && pets && pets.length > 0) {
      const hasSeenWelcome = localStorage.getItem("notificationWelcome");
      if (!hasSeenWelcome) {
        setTimeout(() => {
          sendNotificationWithCooldown("Welcome to ToyPetMe!", {
            body: "Notifications are enabled! We'll remind you when your pets need attention.",
            tag: "welcome",
          });
          localStorage.setItem("notificationWelcome", "true");
        }, 2000);
      }
    }
  }, [user?.notificationsEnabled, pets]);
}

// Hook to check and notify about daily challenges
export function useChallengeNotifications() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: challenges } = useQuery<any[]>({
    queryKey: ["/api/challenges/daily"],
  });

  useEffect(() => {
    if (!user || !challenges) return;

    // Check if there are unclaimed completed challenges
    const hasUnclaimedChallenges = challenges.some(
      (c) => c.completed && !c.claimed
    );

    if (hasUnclaimedChallenges) {
      checkDailyChallengesNotification(user, true);
    }
  }, [user, challenges]);
}
