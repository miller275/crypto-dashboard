import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import CalcPage from "./pages/CalcPage";
import ResultPage from "./pages/ResultPage";
import DashboardPage from "./pages/DashboardPage";
import ProPage from "./pages/ProPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              {/* GitHub Pages runs under a sub-path; BASE_URL keeps routing working */}
              <BrowserRouter basename={import.meta.env.BASE_URL}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/calc" element={<CalcPage />} />
                  <Route path="/result/:id" element={<ResultPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/pro" element={<ProPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
