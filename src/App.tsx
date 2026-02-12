import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

// Patient Pages
import PatientDashboard from "./pages/patient/PatientDashboard";
import EducationPage from "./pages/patient/EducationPage";
import HealthFormPage from "./pages/patient/HealthFormPage";
import PatientChatPage from "./pages/patient/PatientChatPage";
import GamesPage from "./pages/patient/GamesPage";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import PatientsPage from "./pages/doctor/PatientsPage";
import DoctorChatPage from "./pages/doctor/DoctorChatPage";
import DialysisTrackingPage from "./pages/doctor/DialysisTrackingPage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import UserManagementPage from "./pages/admin/UserManagementPage";
import StatisticsPage from "./pages/admin/StatisticsPage";
import MonitoringPage from "./pages/admin/MonitoringPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Auth */}
              <Route path="/" element={<LoginPage />} />
              
              {/* Patient Routes */}
              <Route path="/patient" element={<PatientDashboard />} />
              <Route path="/patient/education" element={<EducationPage />} />
              <Route path="/patient/health-form" element={<HealthFormPage />} />
              <Route path="/patient/chat" element={<PatientChatPage />} />
              <Route path="/patient/games" element={<GamesPage />} />
              
              {/* Doctor Routes */}
              <Route path="/doctor" element={<DoctorDashboard />} />
              <Route path="/doctor/patients" element={<PatientsPage />} />
              <Route path="/doctor/chat" element={<DoctorChatPage />} />
              <Route path="/doctor/tracking" element={<DialysisTrackingPage />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/analytics" element={<AnalyticsPage />} />
              <Route path="/admin/users" element={<UserManagementPage />} />
              <Route path="/admin/statistics" element={<StatisticsPage />} />
              <Route path="/admin/monitoring" element={<MonitoringPage />} />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
