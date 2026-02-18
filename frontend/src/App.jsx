import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Verify from "./pages/Verify";
import FarmerDashboard from "./pages/FarmerDashboard";
import FarmerProfile from "./pages/FarmerProfile";
import CreateBatch from "./pages/CreateBatch";
import BatchUpdate from "./pages/BatchUpdate";
import BatchSearch from "./pages/BatchSearch";
import AdminDashboard from "./pages/AdminDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";


const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <ThemeProvider defaultTheme="system" storageKey="ayurchain-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/search" element={<BatchSearch />} />
          <Route 
            path="/farmer" 
            element={
              <ProtectedRoute allowedRole="farmer">
                <FarmerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/farmer/profile" 
            element={
              <ProtectedRoute allowedRole="farmer">
                <FarmerProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/farmer/create-batch" 
            element={
              <ProtectedRoute allowedRole="farmer">
                <CreateBatch />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/farmer/batch/:batchId" 
            element={
              <ProtectedRoute allowedRole="farmer">
                <BatchUpdate />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/company" 
            element={
              <ProtectedRoute allowedRole="company">
                <CompanyDashboard />
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;

