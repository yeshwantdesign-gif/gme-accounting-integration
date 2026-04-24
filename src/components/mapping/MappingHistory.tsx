import { useState } from "react";
import { Clock, Search } from "lucide-react";
import Modal from "../common/Modal";
import Badge from "../common/Badge";
import { useLanguage } from "../../i18n/LanguageContext";

export interface MappingHistoryEntry {
  id: string;
  timestamp: string;
  user: string;
  action: "Created" | "Updated" | "Removed" | "Excluded" | "Included";
  ledgerCode: string;
  ledgerName: string;
  details: string;
}

const actionVariant: Record<MappingHistoryEntry["action"], "success" | "info" | "error" | "warning" | "gray"> = {
  Created: "success",
  Updated: "info",
  Removed: "error",
  Excluded: "warning",
  Included: "gray",
};

interface MappingHistoryProps {
  entries: MappingHistoryEntry[];
}

export default function MappingHistory({ entries }: MappingHistoryProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");

  const filtered = entries.filter((e) => {
    const matchesAction = actionFilter === "All" || e.action === actionFilter;
    const matchesSearch =
      search === "" ||
      e.ledgerCode.toLowerCase().includes(search.toLowerCase()) ||
      e.ledgerName.toLowerCase().includes(search.toLowerCase()) ||
      e.details.toLowerCase().includes(search.toLowerCase());
    return matchesAction && matchesSearch;
  });

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
      >
        <Clock size={14} />
        {t("btn.mappingHistory")}
        {entries.length > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold bg-blue-600 text-white rounded-full min-w-[20px] text-center">
            {entries.length}
          </span>
        )}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={t("modal.mappingChangeHistory")} wide>
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t("msg.searchByLedgerOrDetails")}
              />
            </div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">{t("filter.allActions")}</option>
              <option value="Created">{t("badge.created")}</option>
              <option value="Updated">{t("badge.updated")}</option>
              <option value="Removed">{t("badge.removed")}</option>
              <option value="Excluded">{t("badge.excluded")}</option>
              <option value="Included">{t("badge.included")}</option>
            </select>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0">
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-3 py-2 text-left font-medium text-slate-600 whitespace-nowrap">{t("label.timestamp")}</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600 whitespace-nowrap">{t("th.user")}</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600 whitespace-nowrap">{t("th.action")}</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600 whitespace-nowrap">{t("th.coreLedger")}</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600 whitespace-nowrap">{t("th.details")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-slate-400">
                      {t("msg.noHistoryEntries")}
                    </td>
                  </tr>
                ) : (
                  filtered.map((entry) => (
                    <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono text-xs text-slate-500 whitespace-nowrap">{entry.timestamp}</td>
                      <td className="px-3 py-2 text-xs">{entry.user}</td>
                      <td className="px-3 py-2">
                        <Badge variant={actionVariant[entry.action]}>{entry.action}</Badge>
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-mono text-xs text-slate-500">{entry.ledgerCode}</div>
                        <div className="text-xs text-slate-600 truncate max-w-[200px]">{entry.ledgerName}</div>
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-600 max-w-[300px]">{entry.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="text-xs text-slate-400 text-right">
            {t("msg.showingEntries")} {filtered.length} {t("msg.of")} {entries.length} {t("msg.entriesLabel")}
          </div>
        </div>
      </Modal>
    </>
  );
}
