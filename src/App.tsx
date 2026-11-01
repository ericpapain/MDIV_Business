import { lazy, Suspense, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useNavigate, Navigate, useSearchParams } from "react-router-dom";
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
import { AnalyticsTracker } from "./components/analytics/AnalyticsTracker";

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
const EventRegistrationPage = lazy(() => import("./pages/EventRegistrationPage"));
const EventHubPage = lazy(() => import("./pages/EventHubPage"));
const EventLiveDisplayPage = lazy(() => import("./pages/EventLiveDisplayPage"));
const EventRegiePage = lazy(() => import("./pages/admin/EventRegiePage"));
const Charte = lazy(() => import("./pages/Charte"));
const SejoursBNE = lazy(() => import("./pages/SejoursBNE"));
const AccompagnementBNE = lazy(() => import("./pages/AccompagnementBNE"));
const Blog = lazy(() => import("./pages/Blog"));
const DemoFlow = lazy(() => import("./pages/Demo/DemoFlow"));

// ─── Services IA (Section Fermée / Accès restreint) ─────────────────────────
const ServicesIAClosed = lazy(() => import("./pages/ServicesIAClosed"));
const PublicClientBooking = lazy(() => import("./pages/PublicClientBooking"));

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
              <AnalyticsTracker />
              <AuthExplorerListener />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Live Stage Displays (1920x1080 sans chrome standard) */}
                  <Route path="/evenements/:id/live" element={<EventLiveDisplayPage />} />
                  <Route path="/live/:id" element={<EventLiveDisplayPage />} />

                  <Route element={<SiteLayout />}>
                    {/* 1. Routes publiques (accessibles sans connexion) */}
                    <Route path="/" element={<Home />} />

                                        {/* Services IA (Fermé / Accès Restreint) */}
                    <Route path="/services-ia" element={<ServicesIAClosed />} />
                    <Route path="/services-ia/*" element={<ServicesIAClosed />} />
                    <Route path="/diagnostic-ia" element={<ServicesIAClosed />} />
                    <Route path="/tarifs" element={<ServicesIAClosed />} />

                    {/* Présentation, Témoignages & Événements */}
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/avis" element={<Avis />} />
                    <Route path="/partenaires" element={<Partners />} />
                    <Route path="/media" element={<Media />} />
                    <Route path="/evenements" element={<Events />} />
                    <Route path="/evenements/:id" element={<EventHubPage />} />
                    <Route path="/evenements/:id/reserver" element={<EventHubPage />} />
                    <Route path="/evenements/:id/tombola" element={<EventHubPage />} />
                    <Route path="/evenements/:id/networking" element={<EventHubPage />} />
                    <Route path="/evenements/:id/pitches" element={<EventHubPage />} />
                    <Route path="/evenements/:id/inscription" element={<EventRegistrationPage />} />
                    <Route path="/inscription/:id" element={<EventRegistrationPage />} />
                    <Route path="/sejour" element={<Sejour />} />
                    <Route path="/offres" element={<Offers />} />
                    <Route path="/offers" element={<Navigate to="/offres" replace />} />
                    <Route path="/sejours-bne" element={<SejoursBNE />} />
                    <Route path="/accompagnement-bne" element={<AccompagnementBNE />} />
                    <Route path="/revivre/:id" element={<EventReplay />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:id" element={<BlogPost />} />
                    <Route path="/demo" element={<DemoFlow />} />

                                        {/* Authentification & Inscription */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* Prise de rendez-vous en ligne (Expérience client publique) */}
                    <Route path="/rdv/:token" element={<PublicClientBooking />} />
                    <Route path="/rdv" element={<PublicClientBooking />} />
                    <Route path="/reserver/:token" element={<PublicClientBooking />} />
                    <Route path="/reserver" element={<PublicClientBooking />} />

                    {/* 2. Routes protégées : Outils métier, Tableau de bord, Espace de travail */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/dasbord" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/experience" element={<AIBuilder />} />
                      <Route path="/resultat" element={<Result />} />
                      <Route path="/experiences" element={<Experiences />} />
                    </Route>
                  </Route>

                  {/* 3. Espace Administration (sécurisé par AdminLayout & /api-auth.php) */}
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
                      <Route path="events/:id/regie" element={<EventRegiePage />} />
                      <Route path="sejours" element={<AdminSejours />} />
                      <Route path="reviews" element={<AdminReviews />} />
                      <Route path="tarification" element={<AdminPricing />} />
                      <Route path="replays" element={<AdminReplays />} />
                      <Route path="ambassadors" element={<AdminAmbassadors />} />
                      <Route path="demandes" element={<AdminApplications />} />
                      <Route path="ai-settings" element={<AdminAISettings />} />
                      <Route path="ai-governance" element={<AdminAIGovernance />} />
                  </Route>

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
