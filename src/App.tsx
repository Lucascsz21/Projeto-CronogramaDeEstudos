import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext.tsx";
import ProtectedRoute from "@/components/ProtectedRoute.tsx";
import Index from "./pages/Index";
import CriarCronograma from "./pages/CriarCronograma";
import Cronograma from "./pages/Cronograma";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes — user must be logged in */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Index />} />
              <Route path="/criar" element={<CriarCronograma />} />
              <Route path="/cronograma" element={<Cronograma />} />
              {/* ADD ALL CUSTOM PROTECTED ROUTES HERE */}
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;