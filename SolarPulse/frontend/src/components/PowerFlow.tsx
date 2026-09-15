/**
 * PowerFlow – Diagrama de flujo de potencia con modo compacto/expandido.
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
      ? "text-emerald-400"
      : batterySoc > 30
      ? "text-amber-400"
      : "text-rose-400";

  const batteryBg =
    batterySoc > 60
      ? "bg-emerald-500/10 border-emerald-500/20"
      : batterySoc > 30
      ? "bg-amber-500/10 border-amber-500/20"
      : "bg-rose-500/10 border-rose-500/20";

  // Mensaje contextual que cambia solo
  const contextMessage = getContextMessage(solarW, loadW, batteryW, batterySoc);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      {/* Header con toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-200">Flujo de Potencia</h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
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
                  className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25"
                  animate={{
                    scale: solarW > 10 ? [1, 1.04, 1] : 1,
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sun className="h-6 w-6 text-amber-400" />
                </motion.div>
                <span className="text-xs text-zinc-400">Solar</span>
                <span className="text-base font-bold tabular-nums text-zinc-50">
                  {Math.round(solarW)} W
                </span>
              </div>

              <FlowArrow active={solarW > 5} intensity={solarIntensity} />

              {/* Batería */}
              <div className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  className={`p-3 rounded-2xl border ${batteryBg}`}
                  animate={{
                    scale: Math.abs(batteryW) > 10 ? [1, 1.04, 1] : 1,
                  }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Battery className={`h-6 w-6 ${batteryColor}`} />
                </motion.div>
                <span className="text-xs text-zinc-400">
                  Batería · {Math.round(batterySoc)}%
                </span>
                <span className="text-base font-bold tabular-nums text-zinc-50">
                  {batteryW > 0 ? "+" : ""}
                  {Math.round(batteryW)} W
                </span>
              </div>

              <FlowArrow active={loadW > 5} intensity={loadIntensity} />

              {/* Carga */}
              <div className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/25"
                  animate={{
                    scale: loadW > 10 ? [1, 1.04, 1] : 1,
                  }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Home className="h-6 w-6 text-sky-400" />
                </motion.div>
                <span className="text-xs text-zinc-400">Carga</span>
                <span className="text-base font-bold tabular-nums text-zinc-50">
                  {Math.round(loadW)} W
                </span>
              </div>
            </div>

            <p className="mt-4 text-[11px] text-zinc-500 text-center">
              {contextMessage}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="compact"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-3 text-sm tabular-nums text-zinc-300 py-1"
          >
            <span>☀️ {Math.round(solarW)} W</span>
            <span className="text-zinc-600">→</span>
            <span>
              🔋 {batteryW > 0 ? "+" : ""}
              {Math.round(batteryW)} W
            </span>
            <span className="text-zinc-600">→</span>
            <span>🏠 {Math.round(loadW)} W</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FlowArrow({
  active,
  intensity = 0.5,
}: {
  active: boolean;
  intensity?: number;
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
          className={`h-4 w-4 ${active ? "text-amber-400/90" : "text-zinc-600"}`}
        />
      </motion.div>
    </div>
  );
}

/** Mensajes contextuales inteligentes según el estado del sistema */
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
    return "⚠️ Cerca del límite de 500 W · ideal para encender cargas AC";
  }
  if (batteryW > 50 && soc < 90) {
    return "Batería cargando con buen margen · energía solar aprovechada";
  }
  if (batteryW < -30) {
    return "Batería suministrando energía a la carga · consumo mayor que generación";
  }
  if (soc > 90 && solarW > 100) {
    return "Batería casi llena · considera usar el excedente en cargas";
  }
  return "Flujo estimado · se refinará con datos MQTT de EcoFlow";
}