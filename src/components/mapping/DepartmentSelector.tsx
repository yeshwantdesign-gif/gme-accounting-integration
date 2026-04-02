import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { departments } from "../../data/departments";

interface DepartmentSelectorProps {
  value: string;
  onChange: (code: string, name: string) => void;
}

export default function DepartmentSelector({ value, onChange }: DepartmentSelectorProps) {
  const [search, setSearch] = useState(value ? `${value}` : "");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = departments.filter(
    (d) =>
      d.code.includes(search) ||
      d.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onClick={() => setOpen(!open)}
          className="w-full px-3 py-2 pr-8 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search department..."
        />
        <ChevronDown
          size={16}
          className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>
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
