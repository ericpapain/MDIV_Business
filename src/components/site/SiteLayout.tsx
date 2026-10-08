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
  
  return (
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden">
      <SiteHeader />
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <Outlet />
      </main>
      <SiteFooter />
      {/* <Chatbot /> */}
      <FloatingContactButton />
    </div>
  );
}