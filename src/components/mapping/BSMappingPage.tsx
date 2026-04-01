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
import type { BSMapping, BSCategory, BSCoreLedger, MappingStatus } from "../../types";
import { AlertTriangle, Plus, Pencil, Trash2 } from "lucide-react";

const categoryOptions = [
  { value: "All", label: "All Categories" },
  { value: "Current Assets", label: "Current Assets" },
  { value: "Non-Current Assets", label: "Non-Current Assets" },
  { value: "Current Liabilities", label: "Current Liabilities" },
  { value: "Non-Current Liabilities", label: "Non-Current Liabilities" },
  { value: "Equity", label: "Equity" },
];

const categoryValues: BSCategory[] = [
  "Current Assets",
  "Non-Current Assets",
  "Current Liabilities",
  "Non-Current Liabilities",
  "Equity",
];

const currencies = [
  "KRW", "USD", "NPR", "THB", "JPY", "PHP", "VND", "BDT", "EUR", "GBP",
  "IDR", "CNY", "KHR", "MNT", "MMK", "LKR", "PKR", "INR",
];

interface LedgerFormData {
  code: string;
  name: string;
  glCode: string;
  glName: string;
  category: BSCategory;
  currency: string;
  balance: string;
}

const emptyForm: LedgerFormData = {
  code: "",
  name: "",
  glCode: "",
  glName: "",
  category: "Current Assets",
  currency: "KRW",
  balance: "0",
};

