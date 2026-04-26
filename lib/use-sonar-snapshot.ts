"use client";

import { useEffect, useState } from "react";
import { type SonarSnapshot } from "@/lib/sonar-static";

type SonarState = {
  snapshot: SonarSnapshot | null;
  loading: boolean;
  error: string | null;
};

async function fetchSnapshot(): Promise<SonarSnapshot> {
  const response = await fetch("/api/sonar", { cache: "no-store" });
  const snapshot = (await response.json()) as SonarSnapshot;

  if (!response.ok) {
    throw new Error("On-chain snapshot unavailable");
  }

  return snapshot;
}

export function useSonarSnapshot(): SonarState {
  const [state, setState] = useState<SonarState>({
    snapshot: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const refresh = async () => {
      try {
        const snapshot = await fetchSnapshot();
        if (mounted) setState({ snapshot, loading: false, error: null });
      } catch (error) {
        if (!mounted) return;
        setState({
          snapshot: null,
          loading: false,
          error: error instanceof Error ? error.message : "On-chain snapshot unavailable",
        });
      }
    };

    refresh();
    const interval = window.setInterval(refresh, 15_000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  return state;
}
