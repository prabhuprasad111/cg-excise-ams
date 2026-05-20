import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { ToastHost } from "./components/ui/ToastHost";
import { AuditPage } from "./pages/AuditPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DistributionPage } from "./pages/DistributionPage";
import { IssuePage } from "./pages/IssuePage";
import { SettingsPage } from "./pages/SettingsPage";
import { StockPage } from "./pages/StockPage";
import { useAppStore } from "./store/useAppStore";

/** Brand UI is always light (cream + green sidebar); never apply `dark` on <html>. */
function HydrateTheme() {
  useEffect(() => {
    const apply = () => {
      document.documentElement.classList.remove("dark");
      if (useAppStore.getState().darkMode) {
        useAppStore.getState().setDarkMode(false);
      }
    };
    apply();
    return useAppStore.persist.onFinishHydration(apply);
  }, []);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <HydrateTheme />
      <ToastHost />
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="stock" element={<StockPage />} />
          <Route path="issue" element={<IssuePage />} />
          <Route path="distribution" element={<DistributionPage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
