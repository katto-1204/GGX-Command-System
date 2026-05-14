import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { initializeAuthToken } from "@/lib/auth-token";

import NotFound from "@/pages/not-found";
import Splash from "@/pages/splash";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Onboarding from "@/pages/onboarding";
import RoleSelection from "@/pages/role-selection";
import Home from "@/pages/home";
import Pcs from "@/pages/pcs";
import Queue from "@/pages/queue";
import Session from "@/pages/session";
import Promos from "@/pages/promos";
import Menu from "@/pages/menu";
import Wallet from "@/pages/wallet";
import Feedback from "@/pages/feedback";
import Profile from "@/pages/profile";
import Developers from "@/pages/developers";

import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminPcs from "@/pages/admin/pcs";
import AdminQueue from "@/pages/admin/queue";
import AdminAssign from "@/pages/admin/assign";
import AdminSessions from "@/pages/admin/sessions";
import AdminPlayers from "@/pages/admin/players";
import AdminTopup from "@/pages/admin/topup";
import AdminOrders from "@/pages/admin/orders";
import AdminFeedback from "@/pages/admin/feedback";
import AdminPromos from "@/pages/admin/promos";
import AdminMenu from "@/pages/admin/menu";
import AdminSettings from "@/pages/admin/settings";
import AdminReports from "@/pages/admin/reports";
import Checkin from "@/pages/checkin";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5000,
    },
  },
});

initializeAuthToken();

function PlayerRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect to="/login" />;
  if (isAdmin) return <Redirect to="/admin/dashboard" />;
  return <Component />;
}

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect to="/admin/login" />;
  if (!isAdmin) return <Redirect to="/home" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Splash} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/role-select" component={RoleSelection} />
      <Route path="/developers" component={Developers} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Player Routes */}
      <Route path="/checkin"><PlayerRoute component={Checkin} /></Route>
      <Route path="/home"><PlayerRoute component={Home} /></Route>
      <Route path="/pcs"><PlayerRoute component={Pcs} /></Route>
      <Route path="/queue"><PlayerRoute component={Queue} /></Route>
      <Route path="/session"><PlayerRoute component={Session} /></Route>
      <Route path="/promos"><PlayerRoute component={Promos} /></Route>
      <Route path="/menu"><PlayerRoute component={Menu} /></Route>
      <Route path="/wallet"><PlayerRoute component={Wallet} /></Route>
      <Route path="/feedback"><PlayerRoute component={Feedback} /></Route>
      <Route path="/profile"><PlayerRoute component={Profile} /></Route>

      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard"><AdminRoute component={AdminDashboard} /></Route>
      <Route path="/admin/pcs"><AdminRoute component={AdminPcs} /></Route>
      <Route path="/admin/queue"><AdminRoute component={AdminQueue} /></Route>
      <Route path="/admin/assign"><AdminRoute component={AdminAssign} /></Route>
      <Route path="/admin/sessions"><AdminRoute component={AdminSessions} /></Route>
      <Route path="/admin/players"><AdminRoute component={AdminPlayers} /></Route>
      <Route path="/admin/topup"><AdminRoute component={AdminTopup} /></Route>
      <Route path="/admin/orders"><AdminRoute component={AdminOrders} /></Route>
      <Route path="/admin/feedback"><AdminRoute component={AdminFeedback} /></Route>
      <Route path="/admin/promos"><AdminRoute component={AdminPromos} /></Route>
      <Route path="/admin/menu"><AdminRoute component={AdminMenu} /></Route>
      <Route path="/admin/settings"><AdminRoute component={AdminSettings} /></Route>
      <Route path="/admin/reports"><AdminRoute component={AdminReports} /></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
