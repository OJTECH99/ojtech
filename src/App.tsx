import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { SectionDetailsPage } from "./components/SectionDetailsPage";
import { LeaderboardPage } from "./components/LeaderboardPage";
import { StudentLeaderboard } from "./components/StudentLeaderboard";
import { StudentProfile } from "./components/StudentProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/teacher/section/:sectionId" element={<SectionDetailsPage />} />
            <Route path="/teacher/leaderboard/:sectionId" element={<LeaderboardPage />} />
            <Route path="/student/leaderboard" element={<StudentLeaderboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
