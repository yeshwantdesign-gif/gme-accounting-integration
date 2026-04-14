import { useState, useMemo, useCallback } from "react";
import Header from "../Layout/Header";
import SearchInput from "../common/SearchInput";
import FilterDropdown from "../common/FilterDropdown";
import LedgerList from "./LedgerList";
import MappingForm from "./MappingForm";
import Modal from "../common/Modal";
import ToastContainer from "../common/Toast";
import type { ToastData } from "../common/Toast";
import { plCoreLedgers } from "../../data/plLedgers";
import { plMappings as initialPlMappings } from "../../data/mappings";
import { departments } from "../../data/departments";
import type { PLMapping, PLCategory, MappingStatus } from "../../types";
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
  { value: "Operating Revenue", label: "Operating Revenue" },
  { value: "Operating Expenses", label: "Operating Expenses" },
  { value: "Non-Operating Income", label: "Non-Operating Income" },
  { value: "Non-Operating Expenses", label: "Non-Operating Expenses" },
  { value: "Corporate Tax", label: "Corporate Tax" },
];

export default function PLMappingPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [mappings, setMappings] = useState<PLMapping[]>(initialPlMappings);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [excludedCodes, setExcludedCodes] = useState<Set<string>>(new Set());
  const [showExcluded, setShowExcluded] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [includeModalOpen, setIncludeModalOpen] = useState(false);
  const [historyLog, setHistoryLog] = useState<MappingHistoryEntry[]>([
    { id: "seed-1", timestamp: "2026/03/28 11:20:15", user: "yeshwant", action: "Created", ledgerCode: "401001", ledgerName: "소액해외송금 당발송금 수익 (개인)", details: "Mapped to Amaranth 4010001 / Dept 211000" },
    { id: "seed-2", timestamp: "2026/03/29 09:45:30", user: "sundariya", action: "Created", ledgerCode: "854001", ledgerName: "소액해외송금 해외협력사수수료 비용", details: "Mapped to Amaranth 8540001 / Dept 211000" },
    { id: "seed-3", timestamp: "2026/03/30 16:10:05", user: "yeshwant", action: "Updated", ledgerCode: "401001", ledgerName: "소액해외송금 당발송금 수익 (개인)", details: "Changed department from 120000 to 211000" },
    { id: "seed-4", timestamp: "2026/04/01 10:00:20", user: "yeshwant", action: "Excluded", ledgerCode: "999001", ledgerName: "법인세비용(당기)", details: "Excluded from integration" },
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

  const filteredLedgers = useMemo(() => {
    return plCoreLedgers.filter((l) => {
      const matchesSearch =
        search === "" ||
        l.code.toLowerCase().includes(search.toLowerCase()) ||
        l.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        category === "All" || l.category === (category as PLCategory);
      const matchesExcluded = showExcluded || !excludedCodes.has(l.code);
      return matchesSearch && matchesCategory && matchesExcluded;
    });
  }, [search, category, excludedCodes, showExcluded]);

  const getMappingStatus = useCallback(
    (code: string): MappingStatus => {
      if (excludedCodes.has(code)) return "Excluded";
      const mapped = mappings.some((m) => m.coreLedgerCode === code);
      if (mapped) return "Mapped";
      return "Unmapped";
    },
    [mappings, excludedCodes]
  );

  const existingMapping = useMemo(() => {
    if (!selectedCode) return undefined;
    const mapping = mappings.find((m) => m.coreLedgerCode === selectedCode);
    if (!mapping) return undefined;
    return {
      amaranthCode: mapping.amaranthCode,
      amaranthName: mapping.amaranthName,
      departmentCode: mapping.departmentCode,
      departmentName: mapping.departmentName,
    };
  }, [selectedCode, mappings]);

  const handleSave = (data: {
    amaranthCode: string;
    amaranthName: string;
    departmentCode: string;
    departmentName: string;
  }) => {
    if (!selectedCode) return;
    if (!data.amaranthCode || !data.departmentCode) {
      addToast("error", "Amaranth GL Code and Department are required for PL mappings");
      return;
    }
    setMappings((prev) => {
      const filtered = prev.filter((m) => m.coreLedgerCode !== selectedCode);
      return [
        ...filtered,
        {
          coreLedgerCode: selectedCode,
          amaranthCode: data.amaranthCode,
          amaranthName: data.amaranthName,
          departmentCode: data.departmentCode,
          departmentName: data.departmentName,
        },
      ];
    });
    const ledger = plCoreLedgers.find((l) => l.code === selectedCode);
    const isUpdate = mappings.some((m) => m.coreLedgerCode === selectedCode);
    addHistoryEntry(
      isUpdate ? "Updated" : "Created",
      selectedCode,
      ledger?.name || selectedCode,
      `Mapped to Amaranth ${data.amaranthCode} / Dept ${data.departmentCode}`
    );
    addToast("success", "PL mapping saved");
    setSelectedCode(null);
  };

  const handleClear = () => {
    if (selectedCode) {
      const hasMapping = mappings.some((m) => m.coreLedgerCode === selectedCode);
      if (hasMapping) {
        const ledger = plCoreLedgers.find((l) => l.code === selectedCode);
        addHistoryEntry("Removed", selectedCode, ledger?.name || selectedCode, "Mapping removed");
        setMappings((prev) => prev.filter((m) => m.coreLedgerCode !== selectedCode));
        addToast("success", "Mapping removed successfully");
      }
    }
    setSelectedCode(null);
  };

  const handleDelete = () => {
    if (!selectedCode) return;
    const ledger = plCoreLedgers.find((l) => l.code === selectedCode);
    addHistoryEntry("Removed", selectedCode, ledger?.name || selectedCode, "Mapping removed");
    setMappings((prev) => prev.filter((m) => m.coreLedgerCode !== selectedCode));
    addToast("success", "Mapping removed successfully");
    setSelectedCode(null);
  };

  const hasGl148Warning = selectedCode
    ? plCoreLedgers.find((l) => l.code === selectedCode)?.glCode === "148"
    : false;

  const selectedLedger = selectedCode
    ? plCoreLedgers.find((l) => l.code === selectedCode)
    : null;

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
    if (!selectedCode) return;
    const ledger = plCoreLedgers.find((l) => l.code === selectedCode);
    addHistoryEntry("Excluded", selectedCode, ledger?.name || selectedCode, "Excluded from integration");
    setMappings((prev) => prev.filter((m) => m.coreLedgerCode !== selectedCode));
    setExcludedCodes((prev) => {
      const next = new Set(prev);
      next.add(selectedCode);
      return next;
    });
    addToast("warning", "1 ledger(s) excluded from integration");
    setSelectedCode(null);
  };

  // --- Include Ledger ---
  const handleInclude = (codes: string[]) => {
    codes.forEach((code) => {
      const ledger = plCoreLedgers.find((l) => l.code === code);
      addHistoryEntry("Included", code, ledger?.name || code, "Included back into integration");
    });
    setExcludedCodes((prev) => {
      const next = new Set(prev);
      codes.forEach((c) => next.delete(c));
      return next;
    });
    addToast("success", `${codes.length} ledger(s) included back`);
  };

  const excludedLedgers = plCoreLedgers.filter((l) => excludedCodes.has(l.code));

  return (
    <div>
      <Header
        title={t("page.plMapping.title")}
        subtitle={t("page.plMapping.subtitle")}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="p-6">
        <div className="flex justify-end mb-4">
          <MappingHistory entries={historyLog} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="p-4 border-b border-slate-200 space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">
                {t("label.corePLLedgers")}
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
              type="pl"
              ledgers={filteredLedgers}
              selectedCode={selectedCode}
              onSelect={setSelectedCode}
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
                disabled={!selectedCode}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded border ${
                  selectedCode
                    ? "text-red-600 border-red-300 hover:bg-red-50"
                    : "text-slate-300 border-slate-200 cursor-not-allowed"
                }`}
              >
                <EyeOff size={12} />
                Exclude
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

          {/* Right Panel */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            {!selectedCode ? (
              <div className="flex items-center justify-center h-full text-sm text-slate-400 py-20">
                Select a ledger on the left to configure mapping
              </div>
            ) : (
              <>
                {hasGl148Warning && (
                  <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-700">
                    <AlertTriangle size={16} />
                    Unused Ledger Warning: GL 148 item detected
                  </div>
                )}

                <div className="mb-4 p-3 bg-slate-50 rounded-md">
                  <p className="text-xs text-slate-500 mb-1">Selected Ledger:</p>
                  <div className="text-sm">
                    <span className="font-mono text-xs text-slate-500">{selectedCode}</span>{" "}
                    <span className="text-slate-700">{selectedLedger?.name}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    GL {selectedLedger?.glCode}: {selectedLedger?.glName} | {selectedLedger?.category}
                  </div>
                </div>

                <MappingForm
                  type="pl"
                  selectedCount={1}
                  initialData={existingMapping}
                  departments={departments.map((d) => ({
                    code: d.code,
                    name: d.name,
                    level: d.level,
                  }))}
                  onSave={handleSave}
                  onClear={handleClear}
                  onDelete={handleDelete}
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
                    <span className="text-sm text-slate-700">{ledger.name}</span>
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
