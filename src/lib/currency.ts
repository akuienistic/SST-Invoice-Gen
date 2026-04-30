export type CurrencyCode = "ETB" | "USD" | "EUR" | "GBP";

export const CURRENCIES: Record<CurrencyCode, { symbol: string; locale: string; label: string }> = {
  ETB: { symbol: "Br", locale: "en-ET", label: "ETB — Ethiopian Birr" },
  USD: { symbol: "$", locale: "en-US", label: "USD — US Dollar" },
  EUR: { symbol: "€", locale: "de-DE", label: "EUR — Euro" },
  GBP: { symbol: "£", locale: "en-GB", label: "GBP — British Pound" },
};

export function formatMoney(amount: number, currency: CurrencyCode): string {
  const { symbol } = CURRENCIES[currency];
  const value = (isFinite(amount) ? amount : 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency === "ETB" ? `${value} ${symbol}` : `${symbol}${value}`;
}
