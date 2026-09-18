/**
 * PowerFlow – Diagrama de flujo de potencia con modo compacto/expandido Clean Pulse.
 */

"use client";

import { useState } from "react";
import { Sun, Battery, Home, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PowerFlowProps {
  solarW?: number;
  loadW?: number;
  batterySoc?: number;
}

export function PowerFlow({
  solarW = 0,
  loadW = 0,
  batterySoc = 0,
}: PowerFlowProps) {
  const [expanded, setExpanded] = useState(true);
  const batteryW = solarW - loadW;

  const solarIntensity = Math.min(1, solarW / 500);
  const loadIntensity = Math.min(1, loadW / 400);

  const batteryColor =
    batterySoc > 60
      ? "text-[var(--color-success)]"
      : batterySoc > 30
      ? "text-[var(--color-accent)]"
      : "text-[var(--color-danger)]";

  const batteryBg =
    batterySoc > 60
      ? "bg-[var(--color-success)]/10 border-[var(--color-success)]/25"
      : batterySoc > 30
      ? "bg-[var(--color-accent)]/10 border-[var(--color-accent)]/25"
      : "bg-[var(--color-danger)]/10 border-[var(--color-danger)]/25";

  const contextMessage = getContextMessage(solarW, loadW, batteryW, batterySoc);

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-card)]">
      {/* Header con toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-[family-name:var(--font-ui)] uppercase tracking-wider text-[var(--color-muted)] font-semibold">
          Flujo de Potencia En Vivo
        </h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[11px] font-[family-name:var(--font-ui)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
        >
          {expanded ? (
            <>
              Compactar <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              Expandir <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {expanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between gap-1 sm:gap-3">
              {/* Solar */}
              <div className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 shadow-[var(--shadow-glow-amber)]"
                  animate={{
                    scale: solarW > 10 ? [1, 1.04, 1] : 1,
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sun className="h-6 w-6 text-[var(--color-accent)]" />
                </motion.div>
                <span className="text-[11px] font-[family-name:var(--font-ui)] uppercase tracking-wider text-[var(--color-muted)]">Solar</span>
                <span className="text-base font-bold font-[family-name:var(--font-mono)] tabular-nums text-[var(--color-accent)]">
                  {Math.round(solarW)} W
                </span>
              </div>

              <FlowArrow active={solarW > 5} intensity={solarIntensity} colorClass="text-[var(--color-accent)]" />

              {/* Batería */}
              <div className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  className={`p-3.5 rounded-[var(--radius-md)] border ${batteryBg}`}
                  animate={{
                    scale: Math.abs(batteryW) > 10 ? [1, 1.04, 1] : 1,
                  }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Battery className={`h-6 w-6 ${batteryColor}`} />
                </motion.div>
                <span className="text-[11px] font-[family-name:var(--font-ui)] uppercase tracking-wider text-[var(--color-muted)]">
                  Batería · {Math.round(batterySoc)}%
                </span>
                <span className={`text-base font-bold font-[family-name:var(--font-mono)] tabular-nums ${batteryW >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
                  {batteryW > 0 ? "+" : ""}
                  {Math.round(batteryW)} W
                </span>
              </div>

              <FlowArrow active={loadW > 5} intensity={loadIntensity} colorClass="text-[var(--color-cyan)]" />

              {/* Carga */}
              <div className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-cyan)]/10 border border-[var(--color-cyan)]/30 shadow-[var(--shadow-glow-cyan)]"
                  animate={{
                    scale: loadW > 10 ? [1, 1.04, 1] : 1,
                  }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Home className="h-6 w-6 text-[var(--color-cyan)]" />
                </motion.div>
                <span className="text-[11px] font-[family-name:var(--font-ui)] uppercase tracking-wider text-[var(--color-muted)]">Carga AC</span>
                <span className="text-base font-bold font-[family-name:var(--font-mono)] tabular-nums text-[var(--color-cyan)]">
                  {Math.round(loadW)} W
                </span>
              </div>
            </div>

            <p className="mt-4 text-[11px] font-[family-name:var(--font-sans)] text-[var(--color-muted)] text-center bg-[var(--color-surface-2)] py-2 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border)]">
              {contextMessage}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="compact"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-3 text-xs font-[family-name:var(--font-mono)] tabular-nums text-[var(--color-foreground)] py-1"
          >
            <span className="text-[var(--color-accent)]">☀️ {Math.round(solarW)} W</span>
            <span className="text-[var(--color-muted)]">→</span>
            <span className={batteryW >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}>
              🔋 {batteryW > 0 ? "+" : ""}
              {Math.round(batteryW)} W
            </span>
            <span className="text-[var(--color-muted)]">→</span>
            <span className="text-[var(--color-cyan)]">🏠 {Math.round(loadW)} W</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FlowArrow({
  active,
  intensity = 0.5,
  colorClass = "text-[var(--color-accent)]",
}: {
  active: boolean;
  intensity?: number;
  colorClass?: string;
}) {
  return (
    <div className="relative flex items-center justify-center w-8 sm:w-12">
      <motion.div
        animate={
          active
            ? { x: [0, 4, 0], opacity: [0.4, 1, 0.4] }
            : { opacity: 0.25 }
        }
        transition={{
          duration: 1.4 / Math.max(0.3, intensity),
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <ArrowRight
          className={`h-4 w-4 ${active ? colorClass : "text-[var(--color-border)]"}`}
        />
      </motion.div>
    </div>
  );
}

function getContextMessage(
  solarW: number,
  loadW: number,
  batteryW: number,
  soc: number
): string {
  if (solarW < 20 && loadW < 20) {
    return "Sistema en reposo · poca actividad solar y de carga";
  }
  if (solarW >= 480) {
    return "⚠️ Cerca del límite de 500 W (clipping) · ideal para encender cargas AC";
  }
  if (batteryW > 50 && soc < 90) {
    return "Batería cargando con buen margen · energía solar aprovechada";
  }
  if (batteryW < -30) {
    return "Batería suministrando energía a la carga · consumo mayor que generación";
  }
  if (soc > 90 && solarW > 100) {
    return "Batería casi llena · considera usar el excedente en cargas pesadas";
  }
  return "Flujo en vivo estimado · sincronizado con EcoFlow Delta 3";
}
