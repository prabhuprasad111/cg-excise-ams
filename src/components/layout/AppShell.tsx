import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  LayoutDashboard,
  MapPinned,
  Menu,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  ScrollText,
  Settings2,
  Sun,
  Truck,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import { useAppStore } from "../../store/useAppStore";

const SIDEBAR_EXPANDED = "16rem";
const SIDEBAR_COLLAPSED = "4.5rem";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/stock", label: "Stock", icon: Package },
  { to: "/issue", label: "State Issue", icon: Truck },
  { to: "/distribution", label: "Distribution", icon: MapPinned },
  { to: "/audit", label: "Audit Log", icon: ScrollText },
  { to: "/settings", label: "Data & Roles", icon: Settings2 },
];

export function AppShell() {
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebarCollapsed = useAppStore((s) => s.toggleSidebarCollapsed);
  const role = useAppStore((s) => s.role);
  const districts = useAppStore((s) => s.districts);
  const officerDistrictId = useAppStore((s) => s.officerDistrictId);

  const officerName =
    role === "district_officer"
      ? districts.find((d) => d.id === officerDistrictId)?.name ?? "District"
      : "State Administrator";

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  const navLinks = (collapsed: boolean, onNavigate?: () => void) =>
    nav.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        title={collapsed ? item.label : undefined}
        onClick={onNavigate}
        className={({ isActive }) =>
          clsx(
            "flex items-center rounded-lg text-sm font-medium transition-colors",
            collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
            isActive ? "bg-emerald-800 text-white" : "text-emerald-100/90 hover:bg-emerald-800/50",
          )
        }
      >
        <item.icon className="h-5 w-5 shrink-0 opacity-90" />
        <span
          className={clsx(
            "truncate whitespace-nowrap transition-all duration-300",
            collapsed ? "w-0 overflow-hidden opacity-0" : "w-auto opacity-100",
          )}
        >
          {item.label}
        </span>
      </NavLink>
    ));

  return (
    <div className="flex min-h-screen min-w-0">
      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <aside
        className={clsx(
          "fixed left-0 top-0 z-50 flex h-full w-[min(100vw,18rem)] max-w-[85vw] flex-col overflow-hidden md:hidden",
          "brand-sidebar border-r border-emerald-200/60 bg-[var(--color-cg-green-900)] text-emerald-50 shadow-xl",
          "transition-transform duration-300 ease-in-out",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full pointer-events-none",
        )}
        aria-label="Mobile navigation"
        aria-hidden={!mobileNavOpen}
      >
        <div className="flex items-center justify-between gap-2 border-b border-emerald-800/80 px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-cg-gold-500)] text-[var(--color-cg-green-900)]">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-widest text-emerald-300/90">Excise Dept.</p>
              <p className="truncate font-semibold text-white">CG Alcohol AMS</p>
            </div>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-lg p-2 text-emerald-100 hover:bg-emerald-800/50"
            aria-label="Close menu"
            onClick={() => setMobileNavOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">{navLinks(false, () => setMobileNavOpen(false))}</nav>
        <div className="border-t border-emerald-800/80 p-4 text-xs text-emerald-200/70">All Rights Reserved @KPMG</div>
      </aside>

      <aside
        style={{ width: sidebarWidth }}
        className={clsx(
          "fixed left-0 top-0 z-40 hidden h-full flex-col overflow-hidden",
          "brand-sidebar border-r border-emerald-200/60 bg-[var(--color-cg-green-900)] text-emerald-50 shadow-xl",
          "transition-[width] duration-300 ease-in-out md:flex",
        )}
        aria-label="Main navigation"
      >
        <div
          className={clsx(
            "flex shrink-0 items-center border-b border-emerald-800/80 py-5 transition-all duration-300",
            sidebarCollapsed ? "justify-center px-2" : "gap-3 px-5",
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-cg-gold-500)] text-[var(--color-cg-green-900)]">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div
            className={clsx(
              "min-w-0 overflow-hidden transition-all duration-300",
              sidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100",
            )}
          >
            <p className="text-xs font-medium uppercase tracking-widest text-emerald-300/90">Excise Dept.</p>
            <p className="font-semibold leading-tight whitespace-nowrap text-white">AMS Chhatisgarh</p>
          </div>
        </div>

        <nav className={clsx("flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden p-2", !sidebarCollapsed && "p-3")}>
          {navLinks(sidebarCollapsed)}
        </nav>

        <div
          className={clsx(
            "shrink-0 border-t border-emerald-800/80 text-xs text-emerald-200/70 transition-all duration-300",
            sidebarCollapsed ? "px-2 py-3 text-center" : "p-4",
          )}
        >
          {sidebarCollapsed ? (
            <span className="text-[10px] font-medium tracking-tight">KPMG</span>
          ) : (
            "All Rights Reserved @KPMG"
          )}
        </div>
      </aside>

      <div
        style={{ paddingLeft: sidebarWidth }}
        className="flex min-h-screen w-full min-w-0 flex-1 flex-col transition-[padding-left] duration-300 ease-in-out max-md:!pl-0"
      >
        <header className="brand-header sticky top-0 z-30 border-b border-emerald-200/70 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-md sm:px-4 md:px-5 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <div className="flex h-12 min-w-0 items-center justify-between gap-2 sm:h-14 sm:gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-200/90 text-slate-600 transition hover:bg-emerald-50 md:hidden"
                aria-label="Open menu"
                aria-expanded={mobileNavOpen}
              >
                <Menu className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={toggleSidebarCollapsed}
                className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-200/90 text-slate-600 transition hover:bg-emerald-50 md:inline-flex"
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!sidebarCollapsed}
              >
                {sidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
              </button>
              <p className="truncate text-sm font-semibold tracking-tight text-[var(--color-cg-green-900)] sm:text-base">
                Welcome to Home Department
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <BadgePill role={role} />
              <div className="hidden min-w-0 text-right leading-tight sm:block">
                <p className="truncate text-sm font-medium text-slate-800">{officerName}</p>
                <p className="text-xs text-slate-500">{role === "admin" ? "Full access" : "District scope"}</p>
              </div>
              <span
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-200/90 text-emerald-700"
                title="Light brand theme"
                aria-hidden
              >
                <Sun className="h-5 w-5" />
              </span>
            </div>
          </div>
        </header>

        <main className="content-surface flex-1 bg-[var(--color-cg-cream)] px-3 py-4 sm:px-4 sm:py-6 md:px-5 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="page-enter mx-auto w-full min-w-0 max-w-[100%]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function BadgePill({ role }: { role: string }) {
  return (
    <span
      className={clsx(
        "shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        role === "admin" ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900",
      )}
    >
      {role === "admin" ? "Admin" : "District Officer"}
    </span>
  );
}
