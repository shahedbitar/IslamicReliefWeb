import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { CalendarProvider } from "@/contexts/CalendarContext";
import { EventProvider } from "@/contexts/EventContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import Login from "./pages/Login";
import SetPassword from "./pages/SetPassword";
import DashboardHub from "./pages/DashboardHub";
import Portfolio from "./pages/Portfolio";
import ApprovalsHub from "./pages/ApprovalsHub";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <CalendarProvider>
          <EventProvider>
            <NotificationsProvider>
              <BrowserRouter>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/set-password" element={<SetPassword />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardHub />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/approvals"
                element={
                  <ProtectedRoute>
                    <ApprovalsHub />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/portfolio/:portfolio"
                element={
                  <ProtectedRoute>
                    <Portfolio />
                  </ProtectedRoute>
                }
              />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </BrowserRouter>
            </NotificationsProvider>
          </EventProvider>
        </CalendarProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
