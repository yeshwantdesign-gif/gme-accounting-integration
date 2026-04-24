import type { BSIntegrationEntry, PLIntegrationEntry } from "../../types";
import { formatKRW, formatKRWDecimal, formatFCY } from "../../utils/formatters";
import { useLanguage } from "../../i18n/LanguageContext";
import Badge from "../common/Badge";
import DataTable from "../common/DataTable";
import type { Column } from "../common/DataTable";

type Method = "gross" | "net" | "netOfGross";

interface BSTableProps {
  type: "bs";
  data: BSIntegrationEntry[];
  onToggle: (index: number) => void;
  method: Method;
}

interface PLTableProps {
  type: "pl";
  data: PLIntegrationEntry[];
  onToggle: (index: number) => void;
  method: Method;
}

interface AllTableProps {
  type: "all";
  bsData: BSIntegrationEntry[];
  plData: PLIntegrationEntry[];
  onToggleBs: (index: number) => void;
  onTogglePl: (index: number) => void;
  method: Method;
}

type IntegrationTableProps = BSTableProps | PLTableProps | AllTableProps;

// Shared row type that works across all views
interface UnifiedRow {
  entryType?: "BS" | "PL";
  amaranthCode: string;
  amaranthName: string;
  vendorCode: string;
  vendorName: string;
  deptCode: string;
  deptName: string;
  currency: string;
  corePeriodDr: number;
  corePeriodCr: number;
  coreClosingBalance: number;
  amaranthPeriodDr: number;
  amaranthPeriodCr: number;
  amaranthClosingBalance: number;
  deltaKrw: number;
  drCr: 3 | 4;
  selected: boolean;
}

// Column helpers shared across views
function checkboxCol(onToggle: (i: number) => void): Column<UnifiedRow> {
  return {
    key: "select",
    label: "",
    className: "w-10",
    render: (_row, i) => (
      <input
        type="checkbox"
        checked={_row.selected}
        onChange={() => onToggle(i)}
        className="rounded border-slate-300 text-blue-600"
      />
    ),
  };
}

function codeCol(t: (k: string) => string): Column<UnifiedRow> {
  return {
    key: "amaranthCode",
    label: t("th.amaranthCode"),
    sortValue: (r) => r.amaranthCode,
    render: (row) => <span className="font-mono text-xs">{row.amaranthCode}</span>,
  };
}

function nameCol(t: (k: string) => string): Column<UnifiedRow> {
  return {
    key: "amaranthName",
    label: t("th.amaranthName"),
    sortValue: (r) => r.amaranthName,
    render: (row) => <span className="text-sm">{row.amaranthName}</span>,
  };
}

function drCrCol(t: (k: string) => string): Column<UnifiedRow> {
  return {
    key: "drCr",
    label: t("th.drCr"),
    sortValue: (r) => r.drCr,
    render: (row) => (
      <Badge variant={row.drCr === 3 ? "blue" : "orange"}>
        {row.drCr === 3 ? "DR(3)" : "CR(4)"}
      </Badge>
    ),
  };
}

// Source columns: show 2 decimal places (as Core provides them); FCY always 2dp
function sourceAmountCol(key: string, label: string, getValue: (r: UnifiedRow) => number): Column<UnifiedRow> {
  return {
    key,
    label,
    className: "text-right",
    sortValue: getValue,
    render: (row) => {
      const v = getValue(row);
      const formatted = row.currency === "KRW" ? formatKRWDecimal(v) : formatFCY(v);
      return (
        <span className="font-mono text-xs text-right block">
          {formatted}
        </span>
      );
    },
  };
}

