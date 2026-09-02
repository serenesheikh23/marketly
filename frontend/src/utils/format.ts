/**
 * Format a price number to a clean display string.
 * e.g. 10000 → "$10,000" | 49.99 → "$49.99" | 50 → "$50"
 */
export function formatPrice(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '$0';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '$0';
  // Remove trailing .00
  const fixed = Number.isInteger(num) ? num.toString() : num.toFixed(2).replace(/\.?0+$/, '');
  return '$' + Number(fixed).toLocaleString('en-US');
}
