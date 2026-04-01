import type { BSCoreLedger, PLCoreLedger, MappingStatus } from "../../types";
import Badge from "../common/Badge";
import { formatAmount } from "../../utils/formatters";

interface BSLedgerListProps {
  type: "bs";
  ledgers: BSCoreLedger[];
  selectedCodes: Set<string>;
  onToggle: (code: string) => void;
  getMappingStatus: (code: string) => MappingStatus;
}

interface PLLedgerListProps {
  type: "pl";
  ledgers: PLCoreLedger[];
  selectedCode: string | null;
  onSelect: (code: string) => void;
  getMappingStatus: (code: string) => MappingStatus;
}

type LedgerListProps = BSLedgerListProps | PLLedgerListProps;

export default function LedgerList(props: LedgerListProps) {
  const statusBadge = (status: MappingStatus) => {
    switch (status) {
      case "Mapped":
        return <Badge variant="success">Mapped</Badge>;
      case "Excluded":
        return <Badge variant="error">Excluded</Badge>;
      default:
        return <Badge variant="gray">Unmapped</Badge>;
    }
  };

  if (props.type === "bs") {
    return (
      <div className="divide-y divide-slate-100 max-h-[calc(100vh-320px)] overflow-y-auto">
        {props.ledgers.map((ledger) => (
          <label
            key={ledger.code}
            className={`flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors ${
              props.selectedCodes.has(ledger.code) ? "bg-blue-50" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={props.selectedCodes.has(ledger.code)}
              onChange={() => props.onToggle(ledger.code)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-500">{ledger.code}</span>
                <span className="text-sm text-slate-800 truncate">{ledger.name}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-400">GL {ledger.glCode}: {ledger.glName}</span>
                <span className="text-xs font-mono text-slate-500">{ledger.currency}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-mono text-xs text-slate-600">
                {formatAmount(ledger.balance, ledger.currency)}
              </div>
              <div className="mt-0.5">
                {statusBadge(props.getMappingStatus(ledger.code))}
              </div>
            </div>
          </label>
        ))}
        {props.ledgers.length === 0 && (
          <div className="px-3 py-8 text-center text-sm text-slate-400">
            No ledgers found
          </div>
        )}
      </div>
    );
  }

  // PL list — radio buttons for 1:1 strict
  return (
    <div className="divide-y divide-slate-100 max-h-[calc(100vh-320px)] overflow-y-auto">
      {props.ledgers.map((ledger) => (
        <label
          key={ledger.code}
          className={`flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors ${
            props.selectedCode === ledger.code ? "bg-blue-50" : ""
          }`}
        >
          <input
            type="radio"
            name="pl-ledger"
            checked={props.selectedCode === ledger.code}
            onChange={() => props.onSelect(ledger.code)}
            className="border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-500">{ledger.code}</span>
              <span className="text-sm text-slate-800 truncate">{ledger.name}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-400">GL {ledger.glCode}: {ledger.glName}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-mono text-xs text-slate-600">
              {formatAmount(ledger.balance, "KRW")}
            </div>
            <div className="mt-0.5">
              {statusBadge(props.getMappingStatus(ledger.code))}
            </div>
          </div>
        </label>
      ))}
      {props.ledgers.length === 0 && (
        <div className="px-3 py-8 text-center text-sm text-slate-400">
          No ledgers found
        </div>
      )}
    </div>
  );
}
