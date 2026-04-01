import { useState, useMemo, useCallback } from "react";
import Header from "../Layout/Header";
import SearchInput from "../common/SearchInput";
import FilterDropdown from "../common/FilterDropdown";
import LedgerList from "./LedgerList";
import MappingForm from "./MappingForm";
import ToastContainer from "../common/Toast";
import type { ToastData } from "../common/Toast";
import { plCoreLedgers } from "../../data/plLedgers";
import { plMappings as initialPlMappings } from "../../data/mappings";
import { departments } from "../../data/departments";
import type { PLMapping, PLCategory, MappingStatus } from "../../types";
import { AlertTriangle } from "lucide-react";

const categoryOptions = [
  { value: "All", label: "All Categories" },
  { value: "Operating Revenue", label: "Operating Revenue" },
  { value: "Operating Expenses", label: "Operating Expenses" },
  { value: "Non-Operating Income", label: "Non-Operating Income" },
  { value: "Non-Operating Expenses", label: "Non-Operating Expenses" },
  { value: "Corporate Tax", label: "Corporate Tax" },
];

export default function PLMappingPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [mappings, setMappings] = useState<PLMapping[]>(initialPlMappings);
  const [toasts, setToasts] = useState<ToastData[]>([]);

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
      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  const getMappingStatus = useCallback(
    (code: string): MappingStatus => {
      const mapped = mappings.some((m) => m.coreLedgerCode === code);
      if (mapped) return "Mapped";
      const ledger = plCoreLedgers.find((l) => l.code === code);
      if (ledger?.glCode === "148") return "Excluded";
      return "Unmapped";
    },
    [mappings]
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
    addToast("success", "PL mapping saved");
  };

  const handleClear = () => {
    setSelectedCode(null);
  };

  const handleDelete = () => {
    if (!selectedCode) return;
    setMappings((prev) => prev.filter((m) => m.coreLedgerCode !== selectedCode));
    addToast("warning", "PL mapping deleted");
    setSelectedCode(null);
  };

  const hasGl148Warning = selectedCode
    ? plCoreLedgers.find((l) => l.code === selectedCode)?.glCode === "148"
    : false;

  const selectedLedger = selectedCode
    ? plCoreLedgers.find((l) => l.code === selectedCode)
    : null;

  return (
    <div>
      <Header
        title="PL Account Mapping"
        subtitle="Profit & Loss — Core System → Amaranth 10 (1:1 Strict)"
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="p-4 border-b border-slate-200 space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">
                Core System P&L Ledgers
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
            </div>

            <LedgerList
              type="pl"
              ledgers={filteredLedgers}
              selectedCode={selectedCode}
              onSelect={setSelectedCode}
              getMappingStatus={getMappingStatus}
            />
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
    </div>
  );
}
