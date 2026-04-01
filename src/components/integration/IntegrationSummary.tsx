import { formatKRW } from "../../utils/formatters";

interface IntegrationSummaryProps {
  totalDr: number;
  totalCr: number;
  net: number;
  entryCount: number;
  selectedCount: number;
}

export default function IntegrationSummary({
  totalDr,
  totalCr,
  net,
  entryCount,
  selectedCount,
}: IntegrationSummaryProps) {
  return (
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
  );
}
