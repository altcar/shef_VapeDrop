import { useEffect, useState } from "react";
import { fetchDeposits } from "@/lib/deposits";
import type { DepositRecord } from "@/lib/types";

export const useDeposits = (uid: string | null, max = 25) => {
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [loading, setLoading] = useState(Boolean(uid));

  useEffect(() => {
    if (!uid) {
      setDeposits([]);
      setLoading(false);
      return;
    }

    let alive = true;
    setLoading(true);

    void fetchDeposits(uid, max).then((records) => {
      if (!alive) return;
      setDeposits(records);
      setLoading(false);
    });

    return () => {
      alive = false;
    };
  }, [uid, max]);

  return { deposits, loading };
};
