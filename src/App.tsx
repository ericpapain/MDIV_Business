import { lazy, Suspense, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteLayout } from "./components/site/SiteLayout";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthRequiredModal } from "./components/auth/AuthRequiredModal";

// ─── Critical routes (loaded eagerly) ───────────────────────────────────────
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { Dashboard } from "./pages/auth/Dashboard";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { ResetPassword } from "./pages/auth/ResetPassword";

// ─── Site pages (lazy-loaded) ────────────────────────────────────────────────
const AIBuilder = lazy(() => import("./pages/AIBuilder"));
const Result = lazy(() => import("./pages/Result"));
const Offers = lazy(() => import("./pages/Offers"));
const Experiences = lazy(() => import("./pages/Experiences"));
const Events = lazy(() => import("./pages/Events"));
const Sejour = lazy(() => import("./pages/Sejour"));
const Partners = lazy(() => import("./pages/Partners"));
const Media = lazy(() => import("./pages/Media"));
const Contact = lazy(() => import("./pages/Contact"));
const Avis = lazy(() => import("./pages/Avis"));
const EventReplay = lazy(() => import("./pages/EventReplay"));
const Charte = lazy(() => import("./pages/Charte"));
const SejoursBNE = lazy(() => import("./pages/SejoursBNE"));
const AccompagnementBNE = lazy(() => import("./pages/AccompagnementBNE"));
const Blog = lazy(() => import("./pages/Blog"));
const DemoFlow = lazy(() => import("./pages/Demo/DemoFlow"));

// ─── Services IA (lazy-loaded) ───────────────────────────────────────────────
const ServicesIA = lazy(() => import("./pages/ServicesIA"));
const ServicesIACategory = lazy(() => import("./pages/ServicesIACategory"));
const ServicesIADiagnostic = lazy(() => import("./pages/ServicesIADiagnostic"));
const ServicesIACalcROI = lazy(() => import("./pages/ServicesIACalcROI"));
const ServicesIABenchmark = lazy(() => import("./pages/ServicesIABenchmark"));
const ServicesIAMeetings = lazy(() => import("./pages/ServicesIAMeetings"));
const ServicesIASummarizer = lazy(() => import("./pages/ServicesIASummarizer"));
const ServicesIAEmail = lazy(() => import("./pages/ServicesIAEmail"));
const ServicesIAQuote = lazy(() => import("./pages/ServicesIAQuote"));
const ServicesIAInvoice = lazy(() => import("./pages/ServicesIAInvoice"));
const ServicesIAFollowup = lazy(() => import("./pages/ServicesIAFollowup"));
const ServicesIAContent = lazy(() => import("./pages/ServicesIAContent"));
const ServicesIALeads = lazy(() => import("./pages/ServicesIALeads"));
const ServicesIAProspecting = lazy(() => import("./pages/ServicesIAProspecting"));
const ServicesIAMeetingPrep = lazy(() => import("./pages/ServicesIAMeetingPrep"));
const ServicesIAPricing = lazy(() => import("./pages/ServicesIAPricing"));

// ─── Admin pages (lazy-loaded) ───────────────────────────────────────────────
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminMembers = lazy(() => import("./pages/admin/AdminMembers"));
const AdminPartners = lazy(() => import("./pages/admin/AdminPartners"));
const AdminReviews = lazy(() => import("./pages/admin/AdminReviews"));
const AdminVideos = lazy(() => import("./pages/admin/AdminVideos"));
const AdminEvents = lazy(() => import("./pages/admin/AdminEvents"));
const AdminSejours = lazy(() => import("./pages/admin/AdminSejours"));
const AdminPricing = lazy(() => import("./pages/admin/AdminPricing"));
const AdminReplays = lazy(() => import("./pages/admin/AdminReplays"));
const AdminAmbassadors = lazy(() => import("./pages/admin/AdminAmbassadors"));
const AdminApplications = lazy(() => import("./pages/admin/AdminApplications"));
const AdminPerformance = lazy(() => import("./pages/admin/AdminPerformance"));
const AdminAISettings = lazy(() => import("./pages/admin/AdminAISettings"));
const AdminAIGovernance = lazy(() => import("./pages/AdminAIGovernance"));
const AdminHeroNews = lazy(() => import("./pages/admin/AdminHeroNews"));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));

