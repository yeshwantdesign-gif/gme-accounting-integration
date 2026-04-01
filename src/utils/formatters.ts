export function formatKRW(amount: number): string {
  return Math.round(amount).toLocaleString("en-US");
}

export function formatFCY(amount: number): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatAmount(amount: number, currency: string): string {
  if (currency === "KRW") {
    return formatKRW(amount);
  }
  return formatFCY(amount);
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function formatDateTime(date: Date): string {
  return `${date.toISOString().split("T")[0]} ${date.toTimeString().split(" ")[0]}`;
}

export function formatDateString(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
