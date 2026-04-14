import { useState, useMemo, useCallback } from "react";
import Header from "../Layout/Header";
import SearchInput from "../common/SearchInput";
import FilterDropdown from "../common/FilterDropdown";
import LedgerList from "./LedgerList";
import MappingForm from "./MappingForm";
import Modal from "../common/Modal";
import ToastContainer from "../common/Toast";
import type { ToastData } from "../common/Toast";
import { bsCoreLedgers as initialLedgers } from "../../data/bsLedgers";
import { bsMappings as initialBsMappings } from "../../data/mappings";
import type { BSMapping, BSCategory, MappingStatus } from "../../types";
import { AlertTriangle, RefreshCw, EyeOff, Eye, Loader2 } from "lucide-react";
import MappingHistory from "./MappingHistory";
import type { MappingHistoryEntry } from "./MappingHistory";
import { useLanguage } from "../../i18n/LanguageContext";

function nowTimestamp(): string {
  const d = new Date();
  return d.getFullYear() + "/" +
    String(d.getMonth() + 1).padStart(2, "0") + "/" +
    String(d.getDate()).padStart(2, "0") + " " +
    String(d.getHours()).padStart(2, "0") + ":" +
    String(d.getMinutes()).padStart(2, "0") + ":" +
    String(d.getSeconds()).padStart(2, "0");
}

const categoryOptions = [
  { value: "All", label: "All Categories" },
  { value: "Current Assets", label: "Current Assets" },
  { value: "Non-Current Assets", label: "Non-Current Assets" },
  { value: "Current Liabilities", label: "Current Liabilities" },
  { value: "Non-Current Liabilities", label: "Non-Current Liabilities" },
  { value: "Equity", label: "Equity" },
];

