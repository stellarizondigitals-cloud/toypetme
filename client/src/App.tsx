import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import GameHome from "@/pages/GameHome";
import Collection from "@/pages/Collection";
import MiniGamesHub from "@/pages/MiniGamesHub";
import Leaderboard from "@/pages/Leaderboard";
import Achievements from "@/pages/Achievements";
import NotFound from "@/pages/not-found";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Switch>
          <Route path="/" component={GameHome} />
          <Route path="/collection" component={Collection} />
          <Route path="/minigames" component={MiniGamesHub} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route path="/achievements" component={Achievements} />
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
