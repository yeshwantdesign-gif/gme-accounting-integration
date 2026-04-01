import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const timeStr = now.toTimeString().split(" ")[0];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1">
          <Outlet />
        </main>
        <footer className="bg-white border-t border-slate-200 px-6 py-2 text-xs text-slate-400 flex items-center justify-between">
          <span>Executed by: yeshwant | Date: {dateStr} {timeStr}</span>
          <span>GME Accounting Integration v1.0 — Phase 1</span>
        </footer>
      </div>
    </div>
  );
}
