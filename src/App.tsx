import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteLayout } from "./components/site/SiteLayout";
import { AdminLayout } from "./components/admin/AdminLayout";
import Home from "./pages/Home";
import AIBuilder from "./pages/AIBuilder";
import Result from "./pages/Result";
import Offers from "./pages/Offers";
import Experiences from "./pages/Experiences";
import Events from "./pages/Events";
import Partners from "./pages/Partners";
import Media from "./pages/Media";
import Contact from "./pages/Contact";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminProfiles from "./pages/admin/AdminProfiles";
import AdminPricing from "./pages/admin/AdminPricing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <LanguageProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner theme="dark" />
        <BrowserRouter>
          <Routes>
            <Route element={<SiteLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/experience" element={<AIBuilder />} />
              <Route path="/resultat" element={<Result />} />
              <Route path="/offres" element={<Offers />} />
              <Route path="/experiences" element={<Experiences />} />
              <Route path="/evenements" element={<Events />} />
              <Route path="/partenaires" element={<Partners />} />
              <Route path="/media" element={<Media />} />
              <Route path="/contact" element={<Contact />} />
            </Route>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="leads" element={<AdminLeads />} />
              <Route path="profils" element={<AdminProfiles />} />
              <Route path="tarification" element={<AdminPricing />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </LanguageProvider>
);

export default App;
