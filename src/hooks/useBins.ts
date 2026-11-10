import { useEffect, useState } from "react";
import { loadBins, type BinSourceState } from "@/lib/bins";
import type { Bin } from "@/lib/types";

interface BinsState {
  bins: Bin[];
  source: BinSourceState;
  problem: string | null;
  loading: boolean;
}

/** Loads bins once per app session (module cache lives inside Firestore). */
export const useBins = (): BinsState & { reload: () => void } => {
  const [state, setState] = useState<BinsState>({
    bins: [],
    source: "seed",
    problem: null,
    loading: true,
  });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let alive = true;
    setState((current) => ({ ...current, loading: true }));

    void loadBins().then((result) => {
      if (!alive) return;
      setState({ ...result, loading: false });
    });

    return () => {
      alive = false;
    };
  }, [nonce]);

  return { ...state, reload: () => setNonce((value) => value + 1) };
};
