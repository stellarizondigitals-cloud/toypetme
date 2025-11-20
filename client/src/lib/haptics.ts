type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const hapticPatterns: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 40,
  success: [10, 50, 10],
  warning: [20, 100, 20],
  error: [40, 100, 40, 100, 40],
};

export function triggerHaptic(pattern: HapticPattern = 'light'): void {
  if (typeof window === 'undefined') return;

  if ('vibrate' in navigator) {
    navigator.vibrate(hapticPatterns[pattern]);
  }
}

export function canVibrate(): boolean {
  return typeof window !== 'undefined' && 'vibrate' in navigator;
}
