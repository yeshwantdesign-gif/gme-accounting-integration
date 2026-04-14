import { useState, useEffect, useRef, useCallback } from "react";
import { Save, Trash2, X, ChevronDown, Search } from "lucide-react";
import Modal from "../common/Modal";

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

// --- Amaranth Account Lookup Data ---
const amaranthAccounts = [
  { code: "12600002", name: "예치금(소액해외송금 해외협력사)", drcrType: "1 (차변)", groupCode: "1260" },
  { code: "4010001", name: "소액해외송금 당발송금 수익 (개인)", drcrType: "2 (대변)", groupCode: "4010" },
  { code: "8540001", name: "소액해외송금 해외협력사수수료 비용", drcrType: "1 (차변)", groupCode: "8540" },
  { code: "8010001", name: "급여", drcrType: "1 (차변)", groupCode: "8010" },
  { code: "2530001", name: "미지급금", drcrType: "2 (대변)", groupCode: "2530" },
  { code: "1080000", name: "외상매출금", drcrType: "1 (차변)", groupCode: "1080" },
  { code: "1010001", name: "현금", drcrType: "1 (차변)", groupCode: "1010" },
  { code: "1030001", name: "보통예금", drcrType: "1 (차변)", groupCode: "1030" },
  { code: "2550000", name: "예수금", drcrType: "2 (대변)", groupCode: "2550" },
  { code: "4050001", name: "이자수익", drcrType: "2 (대변)", groupCode: "4050" },
  { code: "8110001", name: "임차료", drcrType: "1 (차변)", groupCode: "8110" },
  { code: "8120001", name: "감가상각비", drcrType: "1 (차변)", groupCode: "8120" },
  { code: "8210001", name: "복리후생비", drcrType: "1 (차변)", groupCode: "8210" },
  { code: "8310001", name: "통신비", drcrType: "1 (차변)", groupCode: "8310" },
  { code: "8410001", name: "소모품비", drcrType: "1 (차변)", groupCode: "8410" },
  { code: "9010001", name: "이자비용", drcrType: "1 (차변)", groupCode: "9010" },
];

