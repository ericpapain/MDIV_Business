// src/components/analytics/AnalyticsTracker.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/services/analyticsTracker";

export function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // Détecter automatiquement chaque changement de page
    const fullPath = location.pathname + location.search;
    trackPageView(fullPath);
  }, [location.pathname, location.search]);

  return null;
}