// ─── Loading fallback ─────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
  </div>
);

const queryClient = new QueryClient();

const AuthExplorerListener = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent;
      setMessage(customEvent.detail || "Action refusée : Vous devez créer un compte ou vous connecter pour sauvegarder vos données.");
      setIsOpen(true);
    };
    window.addEventListener('auth-explorer-blocked', handler);
    return () => window.removeEventListener('auth-explorer-blocked', handler);
  }, []);

  return (
    <AuthRequiredModal 
      isOpen={isOpen} 
      onClose={() => setIsOpen(false)} 
      description={message}
    />
  );
};

const App = () => (
  <LanguageProvider>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <BrowserRouter>
              <AuthExplorerListener />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route element={<SiteLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
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
                    {/* Services IA */}
                    <Route path="/services-ia" element={<ServicesIA />} />
                    <Route path="/services-ia/diagnostic" element={<ServicesIADiagnostic />} />
                    <Route path="/diagnostic-ia" element={<ServicesIADiagnostic />} />
                    <Route path="/services-ia/calc-roi" element={<ServicesIACalcROI />} />
                    <Route path="/services-ia/benchmark" element={<ServicesIABenchmark />} />
                    <Route path="/services-ia/comptes-rendus" element={<ServicesIAMeetings />} />
                    <Route path="/services-ia/resume-documents" element={<ServicesIASummarizer />} />
                    <Route path="/services-ia/assistant-email" element={<ServicesIAEmail />} />
                    <Route path="/services-ia/devis" element={<ServicesIAQuote />} />
                    <Route path="/services-ia/devis-automatique" element={<ServicesIAQuote />} />
                    <Route path="/services-ia/factures" element={<ServicesIAInvoice />} />
                    <Route path="/services-ia/verificateur-factures" element={<ServicesIAInvoice />} />
                    <Route path="/services-ia/relances" element={<ServicesIAFollowup />} />
                    <Route path="/services-ia/generateur-contenu" element={<ServicesIAContent />} />
                    <Route path="/services-ia/generateur-leads" element={<ServicesIALeads />} />
                    <Route path="/services-ia/prospection-email" element={<ServicesIAProspecting />} />
                    <Route path="/services-ia/prepa-reunion" element={<ServicesIAMeetingPrep />} />
                    <Route path="/services-ia/tarifs" element={<ServicesIAPricing />} />
                    <Route path="/tarifs" element={<ServicesIAPricing />} />
                    <Route path="/services-ia/:category" element={<ServicesIACategory />} />
                    {/* BNE & Blog */}
                    <Route path="/sejours-bne" element={<SejoursBNE />} />
                    <Route path="/accompagnement-bne" element={<AccompagnementBNE />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:id" element={<BlogPost />} />
                  </Route>

                  {/* Admin */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="blog" element={<AdminBlog />} />
                    <Route path="actualites" element={<AdminHeroNews />} />
                    <Route path="performance" element={<AdminPerformance />} />
                    <Route path="members" element={<AdminMembers />} />
                    <Route path="partners" element={<AdminPartners />} />
                    <Route path="videos" element={<AdminVideos />} />
                    <Route path="events" element={<AdminEvents />} />
                    <Route path="sejours" element={<AdminSejours />} />
                    <Route path="reviews" element={<AdminReviews />} />
                    <Route path="tarification" element={<AdminPricing />} />
                    <Route path="replays" element={<AdminReplays />} />
                    <Route path="ambassadors" element={<AdminAmbassadors />} />
                    <Route path="demandes" element={<AdminApplications />} />
                    <Route path="ai-settings" element={<AdminAISettings />} />
                    <Route path="ai-governance" element={<AdminAIGovernance />} />
                  </Route>

                  <Route path="/demo" element={<DemoFlow />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </LanguageProvider>
);

export default App;
