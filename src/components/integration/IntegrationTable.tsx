import type { BSIntegrationEntry, PLIntegrationEntry } from "../../types";
import { formatKRW, formatFCY } from "../../utils/formatters";
import Badge from "../common/Badge";
import DataTable from "../common/DataTable";
import type { Column } from "../common/DataTable";

interface BSTableProps {
  type: "bs";
  data: BSIntegrationEntry[];
  onToggle: (index: number) => void;
}

interface PLTableProps {
  type: "pl";
  data: PLIntegrationEntry[];
  onToggle: (index: number) => void;
}

type IntegrationTableProps = BSTableProps | PLTableProps;

export default function IntegrationTable(props: IntegrationTableProps) {
  if (props.type === "bs") {
    const columns: Column<BSIntegrationEntry>[] = [
      {
        key: "select",
        label: "",
        className: "w-10",
        render: (row, i) => (
          <input
            type="checkbox"
            checked={row.selected}
            onChange={() => props.onToggle(i)}
            className="rounded border-slate-300 text-blue-600"
          />
        ),
      },
      {
        key: "amaranthCode",
        label: "Amaranth Code",
        sortValue: (r) => r.amaranthCode,
        render: (row) => <span className="font-mono text-xs">{row.amaranthCode}</span>,
      },
      {
        key: "amaranthName",
        label: "Amaranth Name",
        sortValue: (r) => r.amaranthName,
        render: (row) => <span className="text-sm">{row.amaranthName}</span>,
      },
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
      {
        key: "coreFcy",
        label: "Core FCY",
        className: "text-right",
        sortValue: (r) => r.coreFcyBalance,
        render: (row) => (
          <span className="font-mono text-xs text-right block">
            {row.currency !== "KRW" ? formatFCY(row.coreFcyBalance) : "-"}
          </span>
        ),
      },
      {
        key: "coreKrw",
        label: "Core KRW",
        className: "text-right",
        sortValue: (r) => r.coreKrwBalance,
        render: (row) => (
          <span className="font-mono text-xs text-right block">{formatKRW(row.coreKrwBalance)}</span>
        ),
      },
      {
        key: "amaranthFcy",
        label: "Amr FCY",
        className: "text-right",
        sortValue: (r) => r.amaranthFcyBalance,
        render: (row) => (
          <span className="font-mono text-xs text-right block">
            {row.currency !== "KRW" ? formatFCY(row.amaranthFcyBalance) : "-"}
          </span>
        ),
      },
      {
        key: "amaranthKrw",
        label: "Amr KRW",
        className: "text-right",
        sortValue: (r) => r.amaranthKrwBalance,
        render: (row) => (
          <span className="font-mono text-xs text-right block">{formatKRW(row.amaranthKrwBalance)}</span>
        ),
      },
      {
        key: "deltaFcy",
        label: "Delta FCY",
        className: "text-right",
        sortValue: (r) => r.deltaFcy,
        render: (row) => (
          <span
            className={`font-mono text-xs text-right block ${
              row.deltaFcy > 0 ? "text-green-600" : row.deltaFcy < 0 ? "text-red-600" : ""
            }`}
          >
            {row.currency !== "KRW" ? formatFCY(row.deltaFcy) : "-"}
          </span>
        ),
      },
      {
        key: "deltaKrw",
        label: "Delta KRW",
        className: "text-right",
        sortValue: (r) => r.deltaKrw,
        render: (row) => (
          <span
            className={`font-mono text-xs text-right block font-medium ${
              row.deltaKrw > 0 ? "text-green-600" : row.deltaKrw < 0 ? "text-red-600" : ""
            }`}
          >
            {formatKRW(row.deltaKrw)}
          </span>
        ),
      },
      {
        key: "drCr",
        label: "DR/CR",
        sortValue: (r) => r.drCr,
        render: (row) => (
          <Badge variant={row.drCr === 3 ? "blue" : "orange"}>
            {row.drCr === 3 ? "DR(3)" : "CR(4)"}
          </Badge>
        ),
      },
    ];

    return (
      <DataTable
        columns={columns}
        data={props.data}
        emptyMessage="No BS integration data. Click 'Fetch Data' to load."
        rowClassName={(row) => (!row.selected ? "opacity-40" : "")}
      />
    );
  }

  // PL table
  const plColumns: Column<PLIntegrationEntry>[] = [
    {
      key: "select",
      label: "",
      className: "w-10",
      render: (row, i) => (
        <input
          type="checkbox"
          checked={row.selected}
          onChange={() => props.onToggle(i)}
          className="rounded border-slate-300 text-blue-600"
        />
      ),
    },
    {
      key: "amaranthCode",
      label: "Amaranth Code",
      sortValue: (r) => r.amaranthCode,
      render: (row) => <span className="font-mono text-xs">{row.amaranthCode}</span>,
    },
    {
      key: "amaranthName",
      label: "Amaranth Name",
      sortValue: (r) => r.amaranthName,
      render: (row) => <span className="text-sm">{row.amaranthName}</span>,
    },
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
    {
      key: "coreKrw",
      label: "Core KRW",
      className: "text-right",
      sortValue: (r) => r.coreKrwBalance,
      render: (row) => (
        <span className="font-mono text-xs text-right block">{formatKRW(row.coreKrwBalance)}</span>
      ),
    },
    {
      key: "amaranthKrw",
      label: "Amaranth KRW",
      className: "text-right",
      sortValue: (r) => r.amaranthKrwBalance,
      render: (row) => (
        <span className="font-mono text-xs text-right block">{formatKRW(row.amaranthKrwBalance)}</span>
      ),
    },
    {
      key: "deltaKrw",
      label: "Delta KRW",
      className: "text-right",
      sortValue: (r) => r.deltaKrw,
      render: (row) => (
        <span
          className={`font-mono text-xs text-right block font-medium ${
            row.deltaKrw > 0 ? "text-green-600" : row.deltaKrw < 0 ? "text-red-600" : ""
          }`}
        >
          {formatKRW(row.deltaKrw)}
        </span>
      ),
    },
    {
      key: "drCr",
      label: "DR/CR",
      sortValue: (r) => r.drCr,
      render: (row) => (
        <Badge variant={row.drCr === 3 ? "blue" : "orange"}>
          {row.drCr === 3 ? "DR(3)" : "CR(4)"}
        </Badge>
      ),
    },
  ];

  return (
    <DataTable
      columns={plColumns}
      data={props.data}
      emptyMessage="No PL integration data. Click 'Fetch Data' to load."
      rowClassName={(row) => (!row.selected ? "opacity-40" : "")}
    />
  );
}
