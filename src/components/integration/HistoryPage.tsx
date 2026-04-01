import { useState, useMemo, useCallback } from "react";
import Header from "../Layout/Header";
import FilterDropdown from "../common/FilterDropdown";
import Modal from "../common/Modal";
import Badge from "../common/Badge";
import ToastContainer from "../common/Toast";
import type { ToastData } from "../common/Toast";
import DataTable from "../common/DataTable";
import type { Column } from "../common/DataTable";
import { integrationHistory as initialHistory } from "../../data/integrationHistory";
import type { IntegrationHistoryEntry } from "../../types";
import { formatKRW } from "../../utils/formatters";
import { Eye, RotateCcw, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export default function HistoryPage() {
  const [history, setHistory] = useState<IntegrationHistoryEntry[]>(initialHistory);
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [detailEntry, setDetailEntry] = useState<IntegrationHistoryEntry | null>(null);
  const [rollbackEntry, setRollbackEntry] = useState<IntegrationHistoryEntry | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((type: ToastData["type"], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const filtered = useMemo(() => {
    return history.filter((h) => {
      if (typeFilter !== "All" && h.type !== typeFilter) return false;
      if (statusFilter !== "All" && h.status !== statusFilter) return false;
      if (dateFrom && h.date < dateFrom) return false;
      if (dateTo && h.date > dateTo) return false;
      return true;
    });
  }, [history, typeFilter, statusFilter, dateFrom, dateTo]);

  const handleRollback = (entry: IntegrationHistoryEntry) => {
    setHistory((prev) =>
      prev.map((h) =>
        h.id === entry.id ? { ...h, status: "Rolled Back" as const } : h
      )
    );
    setRollbackEntry(null);
    addToast("warning", `Integration ${entry.id} rolled back`);
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "Success":
        return <CheckCircle size={14} className="text-green-500" />;
      case "Failed":
        return <XCircle size={14} className="text-red-500" />;
      case "Rolled Back":
        return <RotateCcw size={14} className="text-amber-500" />;
      default:
        return null;
    }
  };

  const columns: Column<IntegrationHistoryEntry>[] = [
    {
      key: "id",
      label: "#",
      sortValue: (r) => r.id,
      render: (row) => <span className="font-mono text-xs">{row.id}</span>,
    },
    {
      key: "date",
      label: "Date",
      sortValue: (r) => r.date,
      render: (row) => <span className="text-sm">{row.date}</span>,
    },
    {
      key: "time",
      label: "Time",
      sortValue: (r) => r.time,
      render: (row) => <span className="text-sm font-mono">{row.time}</span>,
    },
    {
      key: "type",
      label: "Type",
      sortValue: (r) => r.type,
      render: (row) => (
        <Badge variant={row.type === "Auto" ? "blue" : "orange"}>
          {row.type}
        </Badge>
      ),
    },
    {
      key: "executedBy",
      label: "Executed By",
      sortValue: (r) => r.executedBy,
      render: (row) => <span className="text-sm">{row.executedBy}</span>,
    },
    {
      key: "bsEntries",
      label: "BS Entries",
      sortValue: (r) => r.bsEntries,
      render: (row) => <span className="font-mono text-sm">{row.bsEntries}</span>,
    },
    {
      key: "plEntries",
      label: "PL Entries",
      sortValue: (r) => r.plEntries,
      render: (row) => <span className="font-mono text-sm">{row.plEntries}</span>,
    },
    {
      key: "totalDr",
      label: "Total DR",
      className: "text-right",
      sortValue: (r) => r.totalDr,
      render: (row) => (
        <span className="font-mono text-xs text-right block">{formatKRW(row.totalDr)}</span>
      ),
    },
    {
      key: "totalCr",
      label: "Total CR",
      className: "text-right",
      sortValue: (r) => r.totalCr,
      render: (row) => (
        <span className="font-mono text-xs text-right block">{formatKRW(row.totalCr)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortValue: (r) => r.status,
      render: (row) => {
        const variant =
          row.status === "Success" ? "success" : row.status === "Failed" ? "error" : "warning";
        return (
          <span className="flex items-center gap-1">
            {statusIcon(row.status)}
            <Badge variant={variant}>{row.status}</Badge>
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-1">
          <button
            onClick={() => setDetailEntry(row)}
            className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 border border-blue-200 rounded hover:bg-blue-50"
          >
            <Eye size={12} />
            View
          </button>
          {row.status === "Success" && (
            <button
              onClick={() => setRollbackEntry(row)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-amber-600 border border-amber-200 rounded hover:bg-amber-50"
            >
              <RotateCcw size={12} />
              Rollback
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <Header
        title="Integration History"
        subtitle="Review past integration executions"
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="p-6 space-y-4">
        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <FilterDropdown
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: "All", label: "All Types" },
              { value: "Auto", label: "Auto" },
              { value: "Manual", label: "Manual" },
            ]}
            label="Type"
          />
          <FilterDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "All", label: "All Statuses" },
              { value: "Success", label: "Success" },
              { value: "Failed", label: "Failed" },
              { value: "Rolled Back", label: "Rolled Back" },
            ]}
            label="Status"
          />
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={filtered}
          emptyMessage="No integration history found"
        />
      </div>

      {/* Detail Modal */}
      <Modal
        open={!!detailEntry}
        onClose={() => setDetailEntry(null)}
        title={`Integration Details — ${detailEntry?.id}`}
        wide
      >
        {detailEntry && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-slate-500">Date & Time</div>
                <div className="text-sm font-medium">{detailEntry.date} {detailEntry.time}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Type</div>
                <div className="text-sm font-medium">{detailEntry.type}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Executed By</div>
                <div className="text-sm font-medium">{detailEntry.executedBy}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Status</div>
                <div className="flex items-center gap-1">
                  {statusIcon(detailEntry.status)}
                  <span className="text-sm font-medium">{detailEntry.status}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Entry Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded p-3">
                  <div className="text-xs text-slate-500">BS Entries</div>
                  <div className="text-lg font-semibold">{detailEntry.bsEntries}</div>
                </div>
                <div className="bg-slate-50 rounded p-3">
                  <div className="text-xs text-slate-500">PL Entries</div>
                  <div className="text-lg font-semibold">{detailEntry.plEntries}</div>
                </div>
                <div className="bg-blue-50 rounded p-3">
                  <div className="text-xs text-blue-600">Total DR (3)</div>
                  <div className="text-lg font-semibold font-mono">{formatKRW(detailEntry.totalDr)}</div>
                </div>
                <div className="bg-orange-50 rounded p-3">
                  <div className="text-xs text-orange-600">Total CR (4)</div>
                  <div className="text-lg font-semibold font-mono">{formatKRW(detailEntry.totalCr)}</div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-2">API Response</h4>
              <pre className="bg-slate-900 text-green-400 p-4 rounded-md text-xs overflow-x-auto">
{detailEntry.status === "Success"
  ? `{
  "status": 200,
  "message": "Integration completed successfully",
  "integrationId": "${detailEntry.id}",
  "timestamp": "${detailEntry.date}T${detailEntry.time}+09:00",
  "entries": {
    "bs": ${detailEntry.bsEntries},
    "pl": ${detailEntry.plEntries}
  },
  "totalDr": ${detailEntry.totalDr},
  "totalCr": ${detailEntry.totalCr}
}`
  : `{
  "status": 500,
  "error": "INTEGRATION_FAILED",
  "message": "Failed to post voucher entries to Amaranth 10",
  "integrationId": "${detailEntry.id}",
  "timestamp": "${detailEntry.date}T${detailEntry.time}+09:00",
  "details": "Connection timeout after 30s — Amaranth API endpoint unreachable"
}`}
              </pre>
            </div>
          </div>
        )}
      </Modal>

      {/* Rollback Confirmation */}
      <Modal
        open={!!rollbackEntry}
        onClose={() => setRollbackEntry(null)}
        title="Confirm Rollback"
      >
        {rollbackEntry && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <AlertTriangle size={20} className="text-amber-600 shrink-0" />
              <p className="text-sm text-amber-700">
                This will reverse all entries from integration <strong>{rollbackEntry.id}</strong>.
                This action creates compensating entries in Amaranth 10.
              </p>
            </div>
            <div className="bg-slate-50 rounded-md p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Integration ID</span>
                <span className="font-mono">{rollbackEntry.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date</span>
                <span>{rollbackEntry.date} {rollbackEntry.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Entries</span>
                <span>{rollbackEntry.bsEntries + rollbackEntry.plEntries}</span>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRollbackEntry(null)}
                className="px-4 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRollback(rollbackEntry)}
                className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 font-medium"
              >
                Confirm Rollback
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
