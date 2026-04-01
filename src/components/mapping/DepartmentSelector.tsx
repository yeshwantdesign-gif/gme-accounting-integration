import { useState } from "react";
import { departments } from "../../data/departments";

interface DepartmentSelectorProps {
  value: string;
  onChange: (code: string, name: string) => void;
}

export default function DepartmentSelector({ value, onChange }: DepartmentSelectorProps) {
  const [search, setSearch] = useState(value ? `${value}` : "");
  const [open, setOpen] = useState(false);

  const filtered = departments.filter(
    (d) =>
      d.code.includes(search) ||
      d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Search department..."
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filtered.slice(0, 20).map((dept) => (
            <button
              key={dept.code}
              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50"
              onClick={() => {
                onChange(dept.code, dept.name);
                setSearch(`${dept.code} - ${dept.name}`);
                setOpen(false);
              }}
            >
              <span className="font-mono text-xs text-slate-500">{dept.code}</span>{" "}
              {dept.name}{" "}
              <span className="text-xs text-slate-400">({dept.level})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
