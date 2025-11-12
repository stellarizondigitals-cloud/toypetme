/**
 * Format coins as USD currency
 * @param coins - Number of coins to format
 * @returns Formatted string like "$123" or "$1,234"
 */
export function formatCurrency(coins: number): string {
  return `$${coins.toLocaleString()}`;
}

/**
 * Format coin reward with + prefix
 * @param coins - Number of coins earned
 * @returns Formatted string like "+$5" or "+$123"
 */
export function formatCoinReward(coins: number): string {
  return `+$${coins.toLocaleString()}`;
}
