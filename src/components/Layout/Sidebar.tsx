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

interface NavGroup {
  label: string;
  icon: React.ReactNode;
  children: { label: string; path: string }[];
}

const navGroups: NavGroup[] = [
  {
    label: "Account Mapping",
    icon: <ClipboardList size={18} />,
    children: [
      { label: "BS Mapping", path: "/mapping/bs" },
      { label: "PL Mapping", path: "/mapping/pl" },
    ],
  },
  {
    label: "Data Integration",
    icon: <RefreshCw size={18} />,
    children: [
      { label: "Auto Voucher", path: "/integration/auto" },
      { label: "Manual Voucher", path: "/integration/manual" },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "Account Mapping": true,
    "Data Integration": true,
  });

  const toggle = (label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const linkClass = (path: string) => {
    const active = location.pathname === path;
    return `flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors ${
      active
        ? "bg-blue-600 text-white"
        : "text-slate-300 hover:bg-slate-700 hover:text-white"
    }`;
  };

  return (
    <aside className="w-60 bg-slate-800 min-h-screen flex flex-col shrink-0">
      <div className="px-4 py-5 border-b border-slate-700">
        <h1 className="text-white text-base font-semibold tracking-tight">
          GME Accounting
        </h1>
        <p className="text-slate-400 text-xs mt-0.5">Amaranth 10 Integration</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {/* Dashboard */}
        <NavLink to="/" className={() => linkClass("/")}>
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        {/* Nav groups */}
        {navGroups.map((group) => (
          <div key={group.label}>
            <button
              onClick={() => toggle(group.label)}
              className="flex items-center justify-between w-full px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                {group.icon}
                {group.label}
              </span>
              {expanded[group.label] ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </button>
            {expanded[group.label] && (
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
          Integration History
        </NavLink>
      </nav>

      <div className="px-4 py-3 border-t border-slate-700 text-xs text-slate-500">
        Phase 1 — Core → Amaranth
      </div>
    </aside>
  );
}