// --- Vendor Lookup Data ---
const vendors = [
  { code: "00003", name: "IME Ltd", type: "해외협력사" },
  { code: "00105", name: "Kasikornbank", type: "해외협력사" },
  { code: "VND-BC", name: "BC Card", type: "카드사" },
  { code: "00112", name: "Daegu Bank", type: "금융기관" },
  { code: "00045", name: "KEB Hana Bank", type: "금융기관" },
  { code: "00078", name: "Kwangju Bank", type: "금융기관" },
  { code: "00091", name: "Shinhan Bank", type: "금융기관" },
  { code: "00023", name: "Wing Cambodia", type: "해외협력사" },
  { code: "00056", name: "Alipay", type: "해외협력사" },
  { code: "00034", name: "Commercial Bank of Ceylon", type: "해외협력사" },
  { code: "00067", name: "KB Kookmin Bank", type: "금융기관" },
  { code: "00089", name: "Woori Bank", type: "금융기관" },
];

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

  // Lookup modal state
  const [showAccountLookup, setShowAccountLookup] = useState(false);
  const [accountLookupSearch, setAccountLookupSearch] = useState("");
  const [showVendorLookup, setShowVendorLookup] = useState(false);
  const [vendorLookupSearch, setVendorLookupSearch] = useState("");

  const amaranthCodeRef = useRef<HTMLInputElement>(null);
  const vendorCodeRef = useRef<HTMLInputElement>(null);

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

  // F2 handler for Amaranth Code field
  const handleAmaranthKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "F2") {
      e.preventDefault();
      setAccountLookupSearch("");
      setShowAccountLookup(true);
    }
  }, []);

  // F2 handler for Vendor Code field
  const handleVendorKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "F2") {
      e.preventDefault();
      setVendorLookupSearch("");
      setShowVendorLookup(true);
    }
  }, []);

  const filteredAccounts = amaranthAccounts.filter(
    (a) =>
      a.code.includes(accountLookupSearch) ||
      a.name.toLowerCase().includes(accountLookupSearch.toLowerCase())
  );

  const filteredVendors = vendors.filter(
    (v) =>
      v.code.toLowerCase().includes(vendorLookupSearch.toLowerCase()) ||
      v.name.toLowerCase().includes(vendorLookupSearch.toLowerCase())
  );

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

      {/* Amaranth GL Code with F2 lookup */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Amaranth GL Code *
        </label>
        <div className="flex gap-1">
          <input
            ref={amaranthCodeRef}
            type="text"
            value={amaranthCode}
            onChange={(e) => setAmaranthCode(e.target.value)}
            onKeyDown={handleAmaranthKeyDown}
            className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 12600002"
          />
          <button
            type="button"
            onClick={() => { setAccountLookupSearch(""); setShowAccountLookup(true); }}
            className="px-2.5 py-2 border border-slate-300 rounded-md hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors"
            title="Search Amaranth accounts (F2)"
          >
            <Search size={14} />
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-1">Press F2 or click 🔍 to search</p>
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
          {/* Vendor Code with F2 lookup */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Vendor Code * <span className="text-red-500">(Required for BS)</span>
            </label>
            <div className="flex gap-1">
              <input
                ref={vendorCodeRef}
                type="text"
                value={vendorCode}
                onChange={(e) => setVendorCode(e.target.value)}
                onKeyDown={handleVendorKeyDown}
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 00105"
              />
              <button
                type="button"
                onClick={() => { setVendorLookupSearch(""); setShowVendorLookup(true); }}
                className="px-2.5 py-2 border border-slate-300 rounded-md hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors"
                title="Search vendors (F2)"
              >
                <Search size={14} />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">Press F2 or click 🔍 to search</p>
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

      {/* Amaranth Account Lookup Modal */}
      <Modal open={showAccountLookup} onClose={() => setShowAccountLookup(false)} title="Amaranth Account Lookup" wide>
        <div className="space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={accountLookupSearch}
              onChange={(e) => setAccountLookupSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by code or name..."
              autoFocus
            />
          </div>
          <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0">
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-3 py-2 text-left font-medium text-slate-600 whitespace-nowrap">Account Code</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600 whitespace-nowrap">Account Name</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600 whitespace-nowrap">DR/CR Type</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600 whitespace-nowrap">Group Code</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.length === 0 ? (
                  <tr><td colSpan={4} className="px-3 py-6 text-center text-slate-400">No matching accounts</td></tr>
                ) : (
                  filteredAccounts.map((acc) => (
                    <tr
                      key={acc.code}
                      className="border-b border-slate-100 hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setAmaranthCode(acc.code);
                        setAmaranthName(acc.name);
                        setShowAccountLookup(false);
                      }}
                    >
                      <td className="px-3 py-2 font-mono text-xs">{acc.code}</td>
                      <td className="px-3 py-2">{acc.name}</td>
                      <td className="px-3 py-2 text-xs">{acc.drcrType}</td>
                      <td className="px-3 py-2 font-mono text-xs">{acc.groupCode}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* Vendor Lookup Modal (BS only) */}
      <Modal open={showVendorLookup} onClose={() => setShowVendorLookup(false)} title="Vendor Lookup" wide>
        <div className="space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={vendorLookupSearch}
              onChange={(e) => setVendorLookupSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by code or name..."
              autoFocus
            />
          </div>
          <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0">
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-3 py-2 text-left font-medium text-slate-600 whitespace-nowrap">Vendor Code</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600 whitespace-nowrap">Vendor Name</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600 whitespace-nowrap">Type</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.length === 0 ? (
                  <tr><td colSpan={3} className="px-3 py-6 text-center text-slate-400">No matching vendors</td></tr>
                ) : (
                  filteredVendors.map((v) => (
                    <tr
                      key={v.code}
                      className="border-b border-slate-100 hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setVendorCode(v.code);
                        setVendorName(v.name);
                        setShowVendorLookup(false);
                      }}
                    >
                      <td className="px-3 py-2 font-mono text-xs">{v.code}</td>
                      <td className="px-3 py-2">{v.name}</td>
                      <td className="px-3 py-2 text-xs">{v.type}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
}
