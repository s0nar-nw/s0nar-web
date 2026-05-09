"use client";

import { useEffect, useSyncExternalStore } from "react";
import { type SonarSnapshot } from "@/lib/sonar-static";

type SonarState = {
  snapshot: SonarSnapshot | null;
  loading: boolean;
  error: string | null;
};

const REFRESH_MS = 3_000;

let state: SonarState = {
  snapshot: null,
  loading: true,
  error: null,
};
let inFlight: Promise<void> | null = null;
let interval: number | null = null;
const listeners = new Set<() => void>();

function emit(next: SonarState) {
  state = next;
  listeners.forEach((listener) => listener());
}

async function fetchSnapshot(): Promise<SonarSnapshot> {
  const response = await fetch("/api/sonar", { cache: "no-store" });
  const snapshot = (await response.json()) as SonarSnapshot;

  if (!response.ok) {
    throw new Error("On-chain snapshot unavailable");
  }

  return snapshot;
}

function refreshSnapshot() {
  if (inFlight || (typeof document !== "undefined" && document.hidden))
    return inFlight;

  emit({ ...state, loading: true });

  inFlight = fetchSnapshot()
    .then((snapshot) => emit({ snapshot, loading: false, error: null }))
    .catch((error) => {
      emit({
        snapshot: state.snapshot,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "On-chain snapshot unavailable",
      });
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  refreshSnapshot();

  if (interval === null) {
    interval = window.setInterval(refreshSnapshot, REFRESH_MS);
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && interval !== null) {
      window.clearInterval(interval);
      interval = null;
    }
  };
}

function getSnapshot() {
  return state;
}

export function useSonarSnapshot(): SonarState {
  const snapshotState = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );

  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden) refreshSnapshot();
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  return snapshotState;
}
