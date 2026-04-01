import type { PLCoreLedger } from "../types";

export const plCoreLedgers: PLCoreLedger[] = [
  // Operating Revenue
  { code: "100001", name: "Income Remit Service Charge C2C Outbound Customer", glCode: "49", glName: "Remittance Business Income (C2C)", category: "Operating Revenue", balance: 15522937861.65 },
  { code: "123011", name: "Income Remit Service Charge C2C Inbound Corporate", glCode: "49", glName: "Remittance Business Income (C2C)", category: "Operating Revenue", balance: 182073541.42 },
  { code: "501146", name: "Income Remit Service Charge C2C Inbound Customer", glCode: "49", glName: "Remittance Business Income (C2C)", category: "Operating Revenue", balance: 110025000 },
  { code: "179341", name: "Income Prepaid Service Charge Local Transfer", glCode: "50", glName: "Prepaid Electronic Business Income", category: "Operating Revenue", balance: 4210147500 },
  { code: "447976", name: "Income Prepaid Service Charge Store Income (BC Card)", glCode: "50", glName: "Prepaid Electronic Business Income", category: "Operating Revenue", balance: 881060277 },
  { code: "682492", name: "Income MVNO", glCode: "118", glName: "Mobile Business Income", category: "Operating Revenue", balance: 1844727812 },
  { code: "100004", name: "Income Forex Margin (C2C)", glCode: "169", glName: "Forex Income", category: "Operating Revenue", balance: 16531782158.11 },

  // Operating Expenses
  { code: "100011", name: "Expense Wages and Salaries", glCode: "180", glName: "Staff Salary and Incentive", category: "Operating Expenses", balance: -8028653032 },
  { code: "116734", name: "Expense Part Time Salary", glCode: "229", glName: "Part Time Salary", category: "Operating Expenses", balance: -955986884 },
  { code: "100018", name: "Expense Rental", glCode: "123", glName: "Rental", category: "Operating Expenses", balance: -1107148216 },
  { code: "122243", name: "Expense Marketing", glCode: "65", glName: "Marketing & Promotion", category: "Operating Expenses", balance: -1664509490 },
  { code: "100082", name: "Expense Other Service", glCode: "64", glName: "Other Service", category: "Operating Expenses", balance: -4254175258.44 },
  { code: "100008", name: "Expense Remit Service Overseas Partner Payout", glCode: "131", glName: "Expense of Operating Partners (Remittance)", category: "Operating Expenses", balance: -10565242344.01 },
  { code: "137092", name: "Expense System Management", glCode: "127", glName: "System Management", category: "Operating Expenses", balance: -1062841362 },
  { code: "116729", name: "Expense Software", glCode: "128", glName: "Software Expense", category: "Operating Expenses", balance: -272335845 },
  { code: "100014", name: "Expense Telephone and Communication", glCode: "221", glName: "Communication", category: "Operating Expenses", balance: -314737310 },

  // Non-Operating
  { code: "100031", name: "Income Interest", glCode: "138", glName: "Interest Income", category: "Non-Operating Income", balance: 233336679.92 },
  { code: "100019", name: "Expense Interest", glCode: "143", glName: "Interest Expense", category: "Non-Operating Expenses", balance: -1069822635.37 },

  // Tax
  { code: "100047", name: "Expense Corporate Tax", glCode: "147", glName: "Corporate Tax", category: "Corporate Tax", balance: 0 },
];
