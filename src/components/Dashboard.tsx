import {
  ClipboardList,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "./Layout/Header";
import { bsCoreLedgers } from "../data/bsLedgers";
import { plCoreLedgers } from "../data/plLedgers";
import { bsMappings, plMappings } from "../data/mappings";
import { integrationHistory } from "../data/integrationHistory";
import { formatKRW } from "../utils/formatters";
import { useLanguage } from "../i18n/LanguageContext";

export default function Dashboard() {
  const { t } = useLanguage();
  const bsMapped = new Set(bsMappings.flatMap((m) => m.coreLedgerCodes));
  const plMapped = new Set(plMappings.map((m) => m.coreLedgerCode));

  const bsMappedCount = bsCoreLedgers.filter((l) => bsMapped.has(l.code)).length;
  const plMappedCount = plCoreLedgers.filter((l) => plMapped.has(l.code)).length;

  const lastIntegration = integrationHistory[0];
  const successCount = integrationHistory.filter((h) => h.status === "Success").length;
  const failedCount = integrationHistory.filter((h) => h.status === "Failed").length;

  return (
    <div>
      <Header
        title={t("page.dashboard.title")}
        subtitle={t("page.dashboard.subtitle")}
      />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<ClipboardList size={20} className="text-blue-600" />}
            label={t("dashboard.bsLedgersMapped")}
            value={`${bsMappedCount} / ${bsCoreLedgers.length}`}
            sublabel={`${Math.round((bsMappedCount / bsCoreLedgers.length) * 100)}${t("dashboard.complete")}`}
            color="blue"
          />
          <StatCard
            icon={<ClipboardList size={20} className="text-indigo-600" />}
            label={t("dashboard.plLedgersMapped")}
            value={`${plMappedCount} / ${plCoreLedgers.length}`}
            sublabel={`${Math.round((plMappedCount / plCoreLedgers.length) * 100)}${t("dashboard.complete")}`}
            color="indigo"
          />
          <StatCard
            icon={<CheckCircle size={20} className="text-green-600" />}
            label={t("dashboard.successfulIntegrations")}
            value={String(successCount)}
            sublabel={`${failedCount} ${t("dashboard.failed")}`}
            color="green"
          />
          <StatCard
            icon={<RefreshCw size={20} className="text-amber-600" />}
            label={t("dashboard.lastIntegration")}
            value={lastIntegration?.date || t("dashboard.na")}
            sublabel={`${t("dashboard.by")} ${lastIntegration?.executedBy || t("dashboard.na")}`}
            color="amber"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">{t("dashboard.quickActions")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <QuickAction to="/mapping/bs" label={t("dashboard.bsAccountMapping")} desc={t("dashboard.bsAccountMappingDesc")} />
            <QuickAction to="/mapping/pl" label={t("dashboard.plAccountMapping")} desc={t("dashboard.plAccountMappingDesc")} />
            <QuickAction to="/integration/auto" label={t("dashboard.autoVoucher")} desc={t("dashboard.autoVoucherDesc")} />
            <QuickAction to="/history" label={t("dashboard.viewHistory")} desc={t("dashboard.viewHistoryDesc")} />
          </div>
        </div>

        {/* Recent History */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">{t("dashboard.recentHistory")}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="pb-2 font-medium text-slate-600">{t("th.id")}</th>
                  <th className="pb-2 font-medium text-slate-600">{t("label.date")}</th>
                  <th className="pb-2 font-medium text-slate-600">{t("th.type")}</th>
                  <th className="pb-2 font-medium text-slate-600">{t("label.executedBy")}</th>
                  <th className="pb-2 font-medium text-slate-600">{t("th.entriesBsPl")}</th>
                  <th className="pb-2 font-medium text-blue-600">Total DR</th>
                  <th className="pb-2 font-medium text-orange-600">Total CR</th>
                  <th className="pb-2 font-medium text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {integrationHistory.map((h) => (
                  <tr key={h.id} className="border-b border-slate-100">
                    <td className="py-2 font-mono text-xs">{h.id}</td>
                    <td className="py-2">{h.date} {h.time}</td>
                    <td className="py-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          h.type === "Auto"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {h.type}
                      </span>
                    </td>
                    <td className="py-2">{h.executedBy}</td>
                    <td className="py-2 font-mono">{h.bsEntries} / {h.plEntries}</td>
                    <td className="py-2 font-mono text-blue-700">{formatKRW(h.totalDr)}</td>
                    <td className="py-2 font-mono text-orange-700">{formatKRW(h.totalCr)}</td>
                    <td className="py-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                          h.status === "Success"
                            ? "bg-green-100 text-green-700"
                            : h.status === "Failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {h.status === "Success" ? (
                          <CheckCircle size={12} />
                        ) : (
                          <AlertTriangle size={12} />
                        )}
                        {h.status === "Success" ? t("badge.success") : h.status === "Failed" ? t("badge.failed") : t("badge.rolledBack")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sublabel,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel: string;
  color: string;
}) {
  const bgMap: Record<string, string> = {
    blue: "bg-blue-50 border-blue-100",
    indigo: "bg-indigo-50 border-indigo-100",
    green: "bg-green-50 border-green-100",
    amber: "bg-amber-50 border-amber-100",
  };

  return (
    <div className={`rounded-lg border p-4 ${bgMap[color] || "bg-white border-slate-200"}`}>
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-2xl font-semibold text-slate-800">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{sublabel}</div>
    </div>
  );
}

function QuickAction({ to, label, desc }: { to: string; label: string; desc: string }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors group"
    >
      <div>
        <div className="text-sm font-medium text-slate-700 group-hover:text-blue-700">{label}</div>
        <div className="text-xs text-slate-400">{desc}</div>
      </div>
      <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500" />
    </Link>
  );
}
