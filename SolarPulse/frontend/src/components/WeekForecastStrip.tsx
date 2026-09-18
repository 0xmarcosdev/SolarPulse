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
          <div key={i} className="h-28 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] animate-pulse" />
        ))}
      </div>
    );
  }

  if (!days || days.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[var(--color-accent)]" />
          <h3 className="text-xs font-[family-name:var(--font-ui)] uppercase tracking-wider text-[var(--color-muted)] font-semibold">
            Previsión Semanal de Intensidad Solar
          </h3>
        </div>
        <span className="text-[10px] font-[family-name:var(--font-sans)] text-[var(--color-muted)]">Selecciona un día para ver detalle horario</span>
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
              className={`flex flex-col justify-between p-3.5 rounded-[var(--radius-lg)] text-left transition-all relative overflow-hidden group shadow-[var(--shadow-card)] ${
                isSelected
                  ? "bg-gradient-to-b from-[var(--color-accent)]/15 to-[var(--color-surface)] border-2 border-[var(--color-accent)] shadow-[var(--shadow-glow-amber)]"
                  : "bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-muted)] hover:bg-[var(--color-surface-2)]"
              }`}
            >
              {/* Encabezado día */}
              <div className="flex items-center justify-between w-full mb-2">
                <div>
                  <span className={`text-xs font-[family-name:var(--font-ui)] uppercase tracking-wider font-bold ${isSelected ? "text-[var(--color-accent)]" : "text-[var(--color-foreground)]"}`}>
                    {item.weekday}
                  </span>
                  <p className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--color-muted)]">{item.date.slice(5)}</p>
                </div>
                <div className="p-1.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                  {getSolarIcon(item.solar_score)}
                </div>
              </div>

              {/* Energía principal en kWh */}
              <div className="space-y-0.5 my-1">
                <p className="text-xl font-bold font-[family-name:var(--font-mono)] text-[var(--color-foreground)] tabular-nums group-hover:scale-105 transition-transform origin-left">
                  {item.predicted_kwh.toFixed(2)}
                  <span className="text-[11px] font-normal text-[var(--color-muted)] ml-0.5 font-[family-name:var(--font-sans)]">kWh</span>
                </p>
                <div className="flex items-center gap-1 text-[10px] font-[family-name:var(--font-mono)] text-[var(--color-accent)]">
                  <Zap className="h-3 w-3" />
                  <span>Pico: {Math.round(item.peak_watts)}W</span>
                </div>
              </div>

              {/* Footer calidad */}
              <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-[10px] font-[family-name:var(--font-ui)]">
                <span className="text-[var(--color-muted)]">{quality}</span>
                <span className={`font-bold tabular-nums ${item.solar_score > 70 ? 'text-[var(--color-success)]' : 'text-[var(--color-muted)]'}`}>
                  {item.solar_score}%
                </span>
              </div>

              {isSelected && (
                <div className="absolute top-0 right-0 w-8 h-8 bg-[var(--color-accent)]/20 rounded-bl-full pointer-events-none" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
