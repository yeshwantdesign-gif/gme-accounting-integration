import type { BSMapping, PLMapping } from "../types";

export const bsMappings: BSMapping[] = [
  {
    coreLedgerCodes: ["101715553"],
    amaranthCode: "12600002",
    amaranthName: "예치금(소액해외송금 해외협력사)",
    vendorCode: "00105",
    vendorName: "Kasikornbank",
    currencyCode: "THB",
  },
  {
    coreLedgerCodes: ["771617414"],
    amaranthCode: "12600002",
    amaranthName: "예치금(소액해외송금 해외협력사)",
    vendorCode: "00003",
    vendorName: "IME Ltd",
    currencyCode: "NPR",
  },
  {
    coreLedgerCodes: ["771617407", "161740"],
    amaranthCode: "12600002",
    amaranthName: "예치금(소액해외송금 해외협력사)",
    vendorCode: "00003",
    vendorName: "IME Ltd",
    currencyCode: "USD",
  },
];

export const plMappings: PLMapping[] = [
  {
    coreLedgerCode: "100001",
    amaranthCode: "4010001",
    amaranthName: "소액해외송금 당발송금 수익 (개인)",
    departmentCode: "211000",
    departmentName: "Remittance",
  },
  {
    coreLedgerCode: "100008",
    amaranthCode: "8540001",
    amaranthName: "소액해외송금 해외협력사수수료 비용",
    departmentCode: "211000",
    departmentName: "Remittance",
  },
  {
    coreLedgerCode: "100011",
    amaranthCode: "8010001",
    amaranthName: "급여",
    departmentCode: "120000",
    departmentName: "인사총무",
  },
];
