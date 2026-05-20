import { useCallback, useState } from "react";
import { SIMULATED_DELAY_MS, delay } from "../utils/delay";

export function useSimulatedAction() {
  const [loading, setLoading] = useState(false);
  const run = useCallback(async <T,>(fn: () => Promise<T> | T): Promise<T> => {
    setLoading(true);
    try {
      await delay(SIMULATED_DELAY_MS);
      return await fn();
    } finally {
      setLoading(false);
    }
  }, []);
  return { loading, run };
}
