/**
 * DayForecastChart – Gráfica detallada de 24h para el día seleccionado.
 * Muestra potencia predicha (W), potencia real (W), energía por slot (Wh),
 * línea de referencia de clipping (500W) y marcador "AHORA" si corresponde a hoy.
 */

"use client";

// import eliminado para evitar conflicto de nombre local
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Sun, Zap, Clock } from "lucide-react";
import {
  ComposedChart,
  Area,
  Line,
  Bar,
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
  const totalPredictedKwh = (slots.reduce((sum, s) => sum + s.predicted_wh, 0) / 1000).toFixed(2);
  const peakWatts = Math.max(0, ...slots.map((s) => s.predicted_watts));

  if (loading) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 h-80 flex flex-col justify-center items-center shadow-[var(--shadow-card)]">
        <Skeleton className="h-6 w-48 mb-6 bg-[var(--color-surface-2)]" />
        <Skeleton className="h-56 w-full rounded-[var(--radius-lg)] bg-[var(--color-surface-2)]" />
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-card)] space-y-4">
      {/* Cabecera de la gráfica */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold font-[family-name:var(--font-ui)] text-[var(--color-foreground)]">Curva de Generación · {date}</h3>
            {isToday && (
              <span className="px-2.5 py-0.5 bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/30 text-[var(--color-accent)] font-bold text-[10px] rounded-[var(--radius-full)] font-[family-name:var(--font-ui)]">
                HOY (En vivo)
              </span>
            )}
          </div>
          <p className="text-xs font-[family-name:var(--font-sans)] text-[var(--color-muted)] mt-0.5">
            Potencia instantánea (W) y energía acumulada del intervalo (Wh)
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[var(--color-surface-2)] px-4 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)]">
          <div>
            <span className="text-[10px] font-[family-name:var(--font-ui)] uppercase tracking-wider text-[var(--color-muted)] block">Total Pronosticado</span>
            <span className="text-sm font-bold font-[family-name:var(--font-mono)] text-[var(--color-cyan)] tabular-nums">{totalPredictedKwh} kWh</span>
          </div>
          <div className="h-6 w-[1px] bg-[var(--color-border)]" />
          <div>
            <span className="text-[10px] font-[family-name:var(--font-ui)] uppercase tracking-wider text-[var(--color-muted)] block">Pico Máximo</span>
            <span className="text-sm font-bold font-[family-name:var(--font-mono)] text-[var(--color-accent)] tabular-nums">{Math.round(peakWatts)} W</span>
          </div>
        </div>
      </div>

      {/* Gráfica Recharts Clean Pulse */}
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
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="hour_label"
                stroke="var(--color-muted)"
                tick={{ fontSize: 10, fontFamily: 'var(--font-mono)' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--color-muted)"
                tick={{ fontSize: 10, fontFamily: 'var(--font-mono)' }}
                tickLine={false}
                axisLine={false}
                unit=" W"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "11px",
                  fontFamily: "var(--font-sans)",
                }}
                formatter={(value: any, name: any) => {
                  if (name === "Predicción AC (W)") return [`${Math.round(Number(value))} W`, name];
                  if (name === "Energía slot (Wh)") return [`${Number(value).toFixed(1)} Wh`, name];
                  if (name === "EcoFlow Real (W)") return [`${value !== null ? Math.round(Number(value)) : '—'} W`, name];
                  return [value, name];
                }}
                labelStyle={{ color: "var(--color-foreground)", fontWeight: "bold", marginBottom: "4px" }}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px", fontFamily: "var(--font-ui)" }} />
              
              <ReferenceLine
                y={500}
                stroke="var(--color-danger)"
                strokeDasharray="4 4"
                label={{
                  value: "Límite EcoFlow 500 W",
                  fill: "var(--color-danger)",
                  fontSize: 10,
                  position: "insideTopRight",
                }}
              />

              <Area
                type="monotone"
                dataKey="predicted_watts"
                fill="var(--color-cyan)"
                stroke="var(--color-cyan)"
                fillOpacity={0.18}
                name="Predicción AC (W)"
                strokeWidth={2.5}
              />

              <Bar
                dataKey="predicted_wh"
                fill="var(--color-accent)"
                fillOpacity={0.4}
                name="Energía slot (Wh)"
                yAxisId={0}
                barSize={6}
                radius={[2, 2, 0, 0]}
              />

              <Line
                type="monotone"
                dataKey="actual_watts"
                stroke="var(--color-success)"
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
      <div className="flex items-center gap-3 pt-2 text-[11px] font-[family-name:var(--font-sans)] text-[var(--color-muted)] border-t border-[var(--color-border)]">
        <Clock className="h-3.5 w-3.5 text-[var(--color-accent)] shrink-0" />
        <p>
          <b className="text-[var(--color-foreground)] font-[family-name:var(--font-mono)]">W</b> = Potencia instantánea (límite inversor 500 W). &nbsp;•&nbsp; 
          <b className="text-[var(--color-foreground)] font-[family-name:var(--font-mono)]">Wh</b> = Energía estimada acumulada en el intervalo. &nbsp;•&nbsp; 
          <b className="text-[var(--color-foreground)] font-[family-name:var(--font-mono)]">kWh</b> = Suma diaria total.
        </p>
      </div>
    </div>
  );
}
