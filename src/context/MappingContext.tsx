import { createContext, useContext, useState, useCallback } from "react";
import type { BSMapping, PLMapping } from "../types";
import type { MappingHistoryEntry } from "../components/mapping/MappingHistory";
import { bsMappings as initialBsMappings, plMappings as initialPlMappings } from "../data/mappings";

function nowTimestamp(): string {
  const d = new Date();
  return d.getFullYear() + "/" +
    String(d.getMonth() + 1).padStart(2, "0") + "/" +
    String(d.getDate()).padStart(2, "0") + " " +
    String(d.getHours()).padStart(2, "0") + ":" +
    String(d.getMinutes()).padStart(2, "0") + ":" +
    String(d.getSeconds()).padStart(2, "0");
}

interface MappingContextType {
  // BS state
  bsMappings: BSMapping[];
  setBsMappings: React.Dispatch<React.SetStateAction<BSMapping[]>>;
  bsExcludedCodes: Set<string>;
  setBsExcludedCodes: React.Dispatch<React.SetStateAction<Set<string>>>;
  bsLastSyncTime: string | null;
  setBsLastSyncTime: React.Dispatch<React.SetStateAction<string | null>>;
  bsHistoryLog: MappingHistoryEntry[];
  addBsHistoryEntry: (action: MappingHistoryEntry["action"], ledgerCode: string, ledgerName: string, details: string) => void;

  // PL state
  plMappings: PLMapping[];
  setPlMappings: React.Dispatch<React.SetStateAction<PLMapping[]>>;
  plExcludedCodes: Set<string>;
  setPlExcludedCodes: React.Dispatch<React.SetStateAction<Set<string>>>;
  plLastSyncTime: string | null;
  setPlLastSyncTime: React.Dispatch<React.SetStateAction<string | null>>;
  plHistoryLog: MappingHistoryEntry[];
  addPlHistoryEntry: (action: MappingHistoryEntry["action"], ledgerCode: string, ledgerName: string, details: string) => void;
}

const MappingContext = createContext<MappingContextType | null>(null);

const bsSeedHistory: MappingHistoryEntry[] = [
  { id: "seed-1", timestamp: "2026/03/28 10:15:30", user: "yeshwant", action: "Created", ledgerCode: "110201", ledgerName: "외화보통예금(USD)", details: "Mapped to Amaranth 12600002 / Vendor 00003 / USD" },
  { id: "seed-2", timestamp: "2026/03/28 10:18:45", user: "yeshwant", action: "Created", ledgerCode: "110202", ledgerName: "외화보통예금(THB)", details: "Mapped to Amaranth 12600002 / Vendor 00105 / THB" },
  { id: "seed-3", timestamp: "2026/03/29 14:22:10", user: "sundariya", action: "Updated", ledgerCode: "110202", ledgerName: "외화보통예금(THB)", details: "Changed vendor from 00003 to 00105" },
  { id: "seed-4", timestamp: "2026/03/30 09:05:55", user: "yeshwant", action: "Excluded", ledgerCode: "990101", ledgerName: "잡손실(비경상)", details: "Excluded from integration" },
  { id: "seed-5", timestamp: "2026/04/01 11:30:00", user: "sundariya", action: "Included", ledgerCode: "990101", ledgerName: "잡손실(비경상)", details: "Included back into integration" },
];

const plSeedHistory: MappingHistoryEntry[] = [
  { id: "seed-1", timestamp: "2026/03/28 11:20:15", user: "yeshwant", action: "Created", ledgerCode: "401001", ledgerName: "소액해외송금 당발송금 수익 (개인)", details: "Mapped to Amaranth 4010001 / Dept 211000" },
  { id: "seed-2", timestamp: "2026/03/29 09:45:30", user: "sundariya", action: "Created", ledgerCode: "854001", ledgerName: "소액해외송금 해외협력사수수료 비용", details: "Mapped to Amaranth 8540001 / Dept 211000" },
  { id: "seed-3", timestamp: "2026/03/30 16:10:05", user: "yeshwant", action: "Updated", ledgerCode: "401001", ledgerName: "소액해외송금 당발송금 수익 (개인)", details: "Changed department from 120000 to 211000" },
  { id: "seed-4", timestamp: "2026/04/01 10:00:20", user: "yeshwant", action: "Excluded", ledgerCode: "999001", ledgerName: "법인세비용(당기)", details: "Excluded from integration" },
];

export function MappingProvider({ children }: { children: React.ReactNode }) {
  // BS state
  const [bsMappings, setBsMappings] = useState<BSMapping[]>(initialBsMappings);
  const [bsExcludedCodes, setBsExcludedCodes] = useState<Set<string>>(new Set());
  const [bsLastSyncTime, setBsLastSyncTime] = useState<string | null>(null);
  const [bsHistoryLog, setBsHistoryLog] = useState<MappingHistoryEntry[]>(bsSeedHistory);

  const addBsHistoryEntry = useCallback((action: MappingHistoryEntry["action"], ledgerCode: string, ledgerName: string, details: string) => {
    setBsHistoryLog((prev) => [{
      id: Date.now().toString(),
      timestamp: nowTimestamp(),
      user: "yeshwant",
      action,
      ledgerCode,
      ledgerName,
      details,
    }, ...prev]);
  }, []);

  // PL state
  const [plMappings, setPlMappings] = useState<PLMapping[]>(initialPlMappings);
  const [plExcludedCodes, setPlExcludedCodes] = useState<Set<string>>(new Set());
  const [plLastSyncTime, setPlLastSyncTime] = useState<string | null>(null);
  const [plHistoryLog, setPlHistoryLog] = useState<MappingHistoryEntry[]>(plSeedHistory);

  const addPlHistoryEntry = useCallback((action: MappingHistoryEntry["action"], ledgerCode: string, ledgerName: string, details: string) => {
    setPlHistoryLog((prev) => [{
      id: Date.now().toString(),
      timestamp: nowTimestamp(),
      user: "yeshwant",
      action,
      ledgerCode,
      ledgerName,
      details,
    }, ...prev]);
  }, []);

  return (
    <MappingContext.Provider value={{
      bsMappings, setBsMappings, bsExcludedCodes, setBsExcludedCodes,
      bsLastSyncTime, setBsLastSyncTime, bsHistoryLog, addBsHistoryEntry,
      plMappings, setPlMappings, plExcludedCodes, setPlExcludedCodes,
      plLastSyncTime, setPlLastSyncTime, plHistoryLog, addPlHistoryEntry,
    }}>
      {children}
    </MappingContext.Provider>
  );
}

export function useMappingContext() {
  const ctx = useContext(MappingContext);
  if (!ctx) throw new Error("useMappingContext must be used within MappingProvider");
  return ctx;
}
