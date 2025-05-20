import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";

import Dashboard from "@/pages/Dashboard";
import Criminals from "@/pages/Criminals";
import PoliceStations from "@/pages/PoliceStations";
import FirDetails from "@/pages/FirDetails";
import Officers from "@/pages/Officers";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";

function App() {
  const { user, isAuthenticated, login } = useAuth();
  const [location, setLocation] = useLocation();

  // Demo login for testing different roles
  useEffect(() => {
    const role = new URLSearchParams(window.location.search).get("role");
    if (role && !isAuthenticated) {
      if (["admin", "officer", "user"].includes(role)) {
        login({ username: role, password: "password", role });
      }
    }
  }, [isAuthenticated, login]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Layout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/criminals" component={Criminals} />
            <Route path="/police-stations" component={PoliceStations} />
            <Route path="/fir" component={FirDetails} />
            <Route path="/officers" component={Officers} />
            <Route path="/profile" component={Profile} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
