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
  "btn.includeAll": { en: "Include All", kr: "전체 포함" },
  "btn.fetchData": { en: "Fetch Data", kr: "데이터 조회" },
  "btn.executeIntegration": { en: "Execute Integration", kr: "연동 실행" },
  "btn.mappingHistory": { en: "Mapping History", kr: "매핑 이력" },
  "btn.cancel": { en: "Cancel", kr: "취소" },
  "btn.done": { en: "Done", kr: "완료" },
  "btn.proceedAnyway": { en: "Proceed Anyway", kr: "강제 실행" },
  "btn.proceed": { en: "Proceed", kr: "진행" },
  "btn.close": { en: "Close", kr: "닫기" },
  "btn.view": { en: "View", kr: "상세 보기" },
  "btn.rollback": { en: "Rollback", kr: "롤백" },
  "btn.confirmRollback": { en: "Confirm Rollback", kr: "롤백 확인" },
  "btn.selectAll": { en: "Select All", kr: "전체 선택" },

  // Labels
  "label.coreSystemLedgers": { en: "Core System Ledgers", kr: "Core 시스템 원장" },
  "label.corePLLedgers": { en: "Core System P&L Ledgers", kr: "Core 시스템 P&L 원장" },
  "label.amaranthMappingConfig": { en: "Amaranth Mapping Configuration", kr: "Amaranth 매핑 설정" },
  "label.balanceDate": { en: "Balance Date", kr: "잔액 기준일" },
  "label.bsBalanceDate": { en: "BS Balance Date", kr: "BS 잔액 기준일" },
  "label.periodFrom": { en: "Period From", kr: "기간 시작일" },
  "label.periodTo": { en: "Period To", kr: "기간 종료일" },
  "label.plPeriodFrom": { en: "PL Period From", kr: "PL 기간 시작일" },
  "label.plPeriodTo": { en: "PL Period To", kr: "PL 기간 종료일" },
  "label.search": { en: "Search", kr: "검색" },
  "label.allCategories": { en: "All Categories", kr: "전체 카테고리" },
  "label.type": { en: "Type", kr: "유형" },
  "label.method": { en: "Method", kr: "방식" },
  "label.lastSynced": { en: "Last synced", kr: "마지막 동기화" },
  "label.never": { en: "Never", kr: "없음" },
  "label.executor": { en: "Executor", kr: "실행자" },
  "label.timestamp": { en: "Timestamp", kr: "시간" },
  "label.executedBy": { en: "Executed By", kr: "실행자" },
  "label.selectedLedgers": { en: "Selected Ledgers:", kr: "선택된 원장:" },
  "label.selectedLedger": { en: "Selected Ledger:", kr: "선택된 원장:" },
  "label.amaranthGlCode": { en: "Amaranth GL Code *", kr: "Amaranth GL 코드 *" },
  "label.amaranthGlName": { en: "Amaranth GL Name *", kr: "Amaranth GL 명 *" },
  "label.vendorCode": { en: "Vendor Code *", kr: "거래처 코드 *" },
  "label.vendorCodeRequired": { en: "(Required for BS)", kr: "(BS 필수)" },
  "label.vendorName": { en: "Vendor Name", kr: "거래처 명" },
  "label.currencyCode": { en: "Currency Code *", kr: "통화 코드 *" },
  "label.department": { en: "Department *", kr: "부서 *" },
  "label.departmentRequired": { en: "(Required for PL)", kr: "(PL 필수)" },
  "label.from": { en: "From", kr: "시작일" },
  "label.to": { en: "To", kr: "종료일" },
  "label.allTypes": { en: "All Types", kr: "전체 유형" },
  "label.allStatuses": { en: "All Statuses", kr: "전체 상태" },
  "label.dateTime": { en: "Date & Time", kr: "일시" },
  "label.entrySummary": { en: "Entry Summary", kr: "건수 요약" },
  "label.apiResponse": { en: "API Response", kr: "API 응답" },
  "label.integrationId": { en: "Integration ID", kr: "연동 ID" },
  "label.date": { en: "Date", kr: "날짜" },
  "label.entries": { en: "Entries", kr: "건수" },
  "label.difference": { en: "Difference", kr: "차이" },

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
  "th.id": { en: "#", kr: "#" },
  "th.time": { en: "Time", kr: "시간" },
  "th.type": { en: "Type", kr: "유형" },
  "th.bsEntries": { en: "BS Entries", kr: "BS 건수" },
  "th.plEntries": { en: "PL Entries", kr: "PL 건수" },
  "th.totalDrAmount": { en: "Total DR", kr: "총 차변" },
  "th.totalCrAmount": { en: "Total CR", kr: "총 대변" },
  "th.actions": { en: "Actions", kr: "관리" },
  "th.accountCode": { en: "Account Code", kr: "계정 코드" },
  "th.accountName": { en: "Account Name", kr: "계정 명" },
  "th.drCrType": { en: "DR/CR Type", kr: "차변/대변 구분" },
  "th.groupCode": { en: "Group Code", kr: "그룹 코드" },
  "th.vendorCodeCol": { en: "Vendor Code", kr: "거래처 코드" },
  "th.vendorNameCol": { en: "Vendor Name", kr: "거래처 명" },
  "th.typeCol": { en: "Type", kr: "구분" },
  "th.user": { en: "User", kr: "사용자" },
  "th.action": { en: "Action", kr: "작업" },
  "th.coreLedger": { en: "Core Ledger", kr: "Core 원장" },
  "th.details": { en: "Details", kr: "상세" },
  "th.entriesBsPl": { en: "Entries (BS/PL)", kr: "건수 (BS/PL)" },

  // Badges / Status
  "badge.mapped": { en: "Mapped", kr: "매핑됨" },
  "badge.unmapped": { en: "Unmapped", kr: "미매핑" },
  "badge.excluded": { en: "Excluded", kr: "제외됨" },
  "badge.success": { en: "Success", kr: "성공" },
  "badge.failed": { en: "Failed", kr: "실패" },
  "badge.rolledBack": { en: "Rolled Back", kr: "롤백됨" },
  "badge.auto": { en: "Auto", kr: "자동" },
  "badge.manual": { en: "Manual", kr: "수동" },
  "badge.created": { en: "Created", kr: "생성" },
  "badge.updated": { en: "Updated", kr: "수정" },
  "badge.removed": { en: "Removed", kr: "삭제" },
  "badge.included": { en: "Included", kr: "포함" },

  // Tabs
  "tab.gross": { en: "Gross", kr: "총액" },
  "tab.net": { en: "Net", kr: "순액" },
  "tab.netOfGross": { en: "Net of Gross", kr: "총액순액" },
  "tab.all": { en: "All (BS+PL)", kr: "전체 (BS+PL)" },

  // Categories - BS
  "cat.currentAssets": { en: "Current Assets", kr: "유동자산" },
  "cat.nonCurrentAssets": { en: "Non-Current Assets", kr: "비유동자산" },
  "cat.currentLiabilities": { en: "Current Liabilities", kr: "유동부채" },
  "cat.nonCurrentLiabilities": { en: "Non-Current Liabilities", kr: "비유동부채" },
  "cat.equity": { en: "Equity", kr: "자본" },
  // Categories - PL
  "cat.operatingRevenue": { en: "Operating Revenue", kr: "영업수익" },
  "cat.operatingExpenses": { en: "Operating Expenses", kr: "영업비용" },
  "cat.nonOperatingIncome": { en: "Non-Operating Income", kr: "영업외수익" },
  "cat.nonOperatingExpenses": { en: "Non-Operating Expenses", kr: "영업외비용" },
  "cat.corporateTax": { en: "Corporate Tax", kr: "법인세" },

  // Filter actions
  "filter.allActions": { en: "All Actions", kr: "전체 작업" },

  // Dashboard
  "dashboard.bsLedgersMapped": { en: "BS Ledgers Mapped", kr: "BS 원장 매핑" },
  "dashboard.plLedgersMapped": { en: "PL Ledgers Mapped", kr: "PL 원장 매핑" },
  "dashboard.successfulIntegrations": { en: "Successful Integrations", kr: "연동 성공" },
  "dashboard.lastIntegration": { en: "Last Integration", kr: "최근 연동" },
  "dashboard.quickActions": { en: "Quick Actions", kr: "빠른 실행" },
  "dashboard.recentHistory": { en: "Recent Integration History", kr: "최근 연동 이력" },
  "dashboard.complete": { en: "% complete", kr: "% 완료" },
  "dashboard.failed": { en: "failed", kr: "실패" },
  "dashboard.bsAccountMapping": { en: "BS Account Mapping", kr: "BS 계정 매핑" },
  "dashboard.bsAccountMappingDesc": { en: "Configure balance sheet mappings", kr: "재무상태표 매핑 설정" },
  "dashboard.plAccountMapping": { en: "PL Account Mapping", kr: "PL 계정 매핑" },
  "dashboard.plAccountMappingDesc": { en: "Configure P&L mappings", kr: "손익계산서 매핑 설정" },
  "dashboard.autoVoucher": { en: "Auto Voucher", kr: "자동 전표" },
  "dashboard.autoVoucherDesc": { en: "Run automated integration", kr: "자동 연동 실행" },
  "dashboard.viewHistory": { en: "View History", kr: "이력 조회" },
  "dashboard.viewHistoryDesc": { en: "Review past integrations", kr: "과거 연동 내역 조회" },
  "dashboard.na": { en: "N/A", kr: "없음" },
  "dashboard.by": { en: "by", kr: "실행:" },

  // Modal titles
  "modal.amaranthAccountLookup": { en: "Amaranth Account Lookup", kr: "Amaranth 계정 조회" },
  "modal.vendorLookup": { en: "Vendor Lookup", kr: "거래처 조회" },
  "modal.excludedLedgers": { en: "Excluded Ledgers", kr: "제외된 원장" },
  "modal.mappingChangeHistory": { en: "Mapping Change History", kr: "매핑 변경 이력" },
  "modal.confirmExecution": { en: "Confirm Integration Execution", kr: "연동 실행 확인" },
  "modal.unbalancedWarning": { en: "Unbalanced DR/CR Warning", kr: "차변/대변 불일치 경고" },
  "modal.integrationSuccessful": { en: "Integration Successful", kr: "연동 성공" },
  "modal.integrationFailed": { en: "Integration Failed", kr: "연동 실패" },
  "modal.confirmRollback": { en: "Confirm Rollback", kr: "롤백 확인" },
  "modal.integrationDetails": { en: "Integration Details", kr: "연동 상세" },

  // Messages
  "msg.searchByCodeOrName": { en: "Search by code or name...", kr: "코드 또는 이름으로 검색..." },
  "msg.searchByLedgerOrDetails": { en: "Search by ledger or details...", kr: "원장 또는 상세 정보로 검색..." },
  "msg.searchDepartment": { en: "Search department...", kr: "부서 검색..." },
  "msg.selectLedgersToMap": { en: "Select one or more ledgers on the left to configure mapping", kr: "좌측에서 원장을 선택하여 매핑을 설정하세요" },
  "msg.selectLedgerToMap": { en: "Select a ledger on the left to configure mapping", kr: "좌측에서 원장을 선택하여 매핑을 설정하세요" },
  "msg.selectLedgersToInclude": { en: "Select ledgers to include back into the mapping list.", kr: "매핑 목록에 다시 포함할 원장을 선택하세요." },
  "msg.noExcludedLedgers": { en: "No excluded ledgers", kr: "제외된 원장이 없습니다" },
  "msg.noMatchingAccounts": { en: "No matching accounts", kr: "일치하는 계정이 없습니다" },
  "msg.noMatchingVendors": { en: "No matching vendors", kr: "일치하는 거래처가 없습니다" },
  "msg.noLedgersFound": { en: "No ledgers found", kr: "원장을 찾을 수 없습니다" },
  "msg.noHistoryEntries": { en: "No history entries found", kr: "이력이 없습니다" },
  "msg.noIntegrationHistory": { en: "No integration history found", kr: "연동 이력이 없습니다" },
  "msg.noIntegrationData": { en: "No integration data. Click 'Fetch Data' to load.", kr: "연동 데이터가 없습니다. '데이터 조회'를 클릭하세요." },
  "msg.noBsIntegrationData": { en: "No BS integration data. Click 'Fetch Data' to load.", kr: "BS 연동 데이터가 없습니다. '데이터 조회'를 클릭하세요." },
  "msg.noPlIntegrationData": { en: "No PL integration data. Click 'Fetch Data' to load.", kr: "PL 연동 데이터가 없습니다. '데이터 조회'를 클릭하세요." },
  "msg.f2ToSearch": { en: "Press F2 or click 🔍 to search", kr: "F2 또는 🔍 클릭으로 검색" },
  "msg.n1Mapping": { en: "N:1 Mapping", kr: "N:1 매핑" },
  "msg.ledgers": { en: "ledgers", kr: "원장" },
  "msg.ledger": { en: "ledger", kr: "원장" },
  "msg.mapped": { en: "mapped", kr: "매핑됨" },
  "msg.fetchingIntegrationData": { en: "Fetching integration data...", kr: "연동 데이터를 조회하고 있습니다..." },
  "msg.fetchingManualVoucherData": { en: "Fetching manual voucher data...", kr: "수동 전표 데이터를 조회하고 있습니다..." },
  "msg.krwRoundingNote": { en: "KRW amounts in Delta columns are rounded to whole numbers for Amaranth compatibility.", kr: "Delta 열의 KRW 금액은 Amaranth 호환을 위해 정수로 반올림됩니다." },
  "msg.unusedLedgerWarningGl216": { en: "Unused Ledger Warning: GL 216 items detected", kr: "미사용 원장 경고: GL 216 항목이 감지되었습니다" },
  "msg.unusedLedgerWarningGl148": { en: "Unused Ledger Warning: GL 148 item detected", kr: "미사용 원장 경고: GL 148 항목이 감지되었습니다" },
  "msg.balanced": { en: "Balanced — DR equals CR", kr: "일치 — 차변과 대변이 동일합니다" },
  "msg.unbalancedPrefix": { en: "Unbalanced — DR and CR do not match. Difference:", kr: "불일치 — 차변과 대변이 다릅니다. 차이:" },
  "msg.balanceVerifyNote": { en: "Note: DR/CR balance can only be verified in the combined BS+PL view", kr: "참고: 차변/대변 일치 여부는 전체 (BS+PL) 보기에서만 확인 가능합니다" },
  "msg.showingEntries": { en: "Showing", kr: "표시:" },
  "msg.of": { en: "of", kr: "/" },
  "msg.entriesLabel": { en: "entries", kr: "건" },

  // Execute modal messages
  "msg.confirmExecuteText": { en: "You are about to execute", kr: "" },
  "msg.voucherIntegration": { en: "Voucher Integration with the following summary:", kr: "전표 연동을 다음 요약과 함께 실행합니다:" },
  "msg.autoVoucher": { en: "Auto", kr: "자동" },
  "msg.manualVoucher": { en: "Manual", kr: "수동" },
  "msg.unbalancedText": { en: "Total DR and CR do not match. You can adjust manually in Amaranth after integration.", kr: "총 차변과 대변이 일치하지 않습니다. 연동 후 Amaranth에서 수동으로 조정할 수 있습니다." },
  "msg.integrationComplete": { en: "Integration Complete", kr: "연동 완료" },
  "msg.entriesProcessed": { en: "entries processed successfully", kr: "건이 성공적으로 처리되었습니다" },
  "msg.integrationError": { en: "An error occurred during integration", kr: "연동 중 오류가 발생했습니다" },
  "msg.rollbackConfirmText": { en: "This will reverse all entries from integration", kr: "이 연동의 모든 항목이 취소됩니다:" },
  "msg.rollbackCompensatingText": { en: "This action creates compensating entries in Amaranth 10.", kr: "Amaranth 10에 보정 전표가 생성됩니다." },

  // Toast messages
  "toast.mappingSaved": { en: "Mapping saved", kr: "매핑이 저장되었습니다" },
  "toast.mappingSavedForLedgers": { en: "Mapping saved for", kr: "매핑 저장 완료:" },
  "toast.ledgersUnit": { en: "ledger(s)", kr: "개 원장" },
  "toast.plMappingSaved": { en: "PL mapping saved", kr: "PL 매핑이 저장되었습니다" },
  "toast.mappingRemoved": { en: "Mapping removed successfully", kr: "매핑이 삭제되었습니다" },
  "toast.ledgersSynced": { en: "Ledger list synced from Core system", kr: "Core 시스템에서 원장 목록이 동기화되었습니다" },
  "toast.ledgersExcluded": { en: "ledger(s) excluded from integration", kr: "개 원장이 연동에서 제외되었습니다" },
  "toast.ledgersIncluded": { en: "ledger(s) included back", kr: "개 원장이 다시 포함되었습니다" },
  "toast.dataFetched": { en: "Data fetched successfully", kr: "데이터가 성공적으로 조회되었습니다" },
  "toast.manualDataFetched": { en: "Manual voucher data fetched", kr: "수동 전표 데이터가 조회되었습니다" },
  "toast.integrationExecuted": { en: "Integration executed successfully", kr: "연동이 성공적으로 실행되었습니다" },
  "toast.manualIntegrationExecuted": { en: "Manual integration executed successfully", kr: "수동 연동이 성공적으로 실행되었습니다" },
  "toast.bsMappingRequired": { en: "Amaranth GL Code, Vendor Code, and Currency are required for BS mappings", kr: "BS 매핑에는 Amaranth GL 코드, 거래처 코드, 통화가 필수입니다" },
  "toast.plMappingRequired": { en: "Amaranth GL Code and Department are required for PL mappings", kr: "PL 매핑에는 Amaranth GL 코드와 부서가 필수입니다" },

  // Sidebar
  "sidebar.appName": { en: "GME Accounting", kr: "GME 회계" },
  "sidebar.appSubtitle": { en: "Amaranth 10 Integration", kr: "Amaranth 10 연동" },

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
