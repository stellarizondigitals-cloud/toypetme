import { Switch, Route, Redirect } from "wouter";
import { queryClient, getQueryFn } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import GameHome from "@/pages/GameHome";
import MiniGame from "@/pages/MiniGame";
import Shop from "@/pages/Shop";
import Store from "@/pages/Store";
import Inventory from "@/pages/Inventory";
import MyPets from "@/pages/MyPets";
import Collection from "@/pages/Collection";
import Leaderboard from "@/pages/Leaderboard";
import Challenges from "@/pages/Challenges";
import GoPremium from "@/pages/GoPremium";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Profile from "@/pages/Profile";
import EmailVerification from "@/pages/EmailVerification";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/not-found";
import type { User } from "@shared/schema";
import { useNotifications, useChallengeNotifications } from "@/hooks/useNotifications";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

function ProtectedRoute({ component: Component }: { component: () => JSX.Element }): JSX.Element {
  const { data: user, isLoading, isError, refetch } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Handle 401 (unauthenticated)
  if (user === null) {
    return <Redirect to="/login" />;
  }

  // Handle other errors (network, server issues)
  if (isError || user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">Failed to load authentication status</p>
          <Button onClick={() => refetch()} data-testid="button-retry-auth">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return <Component />;
}

function NotificationManager() {
  useNotifications();
  useChallengeNotifications();
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/verify" component={EmailVerification} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/">
        {() => <ProtectedRoute component={GameHome} />}
      </Route>
      <Route path="/game">
        {() => <ProtectedRoute component={MiniGame} />}
      </Route>
      <Route path="/shop">
        {() => <ProtectedRoute component={Shop} />}
      </Route>
      <Route path="/store">
        {() => <ProtectedRoute component={Store} />}
      </Route>
      <Route path="/inventory">
        {() => <ProtectedRoute component={Inventory} />}
      </Route>
      <Route path="/my-pets">
        {() => <ProtectedRoute component={MyPets} />}
      </Route>
      <Route path="/collection">
        {() => <ProtectedRoute component={Collection} />}
      </Route>
      <Route path="/leaderboard">
        {() => <ProtectedRoute component={Leaderboard} />}
      </Route>
      <Route path="/challenges">
        {() => <ProtectedRoute component={Challenges} />}
      </Route>
      <Route path="/premium">
        {() => <ProtectedRoute component={GoPremium} />}
      </Route>
      <Route path="/profile">
        {() => <ProtectedRoute component={Profile} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <NotificationManager />
        <PWAInstallPrompt />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
