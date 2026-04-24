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
import { useLanguage } from "../../i18n/LanguageContext";

export default function AutoIntegrationPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"bs" | "pl" | "all">("bs");
  const [method, setMethod] = useState<"gross" | "net" | "netOfGross">("gross");
  const [bsDate, setBsDate] = useState("2026-03-31");
  const [plDateFrom, setPlDateFrom] = useState("2026-03-01");
  const [plDateTo, setPlDateTo] = useState("2026-03-31");
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [bsData, setBsData] = useState<BSIntegrationEntry[]>([]);
  const [plData, setPlData] = useState<PLIntegrationEntry[]>([]);
  const [modalMode, setModalMode] = useState<"confirm" | "unbalanced" | "success" | "error" | null>(null);
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
      addToast("success", t("toast.dataFetched"));
    }, 1500);
  };

  // Compute delta based on mode: compare Core vs Amaranth under the same calculation
  function computeDelta(m: typeof method, e: { corePeriodDr: number; corePeriodCr: number; coreClosingBalance: number; amaranthPeriodDr: number; amaranthPeriodCr: number; amaranthClosingBalance: number }): number {
    if (m === "gross") return (e.corePeriodDr - e.amaranthPeriodDr) - (e.corePeriodCr - e.amaranthPeriodCr);
    if (m === "net") return e.coreClosingBalance - e.amaranthClosingBalance;
    return (e.corePeriodDr - e.corePeriodCr) - (e.amaranthPeriodDr - e.amaranthPeriodCr);
  }

  const displayBsData = useMemo(() => {
    if (method === "gross") {
      return bsData.map((e): BSIntegrationEntry => {
        const deltaKrw = computeDelta(method, e);
        const { drCr } = calculateDrCr(e.accountNature, deltaKrw, true);
        return { ...e, deltaKrw, drCr };
      });
    }

    // Net / Net of Gross: group entries by account+vendor+currency into single rows
    const groups = new Map<string, BSIntegrationEntry[]>();
    bsData.forEach((entry) => {
      const key = `${entry.amaranthCode}|${entry.vendorCode}|${entry.currency}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(entry);
    });

    return Array.from(groups.values()).map((entries): BSIntegrationEntry => {
      const first = entries[0];
      const s = (fn: (e: BSIntegrationEntry) => number) => entries.reduce((a, e) => a + fn(e), 0);
      const agg: BSIntegrationEntry = {
        amaranthCode: first.amaranthCode,
        amaranthName: first.amaranthName,
        vendorCode: first.vendorCode,
        vendorName: first.vendorName,
        currency: first.currency,
        corePeriodDr: s((e) => e.corePeriodDr),
        corePeriodCr: s((e) => e.corePeriodCr),
        coreClosingBalance: s((e) => e.coreClosingBalance),
        amaranthPeriodDr: s((e) => e.amaranthPeriodDr),
        amaranthPeriodCr: s((e) => e.amaranthPeriodCr),
        amaranthClosingBalance: s((e) => e.amaranthClosingBalance),
        deltaKrw: 0,
        drCr: 3,
        accountNature: first.accountNature,
        selected: entries.every((e) => e.selected),
      };
      const deltaKrw = computeDelta(method, agg);
      const { drCr } = calculateDrCr(agg.accountNature, deltaKrw, true);
      return { ...agg, deltaKrw, drCr };
    });
  }, [bsData, method]);

  const displayPlData = useMemo(() => {
    if (method === "gross") {
      return plData.map((e): PLIntegrationEntry => {
        const deltaKrw = computeDelta(method, e);
        const { drCr } = calculateDrCr(e.accountNature, deltaKrw, false);
        return { ...e, deltaKrw, drCr };
      });
    }

    // Net / Net of Gross: group entries by account+dept into single rows
    const groups = new Map<string, PLIntegrationEntry[]>();
    plData.forEach((entry) => {
      const key = `${entry.amaranthCode}|${entry.deptCode}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(entry);
    });

    return Array.from(groups.values()).map((entries): PLIntegrationEntry => {
      const first = entries[0];
      const s = (fn: (e: PLIntegrationEntry) => number) => entries.reduce((a, e) => a + fn(e), 0);
      const agg: PLIntegrationEntry = {
        amaranthCode: first.amaranthCode,
        amaranthName: first.amaranthName,
        deptCode: first.deptCode,
        deptName: first.deptName,
        corePeriodDr: s((e) => e.corePeriodDr),
        corePeriodCr: s((e) => e.corePeriodCr),
        coreClosingBalance: s((e) => e.coreClosingBalance),
        amaranthPeriodDr: s((e) => e.amaranthPeriodDr),
        amaranthPeriodCr: s((e) => e.amaranthPeriodCr),
        amaranthClosingBalance: s((e) => e.amaranthClosingBalance),
        deltaKrw: 0,
        drCr: 3,
        accountNature: first.accountNature,
        selected: entries.every((e) => e.selected),
      };
      const deltaKrw = computeDelta(method, agg);
      const { drCr } = calculateDrCr(agg.accountNature, deltaKrw, false);
      return { ...agg, deltaKrw, drCr };
    });
  }, [plData, method]);

  const toggleBs = (index: number) => {
    if (method === "gross") {
      setBsData((prev) =>
        prev.map((d, i) => (i === index ? { ...d, selected: !d.selected } : d))
      );
    } else {
      // Both "net" and "netOfGross" use grouped entries
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

  const currentData = activeTab === "bs"
    ? displayBsData
    : activeTab === "pl"
    ? displayPlData
    : [...displayBsData, ...displayPlData];
  const selectedData = activeTab === "bs"
    ? displayBsData.filter((d) => d.selected)
    : activeTab === "pl"
    ? displayPlData.filter((d) => d.selected)
    : [...displayBsData.filter((d) => d.selected), ...displayPlData.filter((d) => d.selected)];

  const summary = useMemo(() => {
    let totalDr = 0;
    let totalCr = 0;

    const sumEntries = (data: { deltaKrw: number; drCr: 3 | 4; selected: boolean }[]) => {
      data.filter((d) => d.selected).forEach((d) => {
        const amount = Math.abs(d.deltaKrw);
        if (d.drCr === 3) totalDr += amount;
        else totalCr += amount;
      });
    };

    if (activeTab === "bs" || activeTab === "all") sumEntries(displayBsData);
    if (activeTab === "pl" || activeTab === "all") sumEntries(displayPlData);

    return {
      totalDr,
      totalCr,
      net: totalDr - totalCr,
      entryCount: currentData.length,
      selectedCount: selectedData.length,
    };
  }, [activeTab, displayBsData, displayPlData, currentData, selectedData]);

  const isBalanced = Math.abs(summary.net) < 0.01;

  const handleExecute = () => {
    if (activeTab === "all" && !isBalanced) {
      setModalMode("unbalanced");
    } else {
      setModalMode("confirm");
    }
  };

  const handleConfirmExecute = () => {
    setModalMode(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setModalMode("success");
      addToast("success", t("toast.integrationExecuted"));
    }, 1500);
  };

  return (
    <div>
      <Header
        title={t("page.autoVoucher.title")}
        subtitle={t("page.autoVoucher.subtitle")}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="p-6 space-y-4">
        {/* Controls */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex flex-wrap items-end gap-4">
            {/* Tab switcher */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">{t("label.type")}</label>
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
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-2 text-sm font-medium border-l border-slate-300 ${
                    activeTab === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {t("tab.all")}
                </button>
              </div>
            </div>

            {/* Date picker */}
            {(activeTab === "bs" || activeTab === "all") && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{t(activeTab === "all" ? "label.bsBalanceDate" : "label.balanceDate")}</label>
                <input
                  type="date"
                  value={bsDate}
                  onChange={(e) => setBsDate(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            {(activeTab === "pl" || activeTab === "all") && (
              <div className="flex gap-2 items-end">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">{t(activeTab === "all" ? "label.plPeriodFrom" : "label.periodFrom")}</label>
                  <input
                    type="date"
                    value={plDateFrom}
                    onChange={(e) => setPlDateFrom(e.target.value)}
                    className="px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">{t(activeTab === "all" ? "label.plPeriodTo" : "label.periodTo")}</label>
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
              <label className="block text-xs font-medium text-slate-500 mb-1">{t("label.method")}</label>
              <div className="flex rounded-md border border-slate-300 overflow-hidden">
                <button
                  onClick={() => setMethod("gross")}
                  className={`px-3 py-2 text-sm font-medium ${
                    method === "gross"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {t("tab.gross")}
                </button>
                <button
                  onClick={() => setMethod("net")}
                  className={`px-3 py-2 text-sm font-medium border-l border-slate-300 ${
                    method === "net"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {t("tab.net")}
                </button>
                <button
                  onClick={() => setMethod("netOfGross")}
                  className={`px-3 py-2 text-sm font-medium border-l border-slate-300 ${
                    method === "netOfGross"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {t("tab.netOfGross")}
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
              {t("btn.fetchData")}
            </button>
          </div>
        </div>

        {/* Summary */}
        {fetched && <IntegrationSummary {...summary} activeTab={activeTab} />}

        {/* Loading skeleton */}
        {loading && !fetched && (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <Loader2 size={32} className="animate-spin mx-auto text-blue-500 mb-3" />
            <p className="text-sm text-slate-500">{t("msg.fetchingIntegrationData")}</p>
          </div>
        )}

        {/* Data Table */}
        {fetched && !loading && (
          <>
            {activeTab === "bs" ? (
              <IntegrationTable type="bs" data={displayBsData} onToggle={toggleBs} method={method} />
            ) : activeTab === "pl" ? (
              <IntegrationTable type="pl" data={displayPlData} onToggle={togglePl} method={method} />
            ) : (
              <IntegrationTable
                type="all"
                bsData={displayBsData}
                plData={displayPlData}
                onToggleBs={toggleBs}
                onTogglePl={togglePl}
                method={method}
              />
            )}

            <p className="text-xs text-slate-400 mt-1">{t("msg.krwRoundingNote")}</p>

            {/* Execute button */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center justify-between">
              <div className="text-sm text-slate-500">
                <span className="font-medium text-slate-700">{t("label.executor")}:</span> yeshwant |{" "}
                <span className="font-medium text-slate-700">{t("label.timestamp")}:</span>{" "}
                {new Date().toISOString().replace("T", " ").substring(0, 19)}
              </div>
              <button
                onClick={handleExecute}
                disabled={selectedData.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Play size={16} />
                {t("btn.executeIntegration")}
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
