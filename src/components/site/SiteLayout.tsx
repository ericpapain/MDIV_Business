import { Outlet } from "react-router-dom";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { Chatbot } from "./Chatbot";
import { FloatingContactButton } from "./FloatingContactButton";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function SiteLayout() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    // Changement dynamique du Favicon pour le logo IT4ALL
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    
    if (pathname.startsWith('/services-ia') || pathname === '/diagnostic-ia') {
      link.href = '/IT4ALL.jpeg';
    } else {
      link.href = '/favicon.ico'; // Remettre l'original (MDIV)
    }

    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash.substring(1));
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [pathname, hash]);
  
  // Les pages immersives et le dashboard SaaS bénéficient d'un layout 100vh sans header/footer externe
  if (
    pathname === '/login' || 
    pathname === '/register' || 
    pathname === '/services-ia/diagnostic/login' ||
    pathname === '/services-ia/diagnostic/register' ||
    pathname === '/services-ia/diagnostic' || 
    pathname === '/diagnostic-ia' ||
    pathname.startsWith('/services-ia/dashboard') ||
    pathname.startsWith('/services-ia/espace') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/rdv') ||
    pathname.startsWith('/reserver')
  ) {
    return (
      <main className="w-full min-h-screen overflow-x-hidden">
        <Outlet />
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-clip">
      <SiteHeader />
      <main className="flex-1 w-full max-w-full overflow-x-clip">
        <Outlet />
      </main>
      <SiteFooter />
      {/* <Chatbot /> */}
      <FloatingContactButton />
    </div>
  );
}