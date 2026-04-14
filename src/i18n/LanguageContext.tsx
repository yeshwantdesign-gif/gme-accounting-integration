import { createContext, useContext, useState, useCallback } from "react";

export type Lang = "en" | "kr";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Lang, string>> = {
  // Sidebar
  "nav.dashboard": { en: "Dashboard", kr: "대시보드" },
  "nav.accountMapping": { en: "Account Mapping", kr: "계정 매핑" },
  "nav.bsMapping": { en: "BS Mapping", kr: "BS 매핑" },
  "nav.plMapping": { en: "PL Mapping", kr: "PL 매핑" },
  "nav.dataIntegration": { en: "Data Integration", kr: "데이터 연동" },
  "nav.autoVoucher": { en: "Auto Voucher", kr: "자동 전표" },
  "nav.manualVoucher": { en: "Manual Voucher", kr: "수동 전표" },
  "nav.integrationHistory": { en: "Integration History", kr: "연동 이력" },

  // Page titles & subtitles
  "page.dashboard.title": { en: "Dashboard", kr: "대시보드" },
  "page.dashboard.subtitle": { en: "GME Core System → Amaranth 10 Integration Overview", kr: "GME Core 시스템 → Amaranth 10 연동 현황" },
  "page.bsMapping.title": { en: "BS Account Mapping", kr: "BS 계정 매핑 관리" },
  "page.bsMapping.subtitle": { en: "Balance Sheet — Core System → Amaranth 10", kr: "재무상태표 — Core 시스템 → Amaranth 10" },
  "page.plMapping.title": { en: "PL Account Mapping", kr: "PL 계정 매핑 관리" },
  "page.plMapping.subtitle": { en: "Profit & Loss — Core System → Amaranth 10 (1:1 Strict)", kr: "손익계산서 — Core 시스템 → Amaranth 10 (1:1 엄격)" },
  "page.autoVoucher.title": { en: "Auto Voucher Integration", kr: "자동 전표 연동" },
  "page.autoVoucher.subtitle": { en: "Automated data integration — Core System → Amaranth 10", kr: "자동 데이터 연동 — Core 시스템 → Amaranth 10" },
  "page.manualVoucher.title": { en: "Manual Voucher Integration", kr: "수동 전표 연동" },
  "page.manualVoucher.subtitle": { en: "Manual data integration — Core System → Amaranth 10", kr: "수동 데이터 연동 — Core 시스템 → Amaranth 10" },
  "page.history.title": { en: "Integration History", kr: "연동 이력" },
  "page.history.subtitle": { en: "Review past integration executions", kr: "과거 연동 실행 내역 조회" },

  // Buttons
  "btn.saveMapping": { en: "Save Mapping", kr: "매핑 저장" },
  "btn.delete": { en: "Delete", kr: "매핑 삭제" },
  "btn.clear": { en: "Clear", kr: "초기화" },
  "btn.syncFromCore": { en: "Sync from Core", kr: "Core 동기화" },
  "btn.exclude": { en: "Exclude", kr: "제외" },
  "btn.include": { en: "Include", kr: "포함" },
  "btn.fetchData": { en: "Fetch Data", kr: "데이터 조회" },
  "btn.executeIntegration": { en: "Execute Integration", kr: "연동 실행" },
  "btn.mappingHistory": { en: "Mapping History", kr: "매핑 이력" },
  "btn.cancel": { en: "Cancel", kr: "취소" },
  "btn.done": { en: "Done", kr: "완료" },
  "btn.proceedAnyway": { en: "Proceed Anyway", kr: "강제 실행" },

  // Labels
  "label.coreSystemLedgers": { en: "Core System Ledgers", kr: "Core 시스템 원장" },
  "label.corePLLedgers": { en: "Core System P&L Ledgers", kr: "Core 시스템 P&L 원장" },
  "label.amaranthMappingConfig": { en: "Amaranth Mapping Configuration", kr: "Amaranth 매핑 설정" },
  "label.balanceDate": { en: "Balance Date", kr: "잔액 기준일" },
  "label.periodFrom": { en: "Period From", kr: "기간 시작일" },
  "label.periodTo": { en: "Period To", kr: "기간 종료일" },
  "label.search": { en: "Search", kr: "검색" },
  "label.allCategories": { en: "All Categories", kr: "전체 카테고리" },
  "label.type": { en: "Type", kr: "유형" },
  "label.method": { en: "Method", kr: "방식" },
  "label.lastSynced": { en: "Last synced", kr: "마지막 동기화" },
  "label.never": { en: "Never", kr: "없음" },
  "label.executor": { en: "Executor", kr: "실행자" },
  "label.timestamp": { en: "Timestamp", kr: "시간" },

  // Table headers
  "th.amaranthCode": { en: "Amaranth Code", kr: "Amaranth 코드" },
  "th.amaranthName": { en: "Amaranth Name", kr: "Amaranth 명" },
  "th.vendorCode": { en: "Vendor", kr: "거래처" },
  "th.deptCode": { en: "Dept Code", kr: "부서 코드" },
  "th.deptName": { en: "Dept Name", kr: "부서 명" },
  "th.dept": { en: "Dept", kr: "부서" },
  "th.currency": { en: "CCY", kr: "통화" },
  "th.coreBalance": { en: "Core Balance", kr: "Core 잔액" },
  "th.amaranthBalance": { en: "Amaranth Balance", kr: "Amaranth 잔액" },
  "th.delta": { en: "Delta", kr: "차이" },
  "th.coreDr": { en: "Core DR", kr: "Core 차변" },
  "th.coreCr": { en: "Core CR", kr: "Core 대변" },
  "th.amaranthDr": { en: "Amaranth DR", kr: "Amaranth 차변" },
  "th.amaranthCr": { en: "Amaranth CR", kr: "Amaranth 대변" },
  "th.deltaDr": { en: "Delta DR", kr: "차이 차변" },
  "th.deltaCr": { en: "Delta CR", kr: "차이 대변" },
  "th.coreNet": { en: "Core Net", kr: "Core 순액" },
  "th.amaranthNet": { en: "Amaranth Net", kr: "Amaranth 순액" },
  "th.drCr": { en: "DR/CR", kr: "차변/대변" },
  "th.status": { en: "Status", kr: "상태" },
  "th.totalDr": { en: "Total DR (3)", kr: "총 차변 (3)" },
  "th.totalCr": { en: "Total CR (4)", kr: "총 대변 (4)" },
  "th.netDifference": { en: "Net Difference", kr: "순 차이" },
  "th.totalEntries": { en: "Total Entries", kr: "총 건수" },
  "th.selected": { en: "Selected", kr: "선택" },

  // Badges / Status
  "badge.mapped": { en: "Mapped", kr: "매핑됨" },
  "badge.unmapped": { en: "Unmapped", kr: "미매핑" },
  "badge.excluded": { en: "Excluded", kr: "제외됨" },

  // Tabs
  "tab.gross": { en: "Gross", kr: "총액" },
  "tab.net": { en: "Net", kr: "순액" },
  "tab.netOfGross": { en: "Net of Gross", kr: "총액순액" },
  "tab.all": { en: "All (BS+PL)", kr: "전체 (BS+PL)" },

  // Dashboard
  "dashboard.bsLedgersMapped": { en: "BS Ledgers Mapped", kr: "BS 원장 매핑" },
  "dashboard.plLedgersMapped": { en: "PL Ledgers Mapped", kr: "PL 원장 매핑" },
  "dashboard.successfulIntegrations": { en: "Successful Integrations", kr: "연동 성공" },
  "dashboard.lastIntegration": { en: "Last Integration", kr: "최근 연동" },
  "dashboard.quickActions": { en: "Quick Actions", kr: "빠른 실행" },
  "dashboard.recentHistory": { en: "Recent Integration History", kr: "최근 연동 이력" },

  // Misc
  "misc.phase1": { en: "Phase 1 — Core → Amaranth", kr: "1단계 — Core → Amaranth" },
  "misc.showExcluded": { en: "Show Excluded", kr: "제외 항목 표시" },
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  const t = useCallback(
    (key: string): string => {
      const entry = translations[key];
      if (!entry) return key;
      return entry[lang] || entry.en || key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
