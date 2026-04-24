import { useState, useMemo, useRef, useEffect } from "react";
import type { BSCoreLedger, PLCoreLedger, MappingStatus } from "../../types";
import Badge from "../common/Badge";
import { formatAmount } from "../../utils/formatters";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";

interface BSLedgerListProps {
  type: "bs";
  ledgers: BSCoreLedger[];
  selectedCodes: Set<string>;
  onToggle: (code: string) => void;
  getMappingStatus: (code: string) => MappingStatus;
  excludedCodes?: Set<string>;
}

interface PLLedgerListProps {
  type: "pl";
  ledgers: PLCoreLedger[];
  selectedCode: string | null;
  onSelect: (code: string) => void;
  getMappingStatus: (code: string) => MappingStatus;
  excludedCodes?: Set<string>;
}

type LedgerListProps = BSLedgerListProps | PLLedgerListProps;

interface GLGroup<T> {
  glCode: string;
  glName: string;
  ledgers: T[];
}

function groupByGL<T extends { glCode: string; glName: string }>(ledgers: T[]): GLGroup<T>[] {
  const map = new Map<string, GLGroup<T>>();
  ledgers.forEach((l) => {
    const key = l.glCode;
    if (!map.has(key)) {
      map.set(key, { glCode: l.glCode, glName: l.glName, ledgers: [] });
    }
    map.get(key)!.ledgers.push(l);
  });
  return Array.from(map.values());
}

function statusBadge(status: MappingStatus, t: (key: string) => string) {
  switch (status) {
    case "Mapped":
      return <Badge variant="success">{t("badge.mapped")}</Badge>;
    case "Excluded":
      return <Badge variant="error">{t("badge.excluded")}</Badge>;
    default:
      return <Badge variant="gray">{t("badge.unmapped")}</Badge>;
  }
}

function IndeterminateCheckbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
    />
  );
}

