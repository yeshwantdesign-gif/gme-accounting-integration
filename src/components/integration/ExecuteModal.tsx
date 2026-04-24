import Modal from "../common/Modal";
import { formatKRW } from "../../utils/formatters";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";

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
  const { t } = useLanguage();
  return (
    <Modal open={open} onClose={onClose} title={
      mode === "confirm" ? t("modal.confirmExecution") :
      mode === "unbalanced" ? t("modal.unbalancedWarning") :
      mode === "success" ? t("modal.integrationSuccessful") :
      t("modal.integrationFailed")
    }>
      {mode === "confirm" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            {t("msg.confirmExecuteText")} <strong>{type === "Auto" ? t("msg.autoVoucher") : t("msg.manualVoucher")} {t("msg.voucherIntegration")}</strong>
          </p>
          <div className="bg-slate-50 rounded-md p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">{t("label.entries")}</span>
              <span className="font-medium">{entryCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t("th.totalDr")}</span>
              <span className="font-mono font-medium text-blue-700">{formatKRW(totalDr)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t("th.totalCr")}</span>
              <span className="font-mono font-medium text-orange-700">{formatKRW(totalCr)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2">
              <span className="text-slate-500">{t("label.executedBy")}</span>
              <span className="font-medium">yeshwant</span>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
            >
              {t("btn.cancel")}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              {t("btn.executeIntegration")}
            </button>
          </div>
        </div>
      )}

      {mode === "unbalanced" && (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600">
              {t("msg.unbalancedText")}
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-amber-700">{t("th.totalDr")}</span>
              <span className="font-mono font-medium text-blue-700">{formatKRW(totalDr)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-700">{t("th.totalCr")}</span>
              <span className="font-mono font-medium text-orange-700">{formatKRW(totalCr)}</span>
            </div>
            <div className="flex justify-between border-t border-amber-200 pt-2">
              <span className="text-amber-700 font-medium">{t("label.difference")}</span>
              <span className="font-mono font-semibold text-red-600">{formatKRW(Math.abs(totalDr - totalCr))}</span>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
            >
              {t("btn.cancel")}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 font-medium"
            >
              {t("btn.proceed")}
            </button>
          </div>
        </div>
      )}

      {mode === "success" && (
        <div className="text-center space-y-4 py-4">
          <CheckCircle size={48} className="mx-auto text-green-500" />
          <div>
            <h4 className="text-lg font-semibold text-slate-800">{t("msg.integrationComplete")}</h4>
            <p className="text-sm text-slate-500 mt-1">
              {entryCount} {t("msg.entriesProcessed")}
            </p>
          </div>
          <div className="bg-green-50 rounded-md p-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-green-600">{t("th.totalDrAmount")}</span>
              <span className="font-mono font-medium">{formatKRW(totalDr)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600">{t("th.totalCrAmount")}</span>
              <span className="font-mono font-medium">{formatKRW(totalCr)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
          >
            {t("btn.done")}
          </button>
        </div>
      )}

      {mode === "error" && (
        <div className="text-center space-y-4 py-4">
          <AlertTriangle size={48} className="mx-auto text-red-500" />
          <div>
            <h4 className="text-lg font-semibold text-slate-800">{t("modal.integrationFailed")}</h4>
            <p className="text-sm text-red-600 mt-1">
              {errorMessage || t("msg.integrationError")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm bg-slate-600 text-white rounded-md hover:bg-slate-700 font-medium"
          >
            {t("btn.close")}
          </button>
        </div>
      )}
    </Modal>
  );
}
