/**
 * DayForecastChart – Gráfica detallada de 24h para el día seleccionado.
 * Muestra potencia predicha (W), potencia real (W), energía por slot (Wh),
 * línea de referencia de clipping (500W) y marcador "AHORA" si corresponde a hoy.
 */

"use client";

import { DayForecastSlotItem } from "@/components/WeekForecastStrip"; // o definir interfaz local
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Sun, Zap, Clock } from "lucide-react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export interface DaySlotData {
  time: string;
  hour_label: string;
  predicted_watts: number;
  predicted_wh: number;
  actual_watts: number | null;
  actual_wh: number | null;
  poa_global: number | null;
}

interface DayForecastChartProps {
  date: string;
  slots: DaySlotData[];
  loading?: boolean;
}

export function DayForecastChart({ date, slots, loading = false }: DayForecastChartProps) {
  const isToday = date === new Date().toISOString().slice(0, 10);
  const totalPredictedWh = slots.reduce((sum, s) => sum + s.predicted_watts, 0); // aproximación horaria media
  const totalPredictedKwh = (slots.reduce((sum, s) => sum + s.predicted_wh, 0) / 1000).toFixed(2);
  const peakWatts = Math.max(0, ...slots.map((s) => s.predicted_watts));

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 h-80 flex flex-col justify-center items-center">
        <Skeleton className="h-6 w-48 mb-6" />
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
      {/* Cabecera de la gráfica */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-zinc-100">Curva de Generación · {date}</h3>
            {isToday && (
              <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-[10px] rounded-full">
                HOY (En vivo)
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Potencia instantánea (W) y energía acumulada del intervalo (Wh)
          </p>
        </div>

        <div className="flex items-center gap-4 bg-zinc-950 px-4 py-2 rounded-2xl border border-zinc-800">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Total Pronosticado</span>
            <span className="text-sm font-black text-sky-400 tabular-nums">{totalPredictedKwh} kWh</span>
          </div>
          <div className="h-6 w-[1px] bg-zinc-800" />
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Pico Máximo</span>
            <span className="text-sm font-black text-amber-400 tabular-nums">{Math.round(peakWatts)} W</span>
          </div>
        </div>
      </div>

      {/* Gráfica Recharts */}
      {slots.length === 0 ? (
        <EmptyState
          icon={Sun}
          title="Sin datos para este día"
          description="No hay pronóstico horarias persistido para esta fecha."
        />
      ) : (
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={slots} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="hour_label"
                stroke="#52525b"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#52525b"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                unit=" W"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "12px",
                  fontSize: "11px",
                }}
                formatter={(value: any, name: any) => {
                  if (name === "Predicción AC (W)") return [`${Math.round(Number(value))} W`, name];
                  if (name === "Energía slot (Wh)") return [`${Number(value).toFixed(1)} Wh`, name];
                  if (name === "EcoFlow Real (W)") return [`${value !== null ? Math.round(Number(value)) : '—'} W`, name];
                  return [value, name];
                }}
                labelStyle={{ color: "#d4d4d8", fontWeight: "bold", marginBottom: "4px" }}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              
              <ReferenceLine
                y={500}
                stroke="#f43f5e"
                strokeDasharray="4 4"
                label={{
                  value: "Límite EcoFlow 500 W",
                  fill: "#f43f5e",
                  fontSize: 10,
                  position: "insideTopRight",
                }}
              />

              <Area
                type="monotone"
                dataKey="predicted_watts"
                fill="#38bdf8"
                stroke="#38bdf8"
                fillOpacity={0.15}
                name="Predicción AC (W)"
                strokeWidth={2}
              />

              <Bar
                dataKey="predicted_wh"
                fill="#38bdf8"
                fillOpacity={0.3}
                name="Energía slot (Wh)"
                yAxisId={0}
                barSize={6}
                radius={[2, 2, 0, 0]}
              />

              <Line
                type="monotone"
                dataKey="actual_watts"
                stroke="#34d399"
                strokeWidth={2.5}
                name="EcoFlow Real (W)"
                dot={false}
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Nota de pie explicativa de unidades */}
      <div className="flex items-center gap-3 pt-2 text-[11px] text-zinc-500 border-t border-zinc-800/60">
        <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
        <p>
          <b>W</b> = Potencia instantánea (límite inversor 500 W). &nbsp;•&nbsp; 
          <b>Wh</b> = Energía estimada acumulada en el intervalo de 1 hora. &nbsp;•&nbsp; 
          <b>kWh</b> = Suma diaria total.
        </p>
      </div>
    </div>
  );
}
