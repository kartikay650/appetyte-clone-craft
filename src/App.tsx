import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import LandingPage from "./pages/LandingPage"
import NotFound from "./pages/NotFound"
import ProviderSignup from "./pages/ProviderSignup"
import ProviderLogin from "./pages/ProviderLogin"
import ProviderAdminPage from "./pages/ProviderAdminPage"
import ProviderCustomerPage from "./pages/ProviderCustomerPage"
import "./App.css"

const queryClient = new QueryClient()

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/provider-signup" element={<ProviderSignup />} />
          <Route path="/provider-login" element={<ProviderLogin />} />
          <Route path="/:subUrl/admin" element={<ProviderAdminPage />} />
          <Route path="/:subUrl/customer" element={<ProviderCustomerPage />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App
