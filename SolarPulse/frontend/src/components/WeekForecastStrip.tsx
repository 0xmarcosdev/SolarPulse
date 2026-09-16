/**
 * WeekForecastStrip – Tira semanal de previsión solar (7 días).
 * Muestra fecha, día de la semana, calidad de sol (score), kWh pronosticados y pico en W.
 * Permite seleccionar el día activo para actualizar la gráfica detallada.
 */

"use client";

import { Sun, CloudSun, Cloud, Zap, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export interface WeekDayItem {
  date: string;          // "YYYY-MM-DD"
  weekday: string;       // "Lun", "Mar", etc.
  predicted_kwh: number;
  peak_watts: number;
  solar_score: number;   // 0 - 100
  sample_count: number;
}

interface WeekForecastStripProps {
  days: WeekDayItem[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  loading?: boolean;
}

function getSolarIcon(score: number) {
  if (score >= 70) return <Sun className="h-4 w-4 text-amber-400" />;
  if (score >= 40) return <CloudSun className="h-4 w-4 text-sky-400" />;
  return <Cloud className="h-4 w-4 text-zinc-400" />;
}

function getSolarQualityLabel(score: number) {
  if (score >= 80) return "Excelente";
  if (score >= 60) return "Bueno";
  if (score >= 35) return "Normal";
  return "Pobre";
}

export function WeekForecastStrip({
  days,
  selectedDate,
  onSelectDate,
  loading = false,
}: WeekForecastStripProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-28 bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!days || days.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Previsión Semanal de Intensidad Solar
          </h3>
        </div>
        <span className="text-[10px] text-zinc-500">Selecciona un día para ver detalle horaria</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {days.map((item, idx) => {
          const isSelected = item.date === selectedDate;
          const quality = getSolarQualityLabel(item.solar_score);

          return (
            <motion.button
              key={item.date}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => onSelectDate(item.date)}
              className={`flex flex-col justify-between p-3.5 rounded-2xl text-left transition-all relative overflow-hidden group ${
                isSelected
                  ? "bg-gradient-to-b from-amber-500/15 to-zinc-900 border-2 border-amber-500/50 shadow-lg shadow-amber-500/10"
                  : "bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-850"
              }`}
            >
              {/* Encabezado día */}
              <div className="flex items-center justify-between w-full mb-2">
                <div>
                  <span className={`text-xs font-black uppercase ${isSelected ? "text-amber-400" : "text-zinc-300"}`}>
                    {item.weekday}
                  </span>
                  <p className="text-[10px] text-zinc-500">{item.date.slice(5)}</p>
                </div>
                <div className="p-1.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  {getSolarIcon(item.solar_score)}
                </div>
              </div>

              {/* Energía principal en kWh */}
              <div className="space-y-0.5 my-1">
                <p className="text-xl font-black tabular-nums text-zinc-50 group-hover:scale-105 transition-transform origin-left">
                  {item.predicted_kwh.toFixed(2)}
                  <span className="text-[11px] font-bold text-zinc-400 ml-0.5">kWh</span>
                </p>
                <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                  <Zap className="h-3 w-3 text-amber-400" />
                  <span>Pico: {Math.round(item.peak_watts)}W</span>
                </div>
              </div>

              {/* Footer calidad */}
              <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px]">
                <span className="text-zinc-500">{quality}</span>
                <span className={`font-bold tabular-nums ${item.solar_score > 70 ? 'text-emerald-400' : 'text-zinc-400'}`}>
                  {item.solar_score}%
                </span>
              </div>

              {isSelected && (
                <div className="absolute top-0 right-0 w-8 h-8 bg-amber-500/20 rounded-bl-full pointer-events-none" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
