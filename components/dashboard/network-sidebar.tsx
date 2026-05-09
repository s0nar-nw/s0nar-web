import {
  KeyValueList,
  Panel,
  SectionTitle,
  StatusPill,
} from "@/components/sonar-ui";

interface NetworkSidebarProps {
  activeRegions: number;
  totalRegions: number;
  observerCap: number;
  minStakeSol: number;
  paused: boolean;
}

export function NetworkSidebar({
  activeRegions,
  totalRegions,
  observerCap,
  minStakeSol,
  paused,
}: NetworkSidebarProps) {
  const registryState = [
    {
      label: "Status",
      value: paused ? (
        <StatusPill>Paused</StatusPill>
      ) : (
        <StatusPill active>Active</StatusPill>
      ),
    },
    { label: "Regions", value: `${activeRegions} / ${totalRegions}` },
    { label: "Observer cap", value: observerCap.toLocaleString() },
    { label: "Min stake", value: `${minStakeSol} SOL` },
  ];

  return (
    <>
      {/* Registry state */}
      <Panel className="h-full min-h-0">
        <SectionTitle>Registry state</SectionTitle>
        <KeyValueList items={registryState} />
      </Panel>
    </>
  );
}
