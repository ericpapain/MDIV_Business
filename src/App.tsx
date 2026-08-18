import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteLayout } from "./components/site/SiteLayout";
import { AdminLayout } from "./components/admin/AdminLayout";
import Home from "./pages/Home";
import AIBuilder from "./pages/AIBuilder";
import Result from "./pages/Result";
import Offers from "./pages/Offers";
import Experiences from "./pages/Experiences";
import Events from "./pages/Events";
import Sejour from "./pages/Sejour";
import Partners from "./pages/Partners";
import Media from "./pages/Media";
import Contact from "./pages/Contact";
import Avis from "./pages/Avis";
import EventReplay from "./pages/EventReplay";
import Charte from "./pages/Charte";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminMembers from "./pages/admin/AdminMembers";
import AdminPartners from "./pages/admin/AdminPartners";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminVideos from "./pages/admin/AdminVideos";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminSejours from "./pages/admin/AdminSejours";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminReplays from "./pages/admin/AdminReplays";
import AdminAmbassadors from "./pages/admin/AdminAmbassadors";
import NotFound from "./pages/NotFound";
import DemoFlow from "./pages/Demo/DemoFlow";
import ServicesIA from "./pages/ServicesIA";
import ServicesIACategory from "./pages/ServicesIACategory";
import ServicesIADiagnostic from "./pages/ServicesIADiagnostic";
import SejoursBNE from "./pages/SejoursBNE";
import AccompagnementBNE from "./pages/AccompagnementBNE";

import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { Dashboard } from "./pages/auth/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <LanguageProvider>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<SiteLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/experience" element={<AIBuilder />} />
                <Route path="/resultat" element={<Result />} />
                <Route path="/offres" element={<Offers />} />
                <Route path="/experiences" element={<Experiences />} />
                <Route path="/evenements" element={<Events />} />
                <Route path="/sejour" element={<Sejour />} />
                <Route path="/revivre/:id" element={<EventReplay />} />
                <Route path="/partenaires" element={<Partners />} />
                <Route path="/media" element={<Media />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/avis" element={<Avis />} />
                <Route path="/charte" element={<Charte />} />
                <Route path="/services-ia" element={<ServicesIA />} />
                <Route 
                  path="/services-ia/diagnostic" 
                  element={
                    <ProtectedRoute>
                      <ServicesIADiagnostic />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/services-ia/:category" element={<ServicesIACategory />} />
                <Route path="/sejours-bne" element={<SejoursBNE />} />
                <Route path="/accompagnement-bne" element={<AccompagnementBNE />} />
              </Route>
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="members" element={<AdminMembers />} />
                <Route path="partners" element={<AdminPartners />} />
                <Route path="videos" element={<AdminVideos />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="sejours" element={<AdminSejours />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="tarification" element={<AdminPricing />} />
                <Route path="replays" element={<AdminReplays />} />
                <Route path="ambassadors" element={<AdminAmbassadors />} />
              </Route>
              <Route path="/demo" element={<DemoFlow />} />
              <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </LanguageProvider>
);

export default App;
