"use client";

import { useMemo, useState, useCallback, memo } from "react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
  ReferenceArea,
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
  className?: string;
}

function DayForecastChartComponent({ date, slots, loading = false, className = "" }: DayForecastChartProps) {
  const [selection, setSelection] = useState<{
    left: string | null;
    right: string | null;
  }>({ left: null, right: null });

  const chartData = useMemo(() => slots, [slots]);

  const handleBrushChange = useCallback((range: any) => {
    if (!range || range.startIndex === undefined) {
      setSelection({ left: null, right: null });
      return;
    }
    const left = chartData[range.startIndex]?.hour_label ?? null;
    const right = chartData[range.endIndex]?.hour_label ?? null;
    setSelection({ left, right });
  }, [chartData]);

  const rangeStats = useMemo(() => {
    if (!selection.left || !selection.right) return null;

    const startIdx = chartData.findIndex((d) => d.hour_label === selection.left);
    const endIdx = chartData.findIndex((d) => d.hour_label === selection.right);
    if (startIdx === -1 || endIdx === -1) return null;

    const slice = chartData.slice(startIdx, endIdx + 1);
    const totalPredWh = slice.reduce((sum, d) => sum + d.predicted_wh, 0);
    const totalActualWh = slice.reduce((sum, d) => sum + (d.actual_wh ?? 0), 0);

    return {
      hours: slice.length,
      predictedKwh: (totalPredWh / 1000).toFixed(2),
      actualKwh: (totalActualWh / 1000).toFixed(2),
    };
  }, [selection, chartData]);

  const totalPredictedKwh = (chartData.reduce((sum, s) => sum + s.predicted_wh, 0) / 1000).toFixed(2);
  const peakWatts = Math.max(0, ...chartData.map((s) => s.predicted_watts));

  if (loading) {
    return (
      <div className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 h-80 flex flex-col justify-center items-center shadow-[var(--shadow-card)] ${className}`}>
        <div className="h-6 w-48 mb-6 bg-[var(--color-surface-2)] animate-pulse rounded" />
        <div className="h-56 w-full rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-5 shadow-[var(--shadow-card)] space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-border)] pb-4">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-wide text-[var(--color-foreground)]">
            Curva de Generación · {date}
          </h2>
          <p className="text-xs font-[family-name:var(--font-sans)] text-[var(--color-muted)]">
            Potencia instantánea (W) y Brush interactivo de rango horario
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[var(--color-surface-2)] px-4 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)]">
          <div>
            <span className="text-[10px] font-[family-name:var(--font-ui)] uppercase tracking-wider text-[var(--color-muted)] block">Total Pronosticado</span>
            <span className="text-sm font-bold font-[family-name:var(--font-mono)] text-[var(--color-cyan)] tabular-nums">{rangeStats ? rangeStats.predictedKwh : totalPredictedKwh} kWh</span>
          </div>
          <div className="h-6 w-[1px] bg-[var(--color-border)]" />
          <div>
            <span className="text-[10px] font-[family-name:var(--font-ui)] uppercase tracking-wider text-[var(--color-muted)] block">Pico Máximo</span>
            <span className="text-sm font-bold font-[family-name:var(--font-mono)] text-[var(--color-accent)] tabular-nums">{Math.round(peakWatts)} W</span>
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPredictedClean" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              vertical={false}
              opacity={0.5}
            />

            <XAxis
              dataKey="hour_label"
              tick={{ fill: "var(--color-muted)", fontSize: 11, fontFamily: "Kode Mono" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--color-muted)", fontSize: 11, fontFamily: "Kode Mono" }}
              axisLine={false}
              tickLine={false}
              unit=" W"
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-surface-2)",
                border: "1px solid rgba(251,191,36,0.35)",
                borderRadius: "var(--radius-md)",
                fontFamily: "Kode Mono",
                fontSize: "12px",
                color: "var(--color-foreground)"
              }}
              formatter={(value: any, name: any) => {
                if (name === "Predicción AC") return [`${Math.round(Number(value))} W`, name];
                if (name === "EcoFlow Real") return [`${value !== null ? Math.round(Number(value)) : '—'} W`, name];
                return [value, name];
              }}
              labelStyle={{ color: "var(--color-accent)", fontWeight: "bold" }}
              itemStyle={{ color: "var(--color-foreground)" }}
            />

            <ReferenceLine
              y={500}
              stroke="var(--color-danger)"
              strokeDasharray="4 4"
              label={{
                value: "Límite 500W",
                fill: "var(--color-danger)",
                fontSize: 10,
                position: "insideTopRight",
              }}
            />

            {/* Área de predicción */}
            <Area
              type="monotone"
              dataKey="predicted_watts"
              stroke="var(--color-accent)"
              strokeWidth={2.5}
              fill="url(#colorPredictedClean)"
              animationDuration={1200}
              animationEasing="ease-out"
              name="Predicción AC"
            />

            {/* Línea de real */}
            <Line
              type="monotone"
              dataKey="actual_watts"
              stroke="var(--color-cyan)"
              strokeWidth={1.8}
              strokeDasharray="5 4"
              dot={false}
              activeDot={{ r: 5, fill: "var(--color-cyan)", stroke: "var(--color-background)", strokeWidth: 2 }}
              animationDuration={1400}
              name="EcoFlow Real"
              connectNulls={false}
            />

            {/* Brush interactivo */}
            <Brush
              dataKey="hour_label"
              height={26}
              stroke="var(--color-cyan)"
              fill="var(--color-surface-2)"
              travellerWidth={8}
              onChange={handleBrushChange}
            />

            {selection.left && selection.right && (
              <ReferenceArea
                x1={selection.left}
                x2={selection.right}
                strokeOpacity={0.3}
                fill="var(--color-cyan)"
                fillOpacity={0.08}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--color-muted)] font-[family-name:var(--font-ui)] pt-2 border-t border-[var(--color-border)]">
        <span>Arrastra el brush inferior para acotar el análisis horario</span>
        {rangeStats && (
          <span className="text-[var(--color-cyan)] font-[family-name:var(--font-mono)] font-bold">
            Selección: {rangeStats.predictedKwh} kWh
          </span>
        )}
      </div>
    </div>
  );
}

export const DayForecastChart = memo(DayForecastChartComponent);
