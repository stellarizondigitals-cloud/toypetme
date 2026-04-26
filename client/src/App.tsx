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
import Stories, { StoryDetail } from "@/pages/Stories";
import DressUp from "@/pages/DressUp";
import Shop from "@/pages/Shop";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import CheckoutCancel from "@/pages/CheckoutCancel";
import RefundPolicy from "@/pages/RefundPolicy";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Terms from "@/pages/Terms";
import NotFound from "@/pages/not-found";
import CookieBanner from "@/components/CookieBanner";

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
          <Route path="/stories/:slug" component={StoryDetail} />
          <Route path="/stories" component={Stories} />
          <Route path="/dress-up" component={DressUp} />
          <Route path="/shop" component={Shop} />
          <Route path="/checkout/success" component={CheckoutSuccess} />
          <Route path="/checkout/cancel" component={CheckoutCancel} />
          <Route path="/refund-policy" component={RefundPolicy} />
          <Route path="/privacy" component={PrivacyPolicy} />
          <Route path="/terms" component={Terms} />
          <Route component={NotFound} />
        </Switch>
        <CookieBanner />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
