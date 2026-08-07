import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { TooltipProvider, SidebarProvider } from "@/components/ui";
import { EngineProvider } from "@/context/EngineContext.tsx";
import { ThemeProvider } from "./components/ThemeProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TooltipProvider>
      <SidebarProvider>
        <EngineProvider>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <App />
          </ThemeProvider>
        </EngineProvider>
      </SidebarProvider>
    </TooltipProvider>
  </StrictMode>,
);
