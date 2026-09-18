/**
 * AprovechamientoWindowCard – Calcula la mejor franja horaria del día para cargas pesadas
 * basado en la curva de potencia predicha (W) y los kWh esperados.
 */

"use client";

import { Zap, Clock, Sun, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface DaySlot {
  hour_label: string;
  predicted_watts: number;
}

interface AprovechamientoWindowProps {
  slots: DaySlot[];
}

export function AprovechamientoWindowCard({ slots }: AprovechamientoWindowProps) {
  if (!slots || slots.length === 0) return null;

  // Encontrar la mejor franja continua de 3 horas con mayor potencia media
  let bestStartHour = 11;
  let maxAvgPower = 0;

  for (let i = 0; i <= slots.length - 3; i++) {
    const windowSlots = slots.slice(i, i + 3);
    const avg = windowSlots.reduce((sum, s) => sum + s.predicted_watts, 0) / 3;
    if (avg > maxAvgPower) {
      maxAvgPower = avg;
      const parsedHour = parseInt(windowSlots[0].hour_label.split(":")[0], 10);
      bestStartHour = isNaN(parsedHour) ? 11 : parsedHour;
    }
  }

  const endHour = Math.min(23, bestStartHour + 3);
  const startStr = `${String(bestStartHour).padStart(2, '0')}:00`;
  const endStr = `${String(endHour).padStart(2, '0')}:00`;

  // Estimar Wh en esa franja de 3 horas
  const windowEnergyWh = Math.round(maxAvgPower * 3);
  const windowEnergyKwh = (windowEnergyWh / 1000).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-amber-500/10 via-zinc-900 to-emerald-500/10 border border-amber-500/20 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-2xl text-amber-400">
          <Sun className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-black text-zinc-100">Franja Óptima para Cargas Pesadas</h4>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Recomendación IA
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Aprovecha el pico de generación solar sin clipping excesivo para conectar lavadora, bomba o aire acondicionado.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-zinc-950/80 px-5 py-3 rounded-2xl border border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-black text-zinc-100">{startStr} – {endStr}</span>
        </div>
        <div className="h-6 w-[1px] bg-zinc-800" />
        <div className="text-right">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Energía Franja</span>
          <span className="text-sm font-black text-emerald-400 tabular-nums">~{windowEnergyKwh} kWh</span>
        </div>
      </div>
    </motion.div>
  );
}
