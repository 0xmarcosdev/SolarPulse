/**
 * AlertsPanel – Muestra alertas contextuales del sistema solar.
 *
 * Tipos de alerta:
 * - clipping: entrada cercana o por encima de 500 W
 * - low_battery: SoC bajo
 * - high_temp: (preparado para cuando tengamos temperatura de panel)
 * - no_data: sin lecturas recientes
 * - info: mensajes informativos
 */

"use client";

import { AlertTriangle, BatteryLow, Zap, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type AlertType = "clipping" | "low_battery" | "info" | "warning";

export interface AlertItem {
  id: string;
  type: AlertType;
  title: string;
  message: string;
}

interface AlertsPanelProps {
  alerts: AlertItem[];
  onDismiss?: (id: string) => void;
}

const STYLES: Record<
  AlertType,
  { border: string; bg: string; icon: string; Icon: typeof Zap }
> = {
  clipping: {
    border: "border-amber-500/40",
    bg: "bg-amber-950/40",
    icon: "text-amber-400",
    Icon: Zap,
  },
  low_battery: {
    border: "border-rose-500/40",
    bg: "bg-rose-950/40",
    icon: "text-rose-400",
    Icon: BatteryLow,
  },
  warning: {
    border: "border-orange-500/40",
    bg: "bg-orange-950/40",
    icon: "text-orange-400",
    Icon: AlertTriangle,
  },
  info: {
    border: "border-sky-500/40",
    bg: "bg-sky-950/40",
    icon: "text-sky-400",
    Icon: Info,
  },
};

export function AlertsPanel({ alerts, onDismiss }: AlertsPanelProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {alerts.map((alert) => {
          const style = STYLES[alert.type];
          const Icon = style.Icon;

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`flex items-start gap-3 p-3 rounded-xl border ${style.border} ${style.bg}`}
            >
              <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${style.icon}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-100">{alert.title}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{alert.message}</p>
              </div>
              {onDismiss && (
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}