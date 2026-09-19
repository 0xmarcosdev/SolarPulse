"use client";

import { memo } from "react";
import { Sun, Battery, Home } from "lucide-react";

interface PowerFlowProps {
  solarWatts: number;
  batterySoc: number;
  homeWatts: number;
  className?: string;
}

function PowerFlowComponent({
  solarWatts,
  batterySoc,
  homeWatts,
  className = "",
}: PowerFlowProps) {
  return (
    <div
      className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-center shadow-[var(--shadow-card)] ${className}`}
    >
      <h3 className="font-[family-name:var(--font-ui)] text-xs uppercase tracking-wider text-[var(--color-muted)] mb-4 font-semibold">
        Flujo de Potencia En Vivo
      </h3>

      <div className="flex items-center justify-between gap-2">
        {/* Nodo Paneles */}
        <FlowNode
          icon={<Sun className="w-5 h-5 text-[var(--color-accent)]" />}
          label="Paneles"
          value={`${Math.round(solarWatts)} W`}
          valueColor="text-[var(--color-accent)]"
          borderColor="border-[var(--color-accent)]/50"
          glow="shadow-[var(--shadow-glow-amber)]"
        />

        {/* Línea de corriente (ámbar) */}
        <FlowLine color="amber" />

        {/* Nodo Batería */}
        <FlowNode
          icon={<Battery className="w-5 h-5 text-[var(--color-success)]" />}
          label="EcoFlow"
          value={`${Math.round(batterySoc)}%`}
          valueColor="text-[var(--color-success)]"
          borderColor="border-[var(--color-success)]/50"
          glow="shadow-[var(--shadow-glow-success)]"
        />

        {/* Línea de corriente (cian) */}
        <FlowLine color="cyan" />

        {/* Nodo Casa */}
        <FlowNode
          icon={<Home className="w-5 h-5 text-[var(--color-cyan)]" />}
          label="Casa"
          value={`${Math.round(homeWatts)} W`}
          valueColor="text-[var(--color-cyan)]"
          borderColor="border-[var(--color-cyan)]/45"
          glow="shadow-[var(--shadow-glow-cyan)]"
        />
      </div>
    </div>
  );
}

interface FlowNodeProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor: string;
  borderColor: string;
  glow: string;
}

const FlowNode = memo(function FlowNode({
  icon,
  label,
  value,
  valueColor,
  borderColor,
  glow,
}: FlowNodeProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 min-w-[70px] z-10">
      <div
        className={`w-12 h-12 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] border ${borderColor} ${glow} flex items-center justify-center text-current transition-all duration-280`}
      >
        {icon}
      </div>
      <span className="font-[family-name:var(--font-ui)] text-[11px] text-[var(--color-muted)] uppercase tracking-wider">{label}</span>
      <span className={`font-[family-name:var(--font-mono)] text-sm font-semibold ${valueColor} tabular-nums`}>
        {value}
      </span>
    </div>
  );
});

interface FlowLineProps {
  color: "amber" | "cyan";
}

const FlowLine = memo(function FlowLine({ color }: FlowLineProps) {
  const gradient =
    color === "amber"
      ? "from-transparent via-[var(--color-accent)] to-transparent"
      : "from-transparent via-[var(--color-cyan)] to-transparent";

  return (
    <div className="flex-1 h-[3px] bg-[var(--color-border)] relative rounded-full overflow-hidden">
      {/* Partícula animada – solo CSS, muy ligera */}
      <div
        className={`absolute top-0 left-0 h-full w-[40%] rounded-full bg-gradient-to-r ${gradient} animate-current-flow`}
        style={{
          willChange: "transform",
        }}
      />
    </div>
  );
});

export const PowerFlow = memo(PowerFlowComponent);
