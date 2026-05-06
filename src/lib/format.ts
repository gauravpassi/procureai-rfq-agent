/**
 * Indian numeric formatting — auto lakhs/crores when >= 1L.
 * Used wherever the design shows ₹ amounts.
 */
export const fmtINR = (n: number | null | undefined): string => {
  if (n == null) return "";
  if (n >= 10_000_000) {
    const v = n / 10_000_000;
    return `₹${v.toFixed(n % 10_000_000 === 0 ? 0 : 2)}Cr`;
  }
  if (n >= 100_000) {
    const v = n / 100_000;
    return `₹${v.toFixed(n % 100_000 === 0 ? 0 : 2)}L`;
  }
  return "₹" + new Intl.NumberFormat("en-IN").format(n);
};

export const fmtINRFull = (n: number | null | undefined): string =>
  n == null ? "" : "₹" + new Intl.NumberFormat("en-IN").format(n);

export const fmtDate = (d: Date | string, opts?: Intl.DateTimeFormatOptions): string => {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-IN", opts ?? { day: "numeric", month: "short", year: "numeric" }).format(date);
};
