import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Coins, Sparkles, Target, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import BottomTabNav from "@/components/BottomTabNav";

type Challenge = {
  id: string;
  type: string;
  title: string;
  description: string;
  target: number;
  coinReward: number;
  xpReward: number;
};

type UserChallenge = {
  id: string;
  userId: string;
  challengeId: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
  assignedDate: Date;
  completedAt: Date | null;
  claimedAt: Date | null;
  challenge: Challenge;
};

export default function Challenges() {
  const { toast } = useToast();

  const { data: challenges = [], isLoading } = useQuery<UserChallenge[]>({
    queryKey: ["/api/challenges/daily"],
  });

  const claimRewardMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      return await apiRequest(`/api/challenges/${challengeId}/claim`, "POST") as unknown as { user: any; challenge: UserChallenge };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenges/daily"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pet"] });
      
      const coinReward = data.challenge?.challenge?.coinReward || 0;
      toast({
        title: "Reward Claimed!",
        description: `You earned ${coinReward} coins!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to claim reward",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case "feed":
        return "🍎";
      case "play":
        return "🎮";
      case "clean":
        return "✨";
      case "happiness":
        return "😊";
      case "health":
        return "💚";
      case "energy":
        return "⚡";
      default:
        return "🎯";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading challenges...</p>
        </div>
      </div>
    );
  }

  const completedCount = challenges.filter(c => c.completed).length;

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Daily Challenges</h1>
          </div>
          <p className="text-muted-foreground">
            Complete challenges to earn bonus rewards!
          </p>
        </motion.div>

        {/* Progress Summary */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Today's Progress</p>
                  <p className="text-2xl font-bold">{completedCount} / {challenges.length}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <span className="text-sm text-muted-foreground">Challenges Completed</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Challenges List */}
        <div className="space-y-4">
          {challenges.map((userChallenge, index) => {
            const challenge = userChallenge.challenge;
            const progressPercent = Math.min((userChallenge.progress / challenge.target) * 100, 100);
            const isCompleted = userChallenge.completed;
            const isClaimed = userChallenge.claimed;

            return (
              <motion.div
                key={userChallenge.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card className={`hover-elevate ${isCompleted && !isClaimed ? 'border-primary' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-3xl mt-1" data-testid={`icon-challenge-${index}`}>
                          {getChallengeIcon(challenge.type)}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2" data-testid={`text-challenge-title-${index}`}>
                            {challenge.title}
                            {isClaimed && (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            )}
                          </CardTitle>
                          <CardDescription data-testid={`text-challenge-description-${index}`}>
                            {challenge.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium text-primary">
                        <Coins className="w-4 h-4" />
                        <span data-testid={`text-challenge-reward-${index}`}>{challenge.coinReward}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          Progress
                        </span>
                        <span className="font-medium" data-testid={`text-challenge-progress-${index}`}>
                          {userChallenge.progress} / {challenge.target}
                        </span>
                      </div>
                      <Progress 
                        value={progressPercent} 
                        className="h-3"
                        data-testid={`progress-challenge-${index}`}
                      />
                    </div>

                    {/* Action Button */}
                    {isCompleted && !isClaimed && (
                      <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                      >
                        <Button
                          onClick={() => claimRewardMutation.mutate(userChallenge.id)}
                          disabled={claimRewardMutation.isPending}
                          className="w-full"
                          data-testid={`button-claim-reward-${index}`}
                        >
                          <Trophy className="w-4 h-4 mr-2" />
                          Claim {challenge.coinReward} Coins
                        </Button>
                      </motion.div>
                    )}

                    {isClaimed && (
                      <div className="text-center py-2 text-sm text-muted-foreground flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Reward Claimed
                      </div>
                    )}

                    {!isCompleted && (
                      <div className="text-center py-2 text-sm text-muted-foreground flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4" />
                        Keep going!
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Daily Reset Notice */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Daily Reset</p>
                <p className="text-sm text-muted-foreground">
                  New challenges are assigned every day at midnight. Complete them before they reset!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomTabNav />
    </div>
  );
}
