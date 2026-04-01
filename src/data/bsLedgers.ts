import type { BSCoreLedger } from "../types";

export const bsCoreLedgers: BSCoreLedger[] = [
  // Current Assets - Cash
  { code: "286202", name: "Cash CIS KRW", glCode: "22", glName: "Cash", category: "Current Assets", currency: "KRW", balance: 0 },
  { code: "165089", name: "Cash Dongdaemun KRW", glCode: "22", glName: "Cash", category: "Current Assets", currency: "KRW", balance: -23694350 },
  { code: "165108", name: "Cash Gimhae KRW", glCode: "22", glName: "Cash", category: "Current Assets", currency: "KRW", balance: -27104411.54 },

  // Current Assets - Bank Deposit KRW
  { code: "100038", name: "KEB Hana Bank Operative Account(16904) KRW", glCode: "72", glName: "Bank Deposit KRW", category: "Current Assets", currency: "KRW", balance: 10047660857 },
  { code: "147257", name: "Kwangju Bank Account(615914) KRW", glCode: "72", glName: "Bank Deposit KRW", category: "Current Assets", currency: "KRW", balance: 20758637030 },
  { code: "482077", name: "Shinhan Bank FX Deal Account(466215) KRW", glCode: "72", glName: "Bank Deposit KRW", category: "Current Assets", currency: "KRW", balance: 4718515004 },

  // Current Assets - Bank Deposit FCY
  { code: "100036", name: "KEB Hana Bank FX Deal Account(32738) USD", glCode: "73", glName: "Bank Deposit FCY", category: "Current Assets", currency: "USD", balance: 649766637 },
  { code: "175977", name: "KEB Hana Bank FX Deal Account(32738) JPY", glCode: "73", glName: "Bank Deposit FCY", category: "Current Assets", currency: "JPY", balance: -24638052 },
  { code: "100043", name: "Shinhan Bank FX Deal Account(792531) USD", glCode: "73", glName: "Bank Deposit FCY", category: "Current Assets", currency: "USD", balance: -725450000 },

  // Current Assets - Overseas Partner Prefunding
  { code: "101715553", name: "Kasikornbank (0531761758) Prefunding THB", glCode: "156", glName: "Deposit of Overseas Partner", category: "Current Assets", currency: "THB", balance: 15682941 },
  { code: "771617414", name: "IME Ltd Prefunding NPR", glCode: "156", glName: "Deposit of Overseas Partner", category: "Current Assets", currency: "NPR", balance: 406591649.03 },
  { code: "771617407", name: "IME Ltd Prefunding USD", glCode: "156", glName: "Deposit of Overseas Partner", category: "Current Assets", currency: "USD", balance: 1000 },
  { code: "161740", name: "IME Ltd Prefunding USD (Account 2)", glCode: "156", glName: "Deposit of Overseas Partner", category: "Current Assets", currency: "USD", balance: 5000 },
  { code: "118270", name: "Wing Cambodia Prefunding USD", glCode: "156", glName: "Deposit of Overseas Partner", category: "Current Assets", currency: "USD", balance: -1470650832.69 },
  { code: "239622", name: "Alipay Prefunding USD", glCode: "156", glName: "Deposit of Overseas Partner", category: "Current Assets", currency: "USD", balance: -7386978.16 },

  // Current Liabilities - Payable
  { code: "473951", name: "Payable BC Card", glCode: "9", glName: "Payable", category: "Current Liabilities", currency: "KRW", balance: 154398263 },
  { code: "415708", name: "Payable Core link Holdings", glCode: "9", glName: "Payable", category: "Current Liabilities", currency: "KRW", balance: 36036200 },
  { code: "160785", name: "Payable KT Co Ltd", glCode: "9", glName: "Payable", category: "Current Liabilities", currency: "KRW", balance: 21744177 },

  // Current Liabilities - Short Term Borrowing
  { code: "429826", name: "Short Term Borrowing Daegu Bank", glCode: "178", glName: "Short Term Borrowing", category: "Current Liabilities", currency: "KRW", balance: 1000000000 },
  { code: "278173", name: "Short Term Borrowing KEB Hana Bank", glCode: "178", glName: "Short Term Borrowing", category: "Current Liabilities", currency: "KRW", balance: 1000000000 },

  // Non-Current Liabilities
  { code: "163206", name: "Provision for Retirement Salary", glCode: "202", glName: "Provision for Retirement Salary", category: "Non-Current Liabilities", currency: "KRW", balance: 1392560516 },
  { code: "162545", name: "Long Term Borrowing (FCY) IME Global Holdings", glCode: "203", glName: "Long Term Borrowing (FCY)", category: "Non-Current Liabilities", currency: "USD", balance: 2795580000 },

  // Non-Current Assets
  { code: "100068", name: "Structure", glCode: "108", glName: "Structure", category: "Non-Current Assets", currency: "KRW", balance: -1188206361 },
  { code: "100072", name: "Accumulated Depreciation Structure", glCode: "109", glName: "Accumulated Depreciation Structure", category: "Non-Current Assets", currency: "KRW", balance: 776639648 },
  { code: "116750", name: "Software", glCode: "113", glName: "Software", category: "Non-Current Assets", currency: "KRW", balance: -1756375229 },

  // Equity
  { code: "100058", name: "Capital Stock Sung Jong Hwa (John)", glCode: "17", glName: "Capital Stock", category: "Equity", currency: "KRW", balance: 600000000 },
  { code: "100065", name: "Profit Reserve", glCode: "20", glName: "Profit Reserve", category: "Equity", currency: "KRW", balance: 800000000 },
];
