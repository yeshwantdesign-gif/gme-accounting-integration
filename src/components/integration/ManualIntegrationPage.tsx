import { useState, useMemo, useCallback } from "react";
import Header from "../Layout/Header";
import IntegrationTable from "./IntegrationTable";
import IntegrationSummary from "./IntegrationSummary";
import ExecuteModal from "./ExecuteModal";
import ToastContainer from "../common/Toast";
import type { ToastData } from "../common/Toast";
import {
  manualBsIntegrationData as initialBsData,
  manualPlIntegrationData as initialPlData,
} from "../../data/integrationHistory";
import type { BSIntegrationEntry, PLIntegrationEntry } from "../../types";
import { Download, Play, Loader2, UserCheck } from "lucide-react";

export default function ManualIntegrationPage() {
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
      addToast("success", "Manual voucher data fetched");
    }, 1500);
  };

  const toggleBs = (index: number) => {
    setBsData((prev) =>
      prev.map((d, i) => (i === index ? { ...d, selected: !d.selected } : d))
    );
  };

  const togglePl = (index: number) => {
    setPlData((prev) =>
      prev.map((d, i) => (i === index ? { ...d, selected: !d.selected } : d))
    );
  };

  const currentData = activeTab === "bs" ? bsData : plData;
  const selectedData = activeTab === "bs"
    ? bsData.filter((d) => d.selected)
    : plData.filter((d) => d.selected);

  const summary = useMemo(() => {
    let totalDr = 0;
    let totalCr = 0;

    if (activeTab === "bs") {
      bsData.filter((d) => d.selected).forEach((d) => {
        const amount = Math.abs(d.deltaKrw);
        if (d.drCr === 3) totalDr += amount;
        else totalCr += amount;
      });
    } else {
      plData.filter((d) => d.selected).forEach((d) => {
        const amount = Math.abs(d.deltaKrw);
        if (d.drCr === 3) totalDr += amount;
        else totalCr += amount;
      });
    }

    return {
      totalDr,
      totalCr,
      net: totalDr - totalCr,
      entryCount: currentData.length,
      selectedCount: selectedData.length,
    };
  }, [activeTab, bsData, plData, currentData, selectedData]);

  const handleExecute = () => {
    setModalMode("confirm");
  };

  const handleConfirmExecute = () => {
    setModalMode(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setModalMode("success");
      addToast("success", "Manual integration executed successfully");
    }, 1500);
  };

  return (
    <div>
      <Header
        title="Manual Voucher Integration"
        subtitle="Manual data integration — Core System → Amaranth 10"
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="p-6 space-y-4">
        {/* Executor banner */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center gap-3">
          <UserCheck size={18} className="text-purple-600" />
          <div className="text-sm">
            <span className="font-medium text-purple-800">Executed by: yeshwant</span>
            <span className="text-purple-500 ml-3">
              {new Date().toISOString().replace("T", " ").substring(0, 19)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
              <div className="flex rounded-md border border-slate-300 overflow-hidden">
                <button
                  onClick={() => setActiveTab("bs")}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === "bs"
                      ? "bg-purple-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  BS
                </button>
                <button
                  onClick={() => setActiveTab("pl")}
                  className={`px-4 py-2 text-sm font-medium border-l border-slate-300 ${
                    activeTab === "pl"
                      ? "bg-purple-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  PL
                </button>
              </div>
            </div>

            {activeTab === "bs" ? (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                <input
                  type="date"
                  value={bsDate}
                  onChange={(e) => setBsDate(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    className="px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">To</label>
                  <input
                    type="date"
                    value={plDateTo}
                    onChange={(e) => setPlDateTo(e.target.value)}
                    className="px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Method</label>
              <div className="flex rounded-md border border-slate-300 overflow-hidden">
                <button
                  onClick={() => setMethod("gross")}
                  className={`px-3 py-2 text-sm font-medium ${
                    method === "gross"
                      ? "bg-purple-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Gross
                </button>
                <button
                  onClick={() => setMethod("net")}
                  className={`px-3 py-2 text-sm font-medium border-l border-slate-300 ${
                    method === "net"
                      ? "bg-purple-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Net
                </button>
              </div>
            </div>

            <button
              onClick={handleFetch}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
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

        {fetched && <IntegrationSummary {...summary} />}

        {loading && !fetched && (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <Loader2 size={32} className="animate-spin mx-auto text-purple-500 mb-3" />
            <p className="text-sm text-slate-500">Fetching manual voucher data...</p>
          </div>
        )}

        {fetched && !loading && (
          <>
            {activeTab === "bs" ? (
              <IntegrationTable type="bs" data={bsData} onToggle={toggleBs} />
            ) : (
              <IntegrationTable type="pl" data={plData} onToggle={togglePl} />
            )}

            <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center justify-between">
              <div className="text-sm text-slate-500">
                <span className="font-medium text-slate-700">Executor:</span> yeshwant |{" "}
                <span className="font-medium text-slate-700">Timestamp:</span>{" "}
                {new Date().toISOString().replace("T", " ").substring(0, 19)}
              </div>
              <button
                onClick={handleExecute}
                disabled={selectedData.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
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
          type="Manual"
        />
      )}
    </div>
  );
}