// Delta columns: KRW rounded to whole numbers (Amaranth compatibility); FCY 2dp
function deltaAmountCol(key: string, label: string, getValue: (r: UnifiedRow) => number): Column<UnifiedRow> {
  return {
    key,
    label,
    className: "text-right",
    sortValue: getValue,
    render: (row) => {
      const v = getValue(row);
      const formatted = row.currency === "KRW" ? formatKRW(v) : formatFCY(v);
      const colorClass = v > 0 ? "text-green-600" : v < 0 ? "text-red-600" : "";
      return (
        <span className={`font-mono text-xs text-right block font-medium ${colorClass}`}>
          {formatted}
        </span>
      );
    },
  };
}

function getValueColumns(method: Method, t: (k: string) => string): Column<UnifiedRow>[] {
  if (method === "gross") {
    return [
      sourceAmountCol("coreDr", t("th.coreDr"), (r) => r.corePeriodDr),
      sourceAmountCol("coreCr", t("th.coreCr"), (r) => r.corePeriodCr),
      sourceAmountCol("amrDr", t("th.amaranthDr"), (r) => r.amaranthPeriodDr),
      sourceAmountCol("amrCr", t("th.amaranthCr"), (r) => r.amaranthPeriodCr),
      deltaAmountCol("deltaDr", t("th.deltaDr"), (r) => r.corePeriodDr - r.amaranthPeriodDr),
      deltaAmountCol("deltaCr", t("th.deltaCr"), (r) => r.corePeriodCr - r.amaranthPeriodCr),
    ];
  }
  if (method === "net") {
    return [
      sourceAmountCol("coreBal", t("th.coreBalance"), (r) => r.coreClosingBalance),
      sourceAmountCol("amrBal", t("th.amaranthBalance"), (r) => r.amaranthClosingBalance),
      deltaAmountCol("delta", t("th.delta"), (r) => r.deltaKrw),
    ];
  }
  // netOfGross
  return [
    sourceAmountCol("coreNet", t("th.coreNet"), (r) => r.corePeriodDr - r.corePeriodCr),
    sourceAmountCol("amrNet", t("th.amaranthNet"), (r) => r.amaranthPeriodDr - r.amaranthPeriodCr),
    deltaAmountCol("delta", t("th.delta"), (r) => r.deltaKrw),
  ];
}

function toBsRow(row: BSIntegrationEntry, entryType?: "BS" | "PL"): UnifiedRow {
  return {
    entryType,
    amaranthCode: row.amaranthCode,
    amaranthName: row.amaranthName,
    vendorCode: row.vendorCode,
    vendorName: row.vendorName,
    deptCode: "",
    deptName: "",
    currency: row.currency,
    corePeriodDr: row.corePeriodDr,
    corePeriodCr: row.corePeriodCr,
    coreClosingBalance: row.coreClosingBalance,
    amaranthPeriodDr: row.amaranthPeriodDr,
    amaranthPeriodCr: row.amaranthPeriodCr,
    amaranthClosingBalance: row.amaranthClosingBalance,
    deltaKrw: row.deltaKrw,
    drCr: row.drCr,
    selected: row.selected,
  };
}

function toPlRow(row: PLIntegrationEntry, entryType?: "BS" | "PL"): UnifiedRow {
  return {
    entryType,
    amaranthCode: row.amaranthCode,
    amaranthName: row.amaranthName,
    vendorCode: "",
    vendorName: "",
    deptCode: row.deptCode,
    deptName: row.deptName,
    currency: "KRW",
    corePeriodDr: row.corePeriodDr,
    corePeriodCr: row.corePeriodCr,
    coreClosingBalance: row.coreClosingBalance,
    amaranthPeriodDr: row.amaranthPeriodDr,
    amaranthPeriodCr: row.amaranthPeriodCr,
    amaranthClosingBalance: row.amaranthClosingBalance,
    deltaKrw: row.deltaKrw,
    drCr: row.drCr,
    selected: row.selected,
  };
}

