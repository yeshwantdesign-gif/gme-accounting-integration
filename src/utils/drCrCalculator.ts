import type { AccountNature, DrCrResult } from "../types";

export function calculateDrCr(
  accountNature: AccountNature,
  deltaKrw: number,
  isBs: boolean
): DrCrResult {
  // BS ACCOUNTS (Asset, Liability, Equity)
  if (isBs) {
    // KRW amount can NEVER be negative in Amaranth for BS
    // If delta is negative, flip DR/CR side and use absolute value
    if (deltaKrw >= 0) {
      switch (accountNature) {
        case "Asset":
          return { drCr: 3, amount: deltaKrw };
        case "Liability":
          return { drCr: 4, amount: deltaKrw };
        case "Equity":
          return { drCr: 4, amount: deltaKrw };
        default:
          return { drCr: 3, amount: deltaKrw };
      }
    } else {
      switch (accountNature) {
        case "Asset":
          return { drCr: 4, amount: Math.abs(deltaKrw), fcyNote: "FCY may be negative" };
        case "Liability":
          return { drCr: 3, amount: Math.abs(deltaKrw), fcyNote: "FCY may be negative" };
        case "Equity":
          return { drCr: 3, amount: Math.abs(deltaKrw), fcyNote: "FCY may be negative" };
        default:
          return { drCr: 3, amount: Math.abs(deltaKrw) };
      }
    }
  }

  // PL ACCOUNTS (Revenue, Expense)
  // Unlike BS, PL accounts NEVER flip DR/CR side.
  // Negative deltas are posted as negative amounts on the same side.
  if (accountNature === "Revenue") {
    // Revenue → ALWAYS CR (4), even if delta is negative
    return { drCr: 4, amount: deltaKrw };
  }
  if (accountNature === "Expense") {
    // Expense → ALWAYS DR (3), even if delta is negative
    return { drCr: 3, amount: deltaKrw };
  }

  return { drCr: 3, amount: deltaKrw };
}
