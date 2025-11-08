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
import { useToast } from "@/hooks/use-toast";
import GameHeader from "@/components/GameHeader";
import BottomTabNav from "@/components/BottomTabNav";
import { format } from "date-fns";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
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
      <GameHeader coins={user.coins} gems={user.gems} notifications={0} />
      
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

            <div className="pt-4">
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                data-testid="button-logout"
              >
                {logoutMutation.isPending ? "Logging out..." : "Log Out"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomTabNav />
    </div>
  );
}
