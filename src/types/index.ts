export type AccountNature = "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";

export type MappingStatus = "Mapped" | "Unmapped" | "Excluded";

export type BSCategory =
  | "Current Assets"
  | "Non-Current Assets"
  | "Current Liabilities"
  | "Non-Current Liabilities"
  | "Equity";

export type PLCategory =
  | "Operating Revenue"
  | "Operating Expenses"
  | "Non-Operating Income"
  | "Non-Operating Expenses"
  | "Corporate Tax";

export interface BSCoreLedger {
  code: string;
  name: string;
  glCode: string;
  glName: string;
  category: BSCategory;
  currency: string;
  balance: number;
  mappingStatus?: MappingStatus;
}

export interface PLCoreLedger {
  code: string;
  name: string;
  glCode: string;
  glName: string;
  category: PLCategory;
  balance: number;
  mappingStatus?: MappingStatus;
}

export interface BSMapping {
  coreLedgerCodes: string[];
  amaranthCode: string;
  amaranthName: string;
  vendorCode: string;
  vendorName: string;
  currencyCode: string;
}

export interface PLMapping {
  coreLedgerCode: string;
  amaranthCode: string;
  amaranthName: string;
  departmentCode: string;
  departmentName: string;
}

export interface Department {
  code: string;
  name: string;
  level: string;
  parentCode: string | null;
}

export interface BSIntegrationEntry {
  amaranthCode: string;
  amaranthName: string;
  vendorCode: string;
  vendorName: string;
  currency: string;
  coreFcyBalance: number;
  coreKrwBalance: number;
  amaranthFcyBalance: number;
  amaranthKrwBalance: number;
  deltaFcy: number;
  deltaKrw: number;
  drCr: 3 | 4;
  accountNature: AccountNature;
  selected: boolean;
}

export interface PLIntegrationEntry {
  amaranthCode: string;
  amaranthName: string;
  deptCode: string;
  deptName: string;
  coreKrwBalance: number;
  amaranthKrwBalance: number;
  deltaKrw: number;
  drCr: 3 | 4;
  accountNature: AccountNature;
  selected: boolean;
}

export interface IntegrationHistoryEntry {
  id: string;
  date: string;
  time: string;
  type: "Auto" | "Manual";
  executedBy: string;
  bsEntries: number;
  plEntries: number;
  totalDr: number;
  totalCr: number;
  status: "Success" | "Failed" | "Rolled Back";
}

export interface DrCrResult {
  drCr: 3 | 4;
  amount: number;
  fcyNote?: string;
}
