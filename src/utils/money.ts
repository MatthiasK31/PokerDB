export function round2(n: number): number {
  // Stable rounding to 2 decimals avoiding binary float artifacts
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function formatMoney(n: number, withSymbol: boolean = true): string {
  const v = round2(n);
  const s = v.toFixed(2);
  return withSymbol ? `$${s}` : s;
}

export function formatSigned(n: number, withSymbol: boolean = true): string {
  const sign = n > 0 ? '+' : n < 0 ? '-' : '';
  const abs = Math.abs(n);
  const val = formatMoney(abs, withSymbol);
  return sign ? `${sign}${withSymbol ? val.slice(1) : val}` : (withSymbol ? '$0.00' : '0.00');
}
