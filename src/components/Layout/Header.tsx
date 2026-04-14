import { User } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { lang, setLang } = useLanguage();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        {subtitle && (
          <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex rounded-md border border-slate-300 overflow-hidden text-xs font-medium">
          <button
            onClick={() => setLang("en")}
            className={`px-2.5 py-1.5 transition-colors ${
              lang === "en"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang("kr")}
            className={`px-2.5 py-1.5 border-l border-slate-300 transition-colors ${
              lang === "kr"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            KR
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <User size={16} />
          <span>yeshwant</span>
        </div>
      </div>
    </header>
  );
}
