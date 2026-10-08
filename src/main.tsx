import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  if (response.status === 401) {
    try {
      const cloned = response.clone();
      const data = await cloned.json();
      if (data.error === "UNAUTHORIZED_EXPLORER") {
        window.dispatchEvent(new CustomEvent('auth-explorer-blocked', { detail: data.message }));
      }
    } catch (e) {}
  }
  return response;
};

createRoot(document.getElementById("root")!).render(<App />);