export default function IntegrationTable(props: IntegrationTableProps) {
  const { t } = useLanguage();
  const { method } = props as { method: Method };

  if (props.type === "all") {
    const combinedData: UnifiedRow[] = [
      ...props.bsData.map((r) => toBsRow(r, "BS")),
      ...props.plData.map((r) => toPlRow(r, "PL")),
    ];
    const bsCount = props.bsData.length;
    const handleToggle = (i: number) => {
      if (i < bsCount) props.onToggleBs(i);
      else props.onTogglePl(i - bsCount);
    };

    const columns: Column<UnifiedRow>[] = [
      checkboxCol(handleToggle),
      {
        key: "entryType",
        label: t("th.type"),
        sortValue: (r) => r.entryType || "",
        render: (row) => (
          <Badge variant={row.entryType === "BS" ? "blue" : "success"}>
            {row.entryType}
          </Badge>
        ),
      },
      codeCol(t),
      nameCol(t),
      {
        key: "vendorCode",
        label: t("th.vendorCode"),
        sortValue: (r) => r.vendorCode,
        render: (row) =>
          row.vendorCode ? (
            <div>
              <div className="font-mono text-xs text-slate-500">{row.vendorCode}</div>
              <div className="text-xs text-slate-600">{row.vendorName}</div>
            </div>
          ) : (
            <span className="text-xs text-slate-300">—</span>
          ),
      },
      {
        key: "deptCode",
        label: t("th.dept"),
        sortValue: (r) => r.deptCode,
        render: (row) =>
          row.deptCode ? (
            <div>
              <div className="font-mono text-xs text-slate-500">{row.deptCode}</div>
              <div className="text-xs text-slate-600">{row.deptName}</div>
            </div>
          ) : (
            <span className="text-xs text-slate-300">—</span>
          ),
      },
      {
        key: "currency",
        label: t("th.currency"),
        sortValue: (r) => r.currency,
        render: (row) => <span className="text-xs font-medium">{row.currency}</span>,
      },
      ...getValueColumns(method, t),
      drCrCol(t),
    ];

    return (
      <DataTable
        columns={columns}
        data={combinedData}
        emptyMessage={t("msg.noIntegrationData")}
        rowClassName={(row) => (!row.selected ? "opacity-40" : "")}
      />
    );
  }

  if (props.type === "bs") {
    const data = props.data.map((r) => toBsRow(r));
    const columns: Column<UnifiedRow>[] = [
      checkboxCol(props.onToggle),
      codeCol(t),
      nameCol(t),
      {
        key: "vendorCode",
        label: t("th.vendorCode"),
        sortValue: (r) => r.vendorCode,
        render: (row) => (
          <div>
            <div className="font-mono text-xs text-slate-500">{row.vendorCode}</div>
            <div className="text-xs text-slate-600">{row.vendorName}</div>
          </div>
        ),
      },
      {
        key: "currency",
        label: t("th.currency"),
        sortValue: (r) => r.currency,
        render: (row) => <span className="text-xs font-medium">{row.currency}</span>,
      },
      ...getValueColumns(method, t),
      drCrCol(t),
    ];

    return (
      <DataTable
        columns={columns}
        data={data}
        emptyMessage={t("msg.noBsIntegrationData")}
        rowClassName={(row) => (!row.selected ? "opacity-40" : "")}
      />
    );
  }

  // PL table
  const data = props.data.map((r) => toPlRow(r));
  const columns: Column<UnifiedRow>[] = [
    checkboxCol(props.onToggle),
    codeCol(t),
    nameCol(t),
    {
      key: "deptCode",
      label: t("th.deptCode"),
      sortValue: (r) => r.deptCode,
      render: (row) => <span className="font-mono text-xs">{row.deptCode}</span>,
    },
    {
      key: "deptName",
      label: t("th.deptName"),
      sortValue: (r) => r.deptName,
      render: (row) => <span className="text-sm">{row.deptName}</span>,
    },
    ...getValueColumns(method, t),
    drCrCol(t),
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage={t("msg.noPlIntegrationData")}
      rowClassName={(row) => (!row.selected ? "opacity-40" : "")}
    />
  );
}