export default function BSMappingPage() {
  const [ledgers, setLedgers] = useState<BSCoreLedger[]>([...initialLedgers]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [mappings, setMappings] = useState<BSMapping[]>(initialBsMappings);
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState<LedgerFormData>(emptyForm);

  const addToast = useCallback((type: ToastData["type"], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const filteredLedgers = useMemo(() => {
    return ledgers.filter((l) => {
      const matchesSearch =
        search === "" ||
        l.code.toLowerCase().includes(search.toLowerCase()) ||
        l.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        category === "All" || l.category === (category as BSCategory);
      return matchesSearch && matchesCategory;
    });
  }, [search, category, ledgers]);

  const getMappingStatus = useCallback(
    (code: string): MappingStatus => {
      const mapped = mappings.some((m) => m.coreLedgerCodes.includes(code));
      if (mapped) return "Mapped";
      const ledger = ledgers.find((l) => l.code === code);
      if (ledger?.glCode === "216") return "Excluded";
      return "Unmapped";
    },
    [mappings, ledgers]
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
      const filtered = prev.filter(
        (m) => !codes.some((c) => m.coreLedgerCodes.includes(c))
      );
      return [
        ...filtered,
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
    addToast("success", `Mapping saved for ${codes.length} ledger(s)`);
  };

  const handleClear = () => {
    setSelectedCodes(new Set());
  };

  const handleDeleteMapping = () => {
    const codes = Array.from(selectedCodes);
    setMappings((prev) =>
      prev.filter((m) => !codes.some((c) => m.coreLedgerCodes.includes(c)))
    );
    addToast("warning", "Mapping deleted");
    setSelectedCodes(new Set());
  };

  const hasGl216Warning = Array.from(selectedCodes).some((code) => {
    const ledger = ledgers.find((l) => l.code === code);
    return ledger?.glCode === "216";
  });

  // --- Add Ledger ---
  const openAddModal = () => {
    setFormData({ ...emptyForm });
    setAddModalOpen(true);
  };

  const handleAddLedger = () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      addToast("error", "Ledger Code and Name are required");
      return;
    }
    if (ledgers.some((l) => l.code === formData.code.trim())) {
      addToast("error", `Ledger code "${formData.code.trim()}" already exists`);
      return;
    }
    const newLedger: BSCoreLedger = {
      code: formData.code.trim(),
      name: formData.name.trim(),
      glCode: formData.glCode.trim(),
      glName: formData.glName.trim(),
      category: formData.category,
      currency: formData.currency,
      balance: parseFloat(formData.balance) || 0,
    };
    setLedgers((prev) => [...prev, newLedger]);
    setAddModalOpen(false);
    addToast("success", "Ledger added successfully");
  };

  // --- Edit Ledger ---
  const openEditModal = () => {
    if (selectedCodes.size !== 1) return;
    const code = Array.from(selectedCodes)[0];
    const ledger = ledgers.find((l) => l.code === code);
    if (!ledger) return;
    setFormData({
      code: ledger.code,
      name: ledger.name,
      glCode: ledger.glCode,
      glName: ledger.glName,
      category: ledger.category,
      currency: ledger.currency,
      balance: String(ledger.balance),
    });
    setEditModalOpen(true);
  };

  const handleEditLedger = () => {
    if (!formData.name.trim()) {
      addToast("error", "Ledger Name is required");
      return;
    }
    const editCode = Array.from(selectedCodes)[0];
    setLedgers((prev) =>
      prev.map((l) =>
        l.code === editCode
          ? {
              ...l,
              name: formData.name.trim(),
              glCode: formData.glCode.trim(),
              glName: formData.glName.trim(),
              category: formData.category,
              currency: formData.currency,
              balance: parseFloat(formData.balance) || 0,
            }
          : l
      )
    );
    setEditModalOpen(false);
    addToast("success", "Ledger updated");
  };

  // --- Delete Ledger ---
  const handleDeleteLedgers = () => {
    const codes = new Set(selectedCodes);
    const count = codes.size;
    setLedgers((prev) => prev.filter((l) => !codes.has(l.code)));
    // Also remove any mappings that reference deleted ledgers
    setMappings((prev) =>
      prev
        .map((m) => ({
          ...m,
          coreLedgerCodes: m.coreLedgerCodes.filter((c) => !codes.has(c)),
        }))
        .filter((m) => m.coreLedgerCodes.length > 0)
    );
    setSelectedCodes(new Set());
    setDeleteModalOpen(false);
    addToast("success", `${count} ledger(s) deleted`);
  };

  const updateField = (field: keyof LedgerFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Shared form JSX for Add/Edit modals
  const ledgerFormFields = (isEdit: boolean) => (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Ledger Code *</label>
        <input
          type="text"
          value={formData.code}
          onChange={(e) => updateField("code", e.target.value)}
          disabled={isEdit}
          className={`w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isEdit ? "bg-slate-100 text-slate-500 cursor-not-allowed" : ""
          }`}
          placeholder="e.g., 100099"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Ledger Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => updateField("name", e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., New Bank Account KRW"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">GL Code</label>
          <input
            type="text"
            value={formData.glCode}
            onChange={(e) => updateField("glCode", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 72"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">GL Name</label>
          <input
            type="text"
            value={formData.glName}
            onChange={(e) => updateField("glName", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Bank Deposit KRW"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
        <select
          value={formData.category}
          onChange={(e) => updateField("category", e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categoryValues.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Currency</label>
          <select
            value={formData.currency}
            onChange={(e) => updateField("currency", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {currencies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Balance</label>
          <input
            type="number"
            value={formData.balance}
            onChange={(e) => updateField("balance", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Header
        title="BS Account Mapping"
        subtitle="Balance Sheet — Core System → Amaranth 10"
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel — Core Ledgers */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="p-4 border-b border-slate-200 space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">
                Core System Ledgers
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
              type="bs"
              ledgers={filteredLedgers}
              selectedCodes={selectedCodes}
              onToggle={toggleLedger}
              getMappingStatus={getMappingStatus}
            />

            <div className="p-3 border-t border-slate-200 flex gap-2">
              <button
                onClick={openAddModal}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-300 rounded hover:bg-slate-50"
              >
                <Plus size={12} /> Add Ledger
              </button>
              <button
                onClick={openEditModal}
                disabled={selectedCodes.size !== 1}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded border ${
                  selectedCodes.size === 1
                    ? "text-slate-600 border-slate-300 hover:bg-slate-50"
                    : "text-slate-300 border-slate-200 cursor-not-allowed"
                }`}
              >
                <Pencil size={12} /> Edit Ledger
              </button>
              <button
                onClick={() => setDeleteModalOpen(true)}
                disabled={selectedCodes.size === 0}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded border ${
                  selectedCodes.size > 0
                    ? "text-red-600 border-red-300 hover:bg-red-50"
                    : "text-slate-300 border-slate-200 cursor-not-allowed"
                }`}
              >
                <Trash2 size={12} /> Delete{selectedCodes.size > 0 ? ` (${selectedCodes.size})` : ""}
              </button>
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

      {/* Add Ledger Modal */}
      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add New Ledger">
        {ledgerFormFields(false)}
        <div className="flex gap-2 justify-end mt-5">
          <button
            onClick={() => setAddModalOpen(false)}
            className="px-4 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAddLedger}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Add Ledger
          </button>
        </div>
      </Modal>

      {/* Edit Ledger Modal */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Ledger">
        {ledgerFormFields(true)}
        <div className="flex gap-2 justify-end mt-5">
          <button
            onClick={() => setEditModalOpen(false)}
            className="px-4 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleEditLedger}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Save Changes
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Ledger(s)">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertTriangle size={20} className="text-red-600 shrink-0" />
            <p className="text-sm text-red-700">
              Are you sure you want to delete <strong>{selectedCodes.size}</strong> selected ledger(s)?
              This will also remove any associated mappings.
            </p>
          </div>
          <div className="bg-slate-50 rounded-md p-3 max-h-40 overflow-y-auto space-y-1">
            {Array.from(selectedCodes).map((code) => {
              const ledger = ledgers.find((l) => l.code === code);
              return (
                <div key={code} className="text-sm">
                  <span className="font-mono text-xs text-slate-500">{code}</span>{" "}
                  <span className="text-slate-700">{ledger?.name}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteLedgers}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
