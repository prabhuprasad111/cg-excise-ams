/** Simulated network / server latency (ms) */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const SIMULATED_DELAY_MS = 420;
