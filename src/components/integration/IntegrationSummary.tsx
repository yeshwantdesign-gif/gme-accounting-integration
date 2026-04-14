import { formatKRW } from "../../utils/formatters";
import { CheckCircle, AlertTriangle, Info } from "lucide-react";

interface IntegrationSummaryProps {
  totalDr: number;
  totalCr: number;
  net: number;
  entryCount: number;
  selectedCount: number;
  activeTab: "bs" | "pl" | "all";
}

export default function IntegrationSummary({
  totalDr,
  totalCr,
  net,
  entryCount,
  selectedCount,
  activeTab,
}: IntegrationSummaryProps) {
  const isBalanced = Math.abs(net) < 0.01;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
          <div className="text-xs text-blue-600 font-medium">Total DR (3)</div>
          <div className="text-lg font-semibold text-blue-800 font-mono mt-1">
            {formatKRW(totalDr)}
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-lg p-3">
          <div className="text-xs text-orange-600 font-medium">Total CR (4)</div>
          <div className="text-lg font-semibold text-orange-800 font-mono mt-1">
            {formatKRW(totalCr)}
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="text-xs text-slate-600 font-medium">Net Difference</div>
          <div className={`text-lg font-semibold font-mono mt-1 ${net === 0 ? "text-green-600" : "text-red-600"}`}>
            {formatKRW(net)}
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="text-xs text-slate-600 font-medium">Total Entries</div>
          <div className="text-lg font-semibold text-slate-800 mt-1">{entryCount}</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="text-xs text-slate-600 font-medium">Selected</div>
          <div className="text-lg font-semibold text-slate-800 mt-1">{selectedCount}</div>
        </div>
      </div>

      {/* Balance validation indicator */}
      {activeTab === "all" && selectedCount > 0 && (
        isBalanced ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
            <span className="text-sm text-green-700 font-medium">Balanced — DR equals CR</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
            <span className="text-sm text-red-700 font-medium">
              Unbalanced — DR and CR do not match. Difference: {formatKRW(Math.abs(net))}
            </span>
          </div>
        )
      )}
      {activeTab !== "all" && selectedCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
          <Info size={16} className="text-slate-400 flex-shrink-0" />
          <span className="text-sm text-slate-500">
            Note: DR/CR balance can only be verified in the combined BS+PL view
          </span>
        </div>
      )}
    </div>
  );
}
