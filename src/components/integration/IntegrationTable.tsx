import type { BSIntegrationEntry, PLIntegrationEntry } from "../../types";
import { formatKRW } from "../../utils/formatters";
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

function codeCol(): Column<UnifiedRow> {
  return {
    key: "amaranthCode",
    label: "Amaranth Code",
    sortValue: (r) => r.amaranthCode,
    render: (row) => <span className="font-mono text-xs">{row.amaranthCode}</span>,
  };
}

function nameCol(): Column<UnifiedRow> {
  return {
    key: "amaranthName",
    label: "Amaranth Name",
    sortValue: (r) => r.amaranthName,
    render: (row) => <span className="text-sm">{row.amaranthName}</span>,
  };
}

function drCrCol(): Column<UnifiedRow> {
  return {
    key: "drCr",
    label: "DR/CR",
    sortValue: (r) => r.drCr,
    render: (row) => (
      <Badge variant={row.drCr === 3 ? "blue" : "orange"}>
        {row.drCr === 3 ? "DR(3)" : "CR(4)"}
      </Badge>
    ),
  };
}

function amountCol(key: string, label: string, getValue: (r: UnifiedRow) => number, colored = false): Column<UnifiedRow> {
  return {
    key,
    label,
    className: "text-right",
    sortValue: getValue,
    render: (row) => {
      const v = getValue(row);
      const colorClass = colored
        ? v > 0 ? "text-green-600" : v < 0 ? "text-red-600" : ""
        : "";
      return (
        <span className={`font-mono text-xs text-right block ${colored ? "font-medium" : ""} ${colorClass}`}>
          {formatKRW(v)}
        </span>
      );
    },
  };
}

function getValueColumns(method: Method): Column<UnifiedRow>[] {
  if (method === "gross") {
    return [
      amountCol("coreDr", "Core DR", (r) => r.corePeriodDr),
      amountCol("coreCr", "Core CR", (r) => r.corePeriodCr),
      amountCol("amrDr", "Amaranth DR", (r) => r.amaranthPeriodDr),
      amountCol("amrCr", "Amaranth CR", (r) => r.amaranthPeriodCr),
      amountCol("deltaDr", "Delta DR", (r) => r.corePeriodDr - r.amaranthPeriodDr, true),
      amountCol("deltaCr", "Delta CR", (r) => r.corePeriodCr - r.amaranthPeriodCr, true),
    ];
  }
  if (method === "net") {
    return [
      amountCol("coreBal", "Core Balance", (r) => r.coreClosingBalance),
      amountCol("amrBal", "Amaranth Balance", (r) => r.amaranthClosingBalance),
      amountCol("delta", "Delta", (r) => r.deltaKrw, true),
    ];
  }
  // netOfGross
  return [
    amountCol("coreNet", "Core Net", (r) => r.corePeriodDr - r.corePeriodCr),
    amountCol("amrNet", "Amaranth Net", (r) => r.amaranthPeriodDr - r.amaranthPeriodCr),
    amountCol("delta", "Delta", (r) => r.deltaKrw, true),
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
        label: "Type",
        sortValue: (r) => r.entryType || "",
        render: (row) => (
          <Badge variant={row.entryType === "BS" ? "blue" : "success"}>
            {row.entryType}
          </Badge>
        ),
      },
      codeCol(),
      nameCol(),
      {
        key: "vendorCode",
        label: "Vendor",
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
        label: "Dept",
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
        label: "CCY",
        sortValue: (r) => r.currency,
        render: (row) => <span className="text-xs font-medium">{row.currency}</span>,
      },
      ...getValueColumns(method),
      drCrCol(),
    ];

    return (
      <DataTable
        columns={columns}
        data={combinedData}
        emptyMessage="No integration data. Click 'Fetch Data' to load."
        rowClassName={(row) => (!row.selected ? "opacity-40" : "")}
      />
    );
  }

  if (props.type === "bs") {
    const data = props.data.map((r) => toBsRow(r));
    const columns: Column<UnifiedRow>[] = [
      checkboxCol(props.onToggle),
      codeCol(),
      nameCol(),
      {
        key: "vendorCode",
        label: "Vendor",
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
        label: "CCY",
        sortValue: (r) => r.currency,
        render: (row) => <span className="text-xs font-medium">{row.currency}</span>,
      },
      ...getValueColumns(method),
      drCrCol(),
    ];

    return (
      <DataTable
        columns={columns}
        data={data}
        emptyMessage="No BS integration data. Click 'Fetch Data' to load."
        rowClassName={(row) => (!row.selected ? "opacity-40" : "")}
      />
    );
  }

  // PL table
  const data = props.data.map((r) => toPlRow(r));
  const columns: Column<UnifiedRow>[] = [
    checkboxCol(props.onToggle),
    codeCol(),
    nameCol(),
    {
      key: "deptCode",
      label: "Dept Code",
      sortValue: (r) => r.deptCode,
      render: (row) => <span className="font-mono text-xs">{row.deptCode}</span>,
    },
    {
      key: "deptName",
      label: "Dept Name",
      sortValue: (r) => r.deptName,
      render: (row) => <span className="text-sm">{row.deptName}</span>,
    },
    ...getValueColumns(method),
    drCrCol(),
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage="No PL integration data. Click 'Fetch Data' to load."
      rowClassName={(row) => (!row.selected ? "opacity-40" : "")}
    />
  );
}
