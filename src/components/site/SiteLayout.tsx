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