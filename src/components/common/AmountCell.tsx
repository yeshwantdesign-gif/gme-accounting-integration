import { formatKRW, formatFCY } from "../../utils/formatters";

interface AmountCellProps {
  amount: number;
  currency?: string;
  colorize?: boolean;
}

export default function AmountCell({ amount, currency = "KRW", colorize = false }: AmountCellProps) {
  const formatted = currency === "KRW" ? formatKRW(amount) : formatFCY(amount);
  let colorClass = "text-slate-800";
  if (colorize) {
    if (amount > 0) colorClass = "text-green-600";
    else if (amount < 0) colorClass = "text-red-600";
  }

  return <span className={`font-mono text-sm ${colorClass}`}>{formatted}</span>;
}
