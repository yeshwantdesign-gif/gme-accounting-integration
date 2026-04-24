import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  RefreshCw,
  History,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";

export default function Sidebar() {
  const location = useLocation();
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    mapping: true,
    integration: true,
  });

  const toggle = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const linkClass = (path: string) => {
    const active = location.pathname === path;
    return `flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors ${
      active
        ? "bg-blue-600 text-white"
        : "text-slate-300 hover:bg-slate-700 hover:text-white"
    }`;
  };

  const navGroups = [
    {
      key: "mapping",
      label: t("nav.accountMapping"),
      icon: <ClipboardList size={18} />,
      children: [
        { label: t("nav.bsMapping"), path: "/mapping/bs" },
        { label: t("nav.plMapping"), path: "/mapping/pl" },
      ],
    },
    {
      key: "integration",
      label: t("nav.dataIntegration"),
      icon: <RefreshCw size={18} />,
      children: [
        { label: t("nav.autoVoucher"), path: "/integration/auto" },
        { label: t("nav.manualVoucher"), path: "/integration/manual" },
      ],
    },
  ];

  return (
    <aside className="w-60 bg-slate-800 min-h-screen flex flex-col shrink-0">
      <div className="px-4 py-5 border-b border-slate-700">
        <h1 className="text-white text-base font-semibold tracking-tight">
          {t("sidebar.appName")}
        </h1>
        <p className="text-slate-400 text-xs mt-0.5">{t("sidebar.appSubtitle")}</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {/* Dashboard */}
        <NavLink to="/" className={() => linkClass("/")}>
          <LayoutDashboard size={18} />
          {t("nav.dashboard")}
        </NavLink>

        {/* Nav groups */}
        {navGroups.map((group) => (
          <div key={group.key}>
            <button
              onClick={() => toggle(group.key)}
              className="flex items-center justify-between w-full px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                {group.icon}
                {group.label}
              </span>
              {expanded[group.key] ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </button>
            {expanded[group.key] && (
              <div className="ml-6 space-y-0.5">
                {group.children.map((child) => (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    className={() => linkClass(child.path)}
                  >
                    {child.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* History */}
        <NavLink to="/history" className={() => linkClass("/history")}>
          <History size={18} />
          {t("nav.integrationHistory")}
        </NavLink>
      </nav>

      <div className="px-4 py-3 border-t border-slate-700 text-xs text-slate-500">
        {t("misc.phase1")}
      </div>
    </aside>
  );
}
