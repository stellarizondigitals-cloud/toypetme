import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import GameHome from "@/pages/GameHome";
import MiniGame from "@/pages/MiniGame";
import Shop from "@/pages/Shop";
import Store from "@/pages/Store";
import Inventory from "@/pages/Inventory";
import MyPets from "@/pages/MyPets";
import Collection from "@/pages/Collection";
import GoPremium from "@/pages/GoPremium";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Profile from "@/pages/Profile";
import EmailVerification from "@/pages/EmailVerification";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/not-found";
import type { User } from "@shared/schema";

function ProtectedRoute({ component: Component }: { component: () => JSX.Element }): JSX.Element {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Component />;
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
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
