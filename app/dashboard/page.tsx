import { Suspense } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Skeleton } from "@/components/sonar-ui";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-7xl px-[1.1rem] pb-[4.8rem] pt-[7.4rem]">
          <Skeleton className="h-[38rem] rounded-[22px]" />
        </main>
      }
    >
      <DashboardShell />
    </Suspense>
  );
}
