import { useState, useMemo, useCallback } from "react";
import Header from "../Layout/Header";
import IntegrationTable from "./IntegrationTable";
import IntegrationSummary from "./IntegrationSummary";
import ExecuteModal from "./ExecuteModal";
import ToastContainer from "../common/Toast";
import type { ToastData } from "../common/Toast";
import {
  bsIntegrationData as initialBsData,
  plIntegrationData as initialPlData,
} from "../../data/integrationHistory";
import type { BSIntegrationEntry, PLIntegrationEntry } from "../../types";
import { calculateDrCr } from "../../utils/drCrCalculator";
import { Download, Play, Loader2 } from "lucide-react";

export default function AutoIntegrationPage() {
  const [activeTab, setActiveTab] = useState<"bs" | "pl">("bs");
  const [method, setMethod] = useState<"gross" | "net">("gross");
  const [bsDate, setBsDate] = useState("2026-03-31");
  const [plDateFrom, setPlDateFrom] = useState("2026-03-01");
  const [plDateTo, setPlDateTo] = useState("2026-03-31");
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [bsData, setBsData] = useState<BSIntegrationEntry[]>([]);
  const [plData, setPlData] = useState<PLIntegrationEntry[]>([]);
  const [modalMode, setModalMode] = useState<"confirm" | "success" | "error" | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((type: ToastData["type"], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleFetch = () => {
    setLoading(true);
    setTimeout(() => {
      setBsData(initialBsData.map((d) => ({ ...d })));
      setPlData(initialPlData.map((d) => ({ ...d })));
      setFetched(true);
      setLoading(false);
      addToast("success", "Data fetched successfully");
    }, 1500);
  };

  // Display data: Gross passes raw data, Net computes netted entries
  const displayBsData = useMemo(() => {
    if (method === "gross") return bsData;

    const groups = new Map<string, BSIntegrationEntry[]>();
    bsData.forEach((entry) => {
      const key = `${entry.amaranthCode}|${entry.vendorCode}|${entry.currency}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(entry);
    });

    return Array.from(groups.values()).map((entries): BSIntegrationEntry => {
      const first = entries[0];
      const netDeltaKrw = entries.reduce((sum, e) => sum + e.deltaKrw, 0);
      const netDeltaFcy = entries.reduce((sum, e) => sum + e.deltaFcy, 0);
      const { drCr } = calculateDrCr(first.accountNature, netDeltaKrw, true);

      return {
        amaranthCode: first.amaranthCode,
        amaranthName: first.amaranthName,
        vendorCode: first.vendorCode,
        vendorName: first.vendorName,
        currency: first.currency,
        coreFcyBalance: entries.reduce((s, e) => s + e.coreFcyBalance, 0),
        coreKrwBalance: entries.reduce((s, e) => s + e.coreKrwBalance, 0),
        amaranthFcyBalance: entries.reduce((s, e) => s + e.amaranthFcyBalance, 0),
        amaranthKrwBalance: entries.reduce((s, e) => s + e.amaranthKrwBalance, 0),
        deltaFcy: netDeltaFcy,
        deltaKrw: netDeltaKrw,
        drCr,
        accountNature: first.accountNature,
        selected: entries.every((e) => e.selected),
      };
    });
  }, [bsData, method]);

  const displayPlData = useMemo(() => {
    if (method === "gross") return plData;

    const groups = new Map<string, PLIntegrationEntry[]>();
    plData.forEach((entry) => {
      const key = `${entry.amaranthCode}|${entry.deptCode}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(entry);
    });

    return Array.from(groups.values()).map((entries): PLIntegrationEntry => {
      const first = entries[0];
      const netDeltaKrw = entries.reduce((sum, e) => sum + e.deltaKrw, 0);
      const { drCr } = calculateDrCr(first.accountNature, netDeltaKrw, false);

      return {
        amaranthCode: first.amaranthCode,
        amaranthName: first.amaranthName,
        deptCode: first.deptCode,
        deptName: first.deptName,
        coreKrwBalance: entries.reduce((s, e) => s + e.coreKrwBalance, 0),
        amaranthKrwBalance: entries.reduce((s, e) => s + e.amaranthKrwBalance, 0),
        deltaKrw: netDeltaKrw,
        drCr,
        accountNature: first.accountNature,
        selected: entries.every((e) => e.selected),
      };
    });
  }, [plData, method]);

  const toggleBs = (index: number) => {
    if (method === "gross") {
      setBsData((prev) =>
        prev.map((d, i) => (i === index ? { ...d, selected: !d.selected } : d))
      );
    } else {
      const entry = displayBsData[index];
      const key = `${entry.amaranthCode}|${entry.vendorCode}|${entry.currency}`;
      const newSelected = !entry.selected;
      setBsData((prev) =>
        prev.map((d) =>
          `${d.amaranthCode}|${d.vendorCode}|${d.currency}` === key
            ? { ...d, selected: newSelected }
            : d
        )
      );
    }
  };

  const togglePl = (index: number) => {
    if (method === "gross") {
      setPlData((prev) =>
        prev.map((d, i) => (i === index ? { ...d, selected: !d.selected } : d))
      );
    } else {
      const entry = displayPlData[index];
      const key = `${entry.amaranthCode}|${entry.deptCode}`;
      const newSelected = !entry.selected;
      setPlData((prev) =>
        prev.map((d) =>
          `${d.amaranthCode}|${d.deptCode}` === key
            ? { ...d, selected: newSelected }
            : d
        )
      );
    }
  };

  const currentData = activeTab === "bs" ? displayBsData : displayPlData;
  const selectedData = activeTab === "bs"
    ? displayBsData.filter((d) => d.selected)
    : displayPlData.filter((d) => d.selected);

  const summary = useMemo(() => {
    let totalDr = 0;
    let totalCr = 0;

    const data = activeTab === "bs" ? displayBsData : displayPlData;
    data.filter((d) => d.selected).forEach((d) => {
      const amount = Math.abs(d.deltaKrw);
      if (d.drCr === 3) totalDr += amount;
      else totalCr += amount;
    });

    return {
      totalDr,
      totalCr,
      net: totalDr - totalCr,
      entryCount: currentData.length,
      selectedCount: selectedData.length,
    };
  }, [activeTab, displayBsData, displayPlData, currentData, selectedData]);

  const handleExecute = () => {
    setModalMode("confirm");
  };

  const handleConfirmExecute = () => {
    setModalMode(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setModalMode("success");
      addToast("success", "Integration executed successfully");
    }, 1500);
  };

  return (
    <div>
      <Header
        title="Auto Voucher Integration"
        subtitle="Automated data integration — Core System → Amaranth 10"
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="p-6 space-y-4">
        {/* Controls */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex flex-wrap items-end gap-4">
            {/* Tab switcher */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
              <div className="flex rounded-md border border-slate-300 overflow-hidden">
                <button
                  onClick={() => setActiveTab("bs")}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === "bs"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  BS
                </button>
                <button
                  onClick={() => setActiveTab("pl")}
                  className={`px-4 py-2 text-sm font-medium border-l border-slate-300 ${
                    activeTab === "pl"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  PL
                </button>
              </div>
            </div>

            {/* Date picker */}
            {activeTab === "bs" ? (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                <input
                  type="date"
                  value={bsDate}
                  onChange={(e) => setBsDate(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ) : (
              <div className="flex gap-2 items-end">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">From</label>
                  <input
                    type="date"
                    value={plDateFrom}
                    onChange={(e) => setPlDateFrom(e.target.value)}
                    className="px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">To</label>
                  <input
                    type="date"
                    value={plDateTo}
                    onChange={(e) => setPlDateTo(e.target.value)}
                    className="px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Method toggle */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Method</label>
              <div className="flex rounded-md border border-slate-300 overflow-hidden">
                <button
                  onClick={() => setMethod("gross")}
                  className={`px-3 py-2 text-sm font-medium ${
                    method === "gross"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Gross
                </button>
                <button
                  onClick={() => setMethod("net")}
                  className={`px-3 py-2 text-sm font-medium border-l border-slate-300 ${
                    method === "net"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Net
                </button>
              </div>
            </div>

            {/* Fetch button */}
            <button
              onClick={handleFetch}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              Fetch Data
            </button>
          </div>
        </div>

        {/* Summary */}
        {fetched && <IntegrationSummary {...summary} />}

        {/* Loading skeleton */}
        {loading && !fetched && (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <Loader2 size={32} className="animate-spin mx-auto text-blue-500 mb-3" />
            <p className="text-sm text-slate-500">Fetching integration data...</p>
          </div>
        )}

        {/* Data Table */}
        {fetched && !loading && (
          <>
            {activeTab === "bs" ? (
              <IntegrationTable type="bs" data={displayBsData} onToggle={toggleBs} />
            ) : (
              <IntegrationTable type="pl" data={displayPlData} onToggle={togglePl} />
            )}

            {/* Execute button */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center justify-between">
              <div className="text-sm text-slate-500">
                <span className="font-medium text-slate-700">Executor:</span> yeshwant |{" "}
                <span className="font-medium text-slate-700">Timestamp:</span>{" "}
                {new Date().toISOString().replace("T", " ").substring(0, 19)}
              </div>
              <button
                onClick={handleExecute}
                disabled={selectedData.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Play size={16} />
                Execute Integration
              </button>
            </div>
          </>
        )}
      </div>

      {modalMode && (
        <ExecuteModal
          open={true}
          onClose={() => setModalMode(null)}
          onConfirm={handleConfirmExecute}
          mode={modalMode}
          totalDr={summary.totalDr}
          totalCr={summary.totalCr}
          entryCount={summary.selectedCount}
          type="Auto"
        />
      )}
    </div>
  );
}
