"use client";

import { useEffect, useState } from "react";
import { PLACEHOLDER_SNAPSHOT, type SonarSnapshot } from "@/lib/sonar-data";

type SonarState = {
  snapshot: SonarSnapshot | null;
  loading: boolean;
};

async function fetchSnapshot(): Promise<SonarSnapshot> {
  const response = await fetch("/api/sonar", { cache: "no-store" });
  const snapshot = (await response.json()) as SonarSnapshot;

  if (!response.ok || snapshot.source !== "onchain") {
    throw new Error(snapshot.error || "On-chain snapshot unavailable");
  }

  return snapshot;
}

export function useSonarSnapshot(): SonarState {
  const [state, setState] = useState<SonarState>({
    snapshot: null,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    const refresh = async () => {
      try {
        const snapshot = await fetchSnapshot();
        if (mounted) setState({ snapshot, loading: false });
      } catch (error) {
        if (!mounted) return;
        setState({
          snapshot: {
            ...PLACEHOLDER_SNAPSHOT,
            fetchedAt: Date.now(),
            error: error instanceof Error ? error.message : "On-chain snapshot unavailable",
          },
          loading: false,
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
