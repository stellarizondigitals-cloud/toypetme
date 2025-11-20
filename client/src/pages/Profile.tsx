import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { type User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import GameHeader from "@/components/GameHeader";
import BottomTabNav from "@/components/BottomTabNav";
import { format } from "date-fns";
import { Bell } from "lucide-react";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout"),
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Logged out",
        description: "You've been logged out successfully.",
      });
      setLocation("/login");
    },
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: (preferences: Partial<User>) => 
      apiRequest("PATCH", "/api/user/notifications", preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Settings updated",
        description: "Your notification preferences have been saved.",
      });
    },
  });

  const handleNotificationToggle = (key: keyof User, value: boolean) => {
    updateNotificationsMutation.mutate({ [key]: value });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Please log in</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <GameHeader coins={user.coins} gems={user.gems} premium={user.premium} notifications={0} />
      
      <div className="max-w-2xl mx-auto p-4 pb-24">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-outfit">Profile</CardTitle>
            <CardDescription>
              Your account information and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Username
                </label>
                <p className="text-lg font-semibold" data-testid="text-username">
                  {user.username}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <p className="text-lg" data-testid="text-email">
                  {user.email}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Member Since
                </label>
                <p className="text-lg" data-testid="text-join-date">
                  {format(new Date(user.createdAt), "MMMM d, yyyy")}
                </p>
              </div>

              <div className="pt-4 border-t">
                <label className="text-sm font-medium text-muted-foreground">
                  Game Stats
                </label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">
                      {user.coins}
                    </p>
                    <p className="text-sm text-muted-foreground">Coins</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">
                      {user.gems}
                    </p>
                    <p className="text-sm text-muted-foreground">Gems</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-pink-600">
                      {user.dailyStreak}
                    </p>
                    <p className="text-sm text-muted-foreground">Day Streak</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <CardTitle className="text-xl font-outfit">Notifications</CardTitle>
            </div>
            <CardDescription>
              Manage your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications-enabled" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium">Enable Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Master toggle for all notifications
                  </p>
                </div>
              </Label>
              <Switch
                id="notifications-enabled"
                checked={user.notificationsEnabled}
                onCheckedChange={(checked) => handleNotificationToggle('notificationsEnabled', checked)}
                disabled={updateNotificationsMutation.isPending}
                data-testid="switch-notifications-enabled"
              />
            </div>

            {user.notificationsEnabled && (
              <>
                <div className="h-px bg-border" />
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="notify-hunger" className="flex-1 cursor-pointer">
                    <div>
                      <p className="font-medium">Hungry Pet</p>
                      <p className="text-sm text-muted-foreground">
                        Alert when pet is hungry (hunger &lt; 30%)
                      </p>
                    </div>
                  </Label>
                  <Switch
                    id="notify-hunger"
                    checked={user.notifyHunger}
                    onCheckedChange={(checked) => handleNotificationToggle('notifyHunger', checked)}
                    disabled={updateNotificationsMutation.isPending}
                    data-testid="switch-notify-hunger"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="notify-happiness" className="flex-1 cursor-pointer">
                    <div>
                      <p className="font-medium">Sad Pet</p>
                      <p className="text-sm text-muted-foreground">
                        Alert when pet is sad (happiness &lt; 30%)
                      </p>
                    </div>
                  </Label>
                  <Switch
                    id="notify-happiness"
                    checked={user.notifyHappiness}
                    onCheckedChange={(checked) => handleNotificationToggle('notifyHappiness', checked)}
                    disabled={updateNotificationsMutation.isPending}
                    data-testid="switch-notify-happiness"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="notify-challenges" className="flex-1 cursor-pointer">
                    <div>
                      <p className="font-medium">Daily Challenges</p>
                      <p className="text-sm text-muted-foreground">
                        Notify when new challenges are available
                      </p>
                    </div>
                  </Label>
                  <Switch
                    id="notify-challenges"
                    checked={user.notifyChallenges}
                    onCheckedChange={(checked) => handleNotificationToggle('notifyChallenges', checked)}
                    disabled={updateNotificationsMutation.isPending}
                    data-testid="switch-notify-challenges"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="notify-evolution" className="flex-1 cursor-pointer">
                    <div>
                      <p className="font-medium">Evolution Ready</p>
                      <p className="text-sm text-muted-foreground">
                        Alert when your pet is ready to evolve
                      </p>
                    </div>
                  </Label>
                  <Switch
                    id="notify-evolution"
                    checked={user.notifyEvolution}
                    onCheckedChange={(checked) => handleNotificationToggle('notifyEvolution', checked)}
                    disabled={updateNotificationsMutation.isPending}
                    data-testid="switch-notify-evolution"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardContent className="pt-6">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              {logoutMutation.isPending ? "Logging out..." : "Log Out"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomTabNav />
    </div>
  );
}
