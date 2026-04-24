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
import type { BSCategory, MappingStatus } from "../../types";
import { AlertTriangle, RefreshCw, EyeOff, Eye, Loader2 } from "lucide-react";
import MappingHistory from "./MappingHistory";
import { useLanguage } from "../../i18n/LanguageContext";
import { useMappingContext } from "../../context/MappingContext";

export default function BSMappingPage() {
  const { t } = useLanguage();

  const categoryOptions = [
    { value: "All", label: t("label.allCategories") },
    { value: "Current Assets", label: t("cat.currentAssets") },
    { value: "Non-Current Assets", label: t("cat.nonCurrentAssets") },
    { value: "Current Liabilities", label: t("cat.currentLiabilities") },
    { value: "Non-Current Liabilities", label: t("cat.nonCurrentLiabilities") },
    { value: "Equity", label: t("cat.equity") },
  ];
  const {
    bsMappings: mappings, setBsMappings: setMappings,
    bsExcludedCodes: excludedCodes, setBsExcludedCodes: setExcludedCodes,
    bsLastSyncTime: lastSyncTime, setBsLastSyncTime: setLastSyncTime,
    bsHistoryLog: historyLog, addBsHistoryEntry: addHistoryEntry,
  } = useMappingContext();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [showExcluded, setShowExcluded] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [includeModalOpen, setIncludeModalOpen] = useState(false);

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
      addToast("error", t("toast.bsMappingRequired"));
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
    addToast("success", `${t("toast.mappingSavedForLedgers")} ${codes.length} ${t("toast.ledgersUnit")}`);
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
      addToast("success", t("toast.mappingRemoved"));
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
    addToast("success", t("toast.mappingRemoved"));
    setSelectedCodes(new Set());
  };

  const hasGl216Warning = Array.from(selectedCodes).some((code) => {
    const ledger = ledgers.find((l) => l.code === code);
    return ledger?.glCode === "216";
  });

  // --- Sync from Core ---
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
      addToast("success", t("toast.ledgersSynced"));
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
    addToast("warning", `${codes.length} ${t("toast.ledgersExcluded")}`);
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
    addToast("success", `${codes.length} ${t("toast.ledgersIncluded")}`);
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
                    placeholder={t("msg.searchByCodeOrName")}
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
                {t("misc.showExcluded")} ({excludedCodes.size})
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
                {t("btn.syncFromCore")}
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
                {t("btn.exclude")}{selectedCodes.size > 0 ? ` (${selectedCodes.size})` : ""}
              </button>
              {excludedCodes.size > 0 && (
                <button
                  onClick={() => setIncludeModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-600 border border-green-300 rounded hover:bg-green-50"
                >
                  <Eye size={12} />
                  {t("btn.include")} ({excludedCodes.size})
                </button>
              )}
              </div>
              <div className="text-xs">
                {lastSyncTime ? (
                  <span className="text-slate-500">{t("label.lastSynced")}: {lastSyncTime}</span>
                ) : (
                  <span className="text-slate-400">{t("label.lastSynced")}: {t("label.never")}</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel — Mapping Configuration */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            {selectedCodes.size === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-slate-400 py-20">
                {t("msg.selectLedgersToMap")}
              </div>
            ) : (
              <>
                {hasGl216Warning && (
                  <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-700">
                    <AlertTriangle size={16} />
                    {t("msg.unusedLedgerWarningGl216")}
                  </div>
                )}

                <div className="mb-4 p-3 bg-slate-50 rounded-md">
                  <p className="text-xs text-slate-500 mb-1">{t("label.selectedLedgers")}:</p>
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
      <Modal open={includeModalOpen} onClose={() => setIncludeModalOpen(false)} title={t("modal.excludedLedgers")}>
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            {t("msg.selectLedgersToInclude")}
          </p>
          {excludedLedgers.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">{t("msg.noExcludedLedgers")}</p>
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
                    {t("btn.include")}
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
                {t("btn.includeAll")} ({excludedLedgers.length})
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
