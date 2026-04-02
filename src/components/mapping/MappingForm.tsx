import { useState, useEffect, useRef } from "react";
import { Save, Trash2, X, ChevronDown } from "lucide-react";

interface BSMappingFormProps {
  type: "bs";
  selectedCount: number;
  initialData?: {
    amaranthCode: string;
    amaranthName: string;
    vendorCode: string;
    vendorName: string;
    currencyCode: string;
  };
  onSave: (data: {
    amaranthCode: string;
    amaranthName: string;
    vendorCode: string;
    vendorName: string;
    currencyCode: string;
  }) => void;
  onClear: () => void;
  onDelete: () => void;
}

interface PLMappingFormProps {
  type: "pl";
  selectedCount: number;
  initialData?: {
    amaranthCode: string;
    amaranthName: string;
    departmentCode: string;
    departmentName: string;
  };
  departments: { code: string; name: string; level: string }[];
  onSave: (data: {
    amaranthCode: string;
    amaranthName: string;
    departmentCode: string;
    departmentName: string;
  }) => void;
  onClear: () => void;
  onDelete: () => void;
}

type MappingFormProps = BSMappingFormProps | PLMappingFormProps;

const currencies = ["KRW", "USD", "NPR", "THB", "JPY", "PHP", "VND", "BDT", "EUR", "GBP", "IDR", "CNY", "KHR", "MNT", "MMK", "LKR", "PKR", "INR"];

function DeptDropdown({
  deptSearch,
  setDeptSearch,
  showDeptDropdown,
  setShowDeptDropdown,
  filteredDepts,
  onSelect,
}: {
  deptSearch: string;
  setDeptSearch: (v: string) => void;
  showDeptDropdown: boolean;
  setShowDeptDropdown: (v: boolean) => void;
  filteredDepts: { code: string; name: string; level: string }[];
  onSelect: (dept: { code: string; name: string }) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showDeptDropdown) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDeptDropdown(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowDeptDropdown(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showDeptDropdown, setShowDeptDropdown]);

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        Department * <span className="text-red-500">(Required for PL)</span>
      </label>
      <div className="relative">
        <input
          type="text"
          value={deptSearch}
          onChange={(e) => {
            setDeptSearch(e.target.value);
            setShowDeptDropdown(true);
          }}
          onClick={() => setShowDeptDropdown(!showDeptDropdown)}
          className="w-full px-3 py-2 pr-8 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search department..."
        />
        <ChevronDown
          size={16}
          className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-transform ${
            showDeptDropdown ? "rotate-180" : ""
          }`}
        />
      </div>
      {showDeptDropdown && filteredDepts.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filteredDepts.slice(0, 20).map((dept) => (
            <button
              key={dept.code}
              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center justify-between"
              onClick={() => onSelect(dept)}
            >
              <span>
                <span className="font-mono text-xs text-slate-500">{dept.code}</span>{" "}
                {dept.name}
              </span>
              <span className="text-xs text-slate-400">{dept.level}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MappingForm(props: MappingFormProps) {
  const [amaranthCode, setAmaranthCode] = useState("");
  const [amaranthName, setAmaranthName] = useState("");
  const [vendorCode, setVendorCode] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [currencyCode, setCurrencyCode] = useState("KRW");
  const [departmentCode, setDepartmentCode] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [deptSearch, setDeptSearch] = useState("");
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);

  useEffect(() => {
    if (props.type === "bs" && props.initialData) {
      setAmaranthCode(props.initialData.amaranthCode);
      setAmaranthName(props.initialData.amaranthName);
      setVendorCode(props.initialData.vendorCode);
      setVendorName(props.initialData.vendorName);
      setCurrencyCode(props.initialData.currencyCode);
    } else if (props.type === "pl" && props.initialData) {
      setAmaranthCode(props.initialData.amaranthCode);
      setAmaranthName(props.initialData.amaranthName);
      setDepartmentCode(props.initialData.departmentCode);
      setDepartmentName(props.initialData.departmentName);
      setDeptSearch(`${props.initialData.departmentCode} - ${props.initialData.departmentName}`);
    } else {
      setAmaranthCode("");
      setAmaranthName("");
      setVendorCode("");
      setVendorName("");
      setCurrencyCode("KRW");
      setDepartmentCode("");
      setDepartmentName("");
      setDeptSearch("");
    }
  }, [props.type, props.initialData]);

  const handleSave = () => {
    if (props.type === "bs") {
      props.onSave({ amaranthCode, amaranthName, vendorCode, vendorName, currencyCode });
    } else {
      props.onSave({ amaranthCode, amaranthName, departmentCode, departmentName });
    }
  };

  const filteredDepts =
    props.type === "pl"
      ? props.departments.filter(
          (d) =>
            d.code.includes(deptSearch) ||
            d.name.toLowerCase().includes(deptSearch.toLowerCase())
        )
      : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-700">
          Amaranth Mapping Configuration
        </h3>
        {props.selectedCount > 1 && props.type === "bs" && (
          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded">
            N:1 Mapping ({props.selectedCount} ledgers)
          </span>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Amaranth GL Code *
        </label>
        <input
          type="text"
          value={amaranthCode}
          onChange={(e) => setAmaranthCode(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., 12600002"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Amaranth GL Name *
        </label>
        <input
          type="text"
          value={amaranthName}
          onChange={(e) => setAmaranthName(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., 예치금(소액해외송금 해외협력사)"
        />
      </div>

      {props.type === "bs" ? (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Vendor Code * <span className="text-red-500">(Required for BS)</span>
            </label>
            <input
              type="text"
              value={vendorCode}
              onChange={(e) => setVendorCode(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 00105"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Vendor Name
            </label>
            <input
              type="text"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Kasikornbank"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Currency Code *
            </label>
            <select
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {currencies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </>
      ) : (
        <DeptDropdown
          deptSearch={deptSearch}
          setDeptSearch={setDeptSearch}
          showDeptDropdown={showDeptDropdown}
          setShowDeptDropdown={setShowDeptDropdown}
          filteredDepts={filteredDepts}
          onSelect={(dept) => {
            setDepartmentCode(dept.code);
            setDepartmentName(dept.name);
            setDeptSearch(`${dept.code} - ${dept.name}`);
            setShowDeptDropdown(false);
          }}
        />
      )}

      <div className="flex gap-2 pt-2">
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          <Save size={14} />
          Save Mapping
        </button>
        <button
          onClick={props.onClear}
          className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-600 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors"
        >
          <X size={14} />
          Clear
        </button>
        <button
          onClick={props.onDelete}
          className="flex items-center gap-1.5 px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-md hover:bg-red-50 transition-colors"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </div>
  );
}
