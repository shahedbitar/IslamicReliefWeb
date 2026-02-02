import { createRoot } from "react-dom/client";
import App from "./App";

declare global {
  interface Window {
    netlifyIdentity?: {
      init: () => void;
      on: (event: string, cb: (user?: any) => void) => void;
      off: (event: string, cb?: (user?: any) => void) => void;
      open: () => void;
      close: () => void;
    };
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

// ✅ init Netlify Identity widget (this is what makes invite/recovery links work)
if (typeof window !== "undefined" && window.netlifyIdentity) {
  window.netlifyIdentity.init();

  // Optional but very helpful: after setting password / logging in, go to dashboard
  window.netlifyIdentity.on("login", () => {
    window.location.assign("/dashboard");
  });
}

createRoot(rootElement).render(<App />);
