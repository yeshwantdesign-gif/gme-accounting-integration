import Modal from "../common/Modal";
import { formatKRW } from "../../utils/formatters";
import { CheckCircle, AlertTriangle } from "lucide-react";

interface ExecuteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  mode: "confirm" | "unbalanced" | "success" | "error";
  totalDr: number;
  totalCr: number;
  entryCount: number;
  type: "Auto" | "Manual";
  errorMessage?: string;
}

export default function ExecuteModal({
  open,
  onClose,
  onConfirm,
  mode,
  totalDr,
  totalCr,
  entryCount,
  type,
  errorMessage,
}: ExecuteModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={
      mode === "confirm" ? "Confirm Integration Execution" :
      mode === "unbalanced" ? "Unbalanced DR/CR Warning" :
      mode === "success" ? "Integration Successful" :
      "Integration Failed"
    }>
      {mode === "confirm" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            You are about to execute <strong>{type} Voucher Integration</strong> with the following summary:
          </p>
          <div className="bg-slate-50 rounded-md p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Entries</span>
              <span className="font-medium">{entryCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total DR (3)</span>
              <span className="font-mono font-medium text-blue-700">{formatKRW(totalDr)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total CR (4)</span>
              <span className="font-mono font-medium text-orange-700">{formatKRW(totalCr)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2">
              <span className="text-slate-500">Executed By</span>
              <span className="font-medium">yeshwant</span>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Execute Integration
            </button>
          </div>
        </div>
      )}

      {mode === "unbalanced" && (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600">
              Total DR and CR do not match. Are you sure you want to proceed with this unbalanced integration?
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-amber-700">Total DR (3)</span>
              <span className="font-mono font-medium text-blue-700">{formatKRW(totalDr)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-700">Total CR (4)</span>
              <span className="font-mono font-medium text-orange-700">{formatKRW(totalCr)}</span>
            </div>
            <div className="flex justify-between border-t border-amber-200 pt-2">
              <span className="text-amber-700 font-medium">Difference</span>
              <span className="font-mono font-semibold text-red-600">{formatKRW(Math.abs(totalDr - totalCr))}</span>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 font-medium"
            >
              Proceed Anyway
            </button>
          </div>
        </div>
      )}

      {mode === "success" && (
        <div className="text-center space-y-4 py-4">
          <CheckCircle size={48} className="mx-auto text-green-500" />
          <div>
            <h4 className="text-lg font-semibold text-slate-800">Integration Complete</h4>
            <p className="text-sm text-slate-500 mt-1">
              {entryCount} entries processed successfully
            </p>
          </div>
          <div className="bg-green-50 rounded-md p-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-green-600">Total DR</span>
              <span className="font-mono font-medium">{formatKRW(totalDr)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600">Total CR</span>
              <span className="font-mono font-medium">{formatKRW(totalCr)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
          >
            Done
          </button>
        </div>
      )}

      {mode === "error" && (
        <div className="text-center space-y-4 py-4">
          <AlertTriangle size={48} className="mx-auto text-red-500" />
          <div>
            <h4 className="text-lg font-semibold text-slate-800">Integration Failed</h4>
            <p className="text-sm text-red-600 mt-1">
              {errorMessage || "An error occurred during integration"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm bg-slate-600 text-white rounded-md hover:bg-slate-700 font-medium"
          >
            Close
          </button>
        </div>
      )}
    </Modal>
  );
}