export default function LedgerList(props: LedgerListProps) {
  const { t } = useLanguage();
  const isExcluded = (code: string) => props.excludedCodes?.has(code) ?? false;

  // Build GL groups from filtered ledgers
  const bsGroups = useMemo(
    () => (props.type === "bs" ? groupByGL(props.ledgers) : []),
    [props.type === "bs" ? props.ledgers : null]
  );
  const plGroups = useMemo(
    () => (props.type === "pl" ? groupByGL(props.ledgers) : []),
    [props.type === "pl" ? props.ledgers : null]
  );

  // All groups collapsed by default
  const allGlCodes = useMemo(() => {
    const groups = props.type === "bs" ? bsGroups : plGroups;
    return new Set(groups.map((g) => g.glCode));
  }, [props.type === "bs" ? bsGroups : plGroups]);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set(allGlCodes));

  const toggleCollapse = (glCode: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(glCode)) next.delete(glCode);
      else next.add(glCode);
      return next;
    });
  };

  if (props.type === "bs") {
    return (
      <div className="max-h-[calc(100vh-360px)] overflow-y-auto">
        {bsGroups.map((group) => {
          const isOpen = !collapsed.has(group.glCode);
          const codes = group.ledgers.map((l) => l.code);
          const selectedCount = codes.filter((c) => props.selectedCodes.has(c)).length;
          const allSelected = selectedCount === codes.length;
          const someSelected = selectedCount > 0 && !allSelected;
          const mappedCount = codes.filter((c) => props.getMappingStatus(c) === "Mapped").length;

          const handleSelectAll = () => {
            if (allSelected) {
              // Deselect all in group
              codes.forEach((c) => {
                if (props.selectedCodes.has(c)) props.onToggle(c);
              });
            } else {
              // Select all in group
              codes.forEach((c) => {
                if (!props.selectedCodes.has(c)) props.onToggle(c);
              });
            }
          };

          return (
            <div key={group.glCode}>
              {/* GL Group Header */}
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 border-b border-slate-200 sticky top-0 z-[1]">
                <button
                  onClick={() => toggleCollapse(group.glCode)}
                  className="text-slate-500 hover:text-slate-700 shrink-0"
                >
                  {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleCollapse(group.glCode)}>
                  <span className="text-xs font-bold text-slate-700">
                    GL {group.glCode}: {group.glName}
                  </span>
                  <span className="text-xs text-slate-500 ml-2">
                    ({group.ledgers.length} {group.ledgers.length !== 1 ? t("msg.ledgers") : t("msg.ledger")})
                  </span>
                  <span className="text-xs text-slate-400 ml-2">
                    {mappedCount}/{group.ledgers.length} {t("msg.mapped")}
                  </span>
                </div>
                <label
                  className="flex items-center gap-1 text-xs text-slate-500 shrink-0 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <IndeterminateCheckbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={handleSelectAll}
                  />
                  <span className="hidden sm:inline">{t("btn.selectAll")}</span>
                </label>
              </div>

              {/* Ledger rows */}
              {isOpen &&
                group.ledgers.map((ledger) => (
                  <label
                    key={ledger.code}
                    className={`flex items-center gap-3 pl-8 pr-3 py-2 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 ${
                      props.selectedCodes.has(ledger.code) ? "bg-blue-50" : ""
                    } ${isExcluded(ledger.code) ? "opacity-40" : ""}`}
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
                        <span className="text-xs font-mono text-slate-500">{ledger.currency}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono text-xs text-slate-600">
                        {formatAmount(ledger.balance, ledger.currency)}
                      </div>
                      <div className="mt-0.5">
                        {statusBadge(props.getMappingStatus(ledger.code), t)}
                      </div>
                    </div>
                  </label>
                ))}
            </div>
          );
        })}
        {bsGroups.length === 0 && (
          <div className="px-3 py-8 text-center text-sm text-slate-400">
            {t("msg.noLedgersFound")}
          </div>
        )}
      </div>
    );
  }

  // PL list — radio buttons, no "Select All" on group headers
  return (
    <div className="max-h-[calc(100vh-360px)] overflow-y-auto">
      {plGroups.map((group) => {
        const isOpen = !collapsed.has(group.glCode);
        const codes = group.ledgers.map((l) => l.code);
        const mappedCount = codes.filter((c) => props.getMappingStatus(c) === "Mapped").length;

        return (
          <div key={group.glCode}>
            {/* GL Group Header */}
            <div
              className="flex items-center gap-2 px-3 py-2 bg-slate-100 border-b border-slate-200 cursor-pointer sticky top-0 z-[1]"
              onClick={() => toggleCollapse(group.glCode)}
            >
              <span className="text-slate-500 shrink-0">
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-slate-700">
                  GL {group.glCode}: {group.glName}
                </span>
                <span className="text-xs text-slate-500 ml-2">
                  ({group.ledgers.length} {group.ledgers.length !== 1 ? t("msg.ledgers") : t("msg.ledger")})
                </span>
                <span className="text-xs text-slate-400 ml-2">
                  {mappedCount}/{group.ledgers.length} {t("msg.mapped")}
                </span>
              </div>
            </div>

            {/* Ledger rows */}
            {isOpen &&
              group.ledgers.map((ledger) => (
                <label
                  key={ledger.code}
                  className={`flex items-center gap-3 pl-8 pr-3 py-2 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 ${
                    props.selectedCode === ledger.code ? "bg-blue-50" : ""
                  } ${isExcluded(ledger.code) ? "opacity-40" : ""}`}
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
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono text-xs text-slate-600">
                      {formatAmount(ledger.balance, "KRW")}
                    </div>
                    <div className="mt-0.5">
                      {statusBadge(props.getMappingStatus(ledger.code), t)}
                    </div>
                  </div>
                </label>
              ))}
          </div>
        );
      })}
      {plGroups.length === 0 && (
        <div className="px-3 py-8 text-center text-sm text-slate-400">
          {t("msg.noLedgersFound")}
        </div>
      )}
    </div>
  );
}