export default function BSMappingPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [mappings, setMappings] = useState<BSMapping[]>(initialBsMappings);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [excludedCodes, setExcludedCodes] = useState<Set<string>>(new Set());
  const [showExcluded, setShowExcluded] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [includeModalOpen, setIncludeModalOpen] = useState(false);
  const [historyLog, setHistoryLog] = useState<MappingHistoryEntry[]>([
    { id: "seed-1", timestamp: "2026/03/28 10:15:30", user: "yeshwant", action: "Created", ledgerCode: "110201", ledgerName: "외화보통예금(USD)", details: "Mapped to Amaranth 12600002 / Vendor 00003 / USD" },
    { id: "seed-2", timestamp: "2026/03/28 10:18:45", user: "yeshwant", action: "Created", ledgerCode: "110202", ledgerName: "외화보통예금(THB)", details: "Mapped to Amaranth 12600002 / Vendor 00105 / THB" },
    { id: "seed-3", timestamp: "2026/03/29 14:22:10", user: "sundariya", action: "Updated", ledgerCode: "110202", ledgerName: "외화보통예금(THB)", details: "Changed vendor from 00003 to 00105" },
    { id: "seed-4", timestamp: "2026/03/30 09:05:55", user: "yeshwant", action: "Excluded", ledgerCode: "990101", ledgerName: "잡손실(비경상)", details: "Excluded from integration" },
    { id: "seed-5", timestamp: "2026/04/01 11:30:00", user: "sundariya", action: "Included", ledgerCode: "990101", ledgerName: "잡손실(비경상)", details: "Included back into integration" },
  ]);

  const addHistoryEntry = useCallback((action: MappingHistoryEntry["action"], ledgerCode: string, ledgerName: string, details: string) => {
    setHistoryLog((prev) => [{
      id: Date.now().toString(),
      timestamp: nowTimestamp(),
      user: "yeshwant",
      action,
      ledgerCode,
      ledgerName,
      details,
    }, ...prev]);
  }, []);

  const addToast = useCallback((type: ToastData["type"], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const ledgers = initialLedgers;

  const filteredLedgers = useMemo(() => {
    return ledgers.filter((l) => {
      const matchesSearch =
        search === "" ||
        l.code.toLowerCase().includes(search.toLowerCase()) ||
        l.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        category === "All" || l.category === (category as BSCategory);
      const matchesExcluded = showExcluded || !excludedCodes.has(l.code);
      return matchesSearch && matchesCategory && matchesExcluded;
    });
  }, [search, category, ledgers, excludedCodes, showExcluded]);

  const getMappingStatus = useCallback(
    (code: string): MappingStatus => {
      if (excludedCodes.has(code)) return "Excluded";
      const mapped = mappings.some((m) => m.coreLedgerCodes.includes(code));
      if (mapped) return "Mapped";
      return "Unmapped";
    },
    [mappings, excludedCodes]
  );

  const toggleLedger = (code: string) => {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const existingMapping = useMemo(() => {
    if (selectedCodes.size === 0) return undefined;
    const codes = Array.from(selectedCodes);
    const mapping = mappings.find((m) =>
      codes.some((c) => m.coreLedgerCodes.includes(c))
    );
    if (!mapping) return undefined;
    return {
      amaranthCode: mapping.amaranthCode,
      amaranthName: mapping.amaranthName,
      vendorCode: mapping.vendorCode,
      vendorName: mapping.vendorName,
      currencyCode: mapping.currencyCode,
    };
  }, [selectedCodes, mappings]);

  const handleSave = (data: {
    amaranthCode: string;
    amaranthName: string;
    vendorCode: string;
    vendorName: string;
    currencyCode: string;
  }) => {
    if (!data.amaranthCode || !data.vendorCode || !data.currencyCode) {
      addToast("error", "Amaranth GL Code, Vendor Code, and Currency are required for BS mappings");
      return;
    }
    const codes = Array.from(selectedCodes);
    setMappings((prev) => {
      const updated = prev
        .map((m) => ({
          ...m,
          coreLedgerCodes: m.coreLedgerCodes.filter((c) => !codes.includes(c)),
        }))
        .filter((m) => m.coreLedgerCodes.length > 0);
      return [
        ...updated,
        {
          coreLedgerCodes: codes,
          amaranthCode: data.amaranthCode,
          amaranthName: data.amaranthName,
          vendorCode: data.vendorCode,
          vendorName: data.vendorName,
          currencyCode: data.currencyCode,
        },
      ];
    });
    codes.forEach((code) => {
      const ledger = ledgers.find((l) => l.code === code);
      const isUpdate = mappings.some((m) => m.coreLedgerCodes.includes(code));
      addHistoryEntry(
        isUpdate ? "Updated" : "Created",
        code,
        ledger?.name || code,
        `Mapped to Amaranth ${data.amaranthCode} / Vendor ${data.vendorCode} / ${data.currencyCode}`
      );
    });
    addToast("success", `Mapping saved for ${codes.length} ledger(s)`);
    setSelectedCodes(new Set());
  };

  const removeMappingsForCodes = (codes: string[]) => {
    setMappings((prev) =>
      prev
        .map((m) => ({
          ...m,
          coreLedgerCodes: m.coreLedgerCodes.filter((c) => !codes.includes(c)),
        }))
        .filter((m) => m.coreLedgerCodes.length > 0)
    );
  };

  const handleClear = () => {
    const codes = Array.from(selectedCodes);
    const hasMappings = mappings.some((m) =>
      codes.some((c) => m.coreLedgerCodes.includes(c))
    );
    if (hasMappings) {
      codes.forEach((code) => {
        const ledger = ledgers.find((l) => l.code === code);
        addHistoryEntry("Removed", code, ledger?.name || code, "Mapping removed");
      });
      removeMappingsForCodes(codes);
      addToast("success", "Mapping removed successfully");
    }
    setSelectedCodes(new Set());
  };

  const handleDeleteMapping = () => {
    const codes = Array.from(selectedCodes);
    codes.forEach((code) => {
      const ledger = ledgers.find((l) => l.code === code);
      addHistoryEntry("Removed", code, ledger?.name || code, "Mapping removed");
    });
    removeMappingsForCodes(codes);
    addToast("success", "Mapping removed successfully");
    setSelectedCodes(new Set());
  };

  const hasGl216Warning = Array.from(selectedCodes).some((code) => {
    const ledger = ledgers.find((l) => l.code === code);
    return ledger?.glCode === "216";
  });

  // --- Sync from Core ---
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const handleSync = () => {
    setSyncLoading(true);
    setTimeout(() => {
      setSyncLoading(false);
      const now = new Date();
      const ts = now.getFullYear() + "/" +
        String(now.getMonth() + 1).padStart(2, "0") + "/" +
        String(now.getDate()).padStart(2, "0") + " " +
        String(now.getHours()).padStart(2, "0") + ":" +
        String(now.getMinutes()).padStart(2, "0") + ":" +
        String(now.getSeconds()).padStart(2, "0");
      setLastSyncTime(ts);
      addToast("success", "Ledger list synced from Core system");
    }, 1500);
  };

  // --- Exclude Ledger ---
  const handleExclude = () => {
    const codes = Array.from(selectedCodes);
    removeMappingsForCodes(codes);
    codes.forEach((code) => {
      const ledger = ledgers.find((l) => l.code === code);
      addHistoryEntry("Excluded", code, ledger?.name || code, "Excluded from integration");
    });
    setExcludedCodes((prev) => {
      const next = new Set(prev);
      codes.forEach((c) => next.add(c));
      return next;
    });
    addToast("warning", `${codes.length} ledger(s) excluded from integration`);
    setSelectedCodes(new Set());
  };

  // --- Include Ledger ---
  const handleInclude = (codes: string[]) => {
    codes.forEach((code) => {
      const ledger = ledgers.find((l) => l.code === code);
      addHistoryEntry("Included", code, ledger?.name || code, "Included back into integration");
    });
    setExcludedCodes((prev) => {
      const next = new Set(prev);
      codes.forEach((c) => next.delete(c));
      return next;
    });
    addToast("success", `${codes.length} ledger(s) included back`);
  };

  const excludedLedgers = ledgers.filter((l) => excludedCodes.has(l.code));

  return (
    <div>
      <Header
        title={t("page.bsMapping.title")}
        subtitle={t("page.bsMapping.subtitle")}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="p-6">
        <div className="flex justify-end mb-4">
          <MappingHistory entries={historyLog} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel — Core Ledgers */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="p-4 border-b border-slate-200 space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">
                {t("label.coreSystemLedgers")}
              </h3>
              <div className="flex gap-3">
                <div className="flex-1">
                  <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by code or name..."
                  />
                </div>
                <FilterDropdown
                  value={category}
                  onChange={setCategory}
                  options={categoryOptions}
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showExcluded}
                  onChange={(e) => setShowExcluded(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Show Excluded ({excludedCodes.size})
              </label>
            </div>

            <LedgerList
              type="bs"
              ledgers={filteredLedgers}
              selectedCodes={selectedCodes}
              onToggle={toggleLedger}
              getMappingStatus={getMappingStatus}
              excludedCodes={excludedCodes}
            />

            <div className="p-3 border-t border-slate-200 space-y-2">
              <div className="flex gap-2">
              <button
                onClick={handleSync}
                disabled={syncLoading}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50"
              >
                {syncLoading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <RefreshCw size={12} />
                )}
                Sync from Core
              </button>
              <button
                onClick={handleExclude}
                disabled={selectedCodes.size === 0}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded border ${
                  selectedCodes.size > 0
                    ? "text-red-600 border-red-300 hover:bg-red-50"
                    : "text-slate-300 border-slate-200 cursor-not-allowed"
                }`}
              >
                <EyeOff size={12} />
                Exclude{selectedCodes.size > 0 ? ` (${selectedCodes.size})` : ""}
              </button>
              {excludedCodes.size > 0 && (
                <button
                  onClick={() => setIncludeModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-600 border border-green-300 rounded hover:bg-green-50"
                >
                  <Eye size={12} />
                  Include ({excludedCodes.size})
                </button>
              )}
              </div>
              <div className="text-xs">
                {lastSyncTime ? (
                  <span className="text-slate-500">Last synced: {lastSyncTime}</span>
                ) : (
                  <span className="text-slate-400">Last synced: Never</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel — Mapping Configuration */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            {selectedCodes.size === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-slate-400 py-20">
                Select one or more ledgers on the left to configure mapping
              </div>
            ) : (
              <>
                {hasGl216Warning && (
                  <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-700">
                    <AlertTriangle size={16} />
                    Unused Ledger Warning: GL 216 items detected
                  </div>
                )}

                <div className="mb-4 p-3 bg-slate-50 rounded-md">
                  <p className="text-xs text-slate-500 mb-1">Selected Ledgers:</p>
                  <div className="space-y-1">
                    {Array.from(selectedCodes).map((code) => {
                      const ledger = ledgers.find((l) => l.code === code);
                      return (
                        <div key={code} className="text-sm">
                          <span className="font-mono text-xs text-slate-500">{code}</span>{" "}
                          <span className="text-slate-700">{ledger?.name}</span>{" "}
                          <span className="text-xs text-slate-400">({ledger?.currency})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <MappingForm
                  type="bs"
                  selectedCount={selectedCodes.size}
                  initialData={existingMapping}
                  onSave={handleSave}
                  onClear={handleClear}
                  onDelete={handleDeleteMapping}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Include Ledger Modal */}
      <Modal open={includeModalOpen} onClose={() => setIncludeModalOpen(false)} title="Excluded Ledgers">
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            Select ledgers to include back into the mapping list.
          </p>
          {excludedLedgers.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No excluded ledgers</p>
          ) : (
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-md">
              {excludedLedgers.map((ledger) => (
                <div
                  key={ledger.code}
                  className="flex items-center justify-between px-3 py-2 hover:bg-slate-50"
                >
                  <div>
                    <span className="font-mono text-xs text-slate-500">{ledger.code}</span>{" "}
                    <span className="text-sm text-slate-700">{ledger.name}</span>{" "}
                    <span className="text-xs text-slate-400">({ledger.currency})</span>
                  </div>
                  <button
                    onClick={() => {
                      handleInclude([ledger.code]);
                      if (excludedCodes.size <= 1) setIncludeModalOpen(false);
                    }}
                    className="px-2 py-1 text-xs font-medium text-green-600 border border-green-300 rounded hover:bg-green-50"
                  >
                    Include
                  </button>
                </div>
              ))}
            </div>
          )}
          {excludedLedgers.length > 1 && (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  handleInclude(excludedLedgers.map((l) => l.code));
                  setIncludeModalOpen(false);
                }}
                className="px-3 py-1.5 text-xs font-medium text-green-600 border border-green-300 rounded hover:bg-green-50"
              >
                Include All ({excludedLedgers.length})
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
