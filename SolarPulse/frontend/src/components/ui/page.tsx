"use client";

import { useState } from "react";
import Link from "next/link";
import StatusCard from "@/components/StatusCard";
import OptimizationTips, { HourlySolarData } from "@/components/OptimizationTips";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from "recharts";

function generateInitialSolarData(): HourlySolarData[] {
  return Array.from({ length: 24 }).map((_, i) => ({
    hour: `${i}:00`,
    prediction: Math.max(0, Math.sin((i / 24) * Math.PI) * 600),
    actual: Math.max(0, Math.sin((i / 24) * Math.PI) * 550 + (i % 2 === 0 ? 15 : -15)),
    ghi: Math.max(0, Math.sin((i / 24) * Math.PI) * 900),
    dni: Math.max(0, Math.sin((i / 24) * Math.PI) * 800),
    temp: 24 + Math.sin((i / 24) * Math.PI) * 9,
  }));
}

export default function Home() {
  const [data] = useState<HourlySolarData[]>(generateInitialSolarData);
  const [showTable, setShowTable] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <main className="mx-auto w-full max-w-6xl px-4 py-6 space-y-5">
        {/* Header compacto */}
        <header className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-800/80">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">SolarPulse</h1>
            <p className="text-xs text-zinc-500">Dashboard de predicción y monitoreo</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/optimization"
              className="bg-zinc-900 hover:bg-zinc-800 px-3.5 py-2 rounded-lg text-sm border border-zinc-800 transition-colors"
            >
              💡 Optimización
            </Link>
            <Link
              href="/config"
              className="bg-zinc-900 hover:bg-zinc-800 px-3.5 py-2 rounded-lg text-sm border border-zinc-800 transition-colors"
            >
              ⚙️ Configuración
            </Link>
          </div>
        </header>

        {/* KPI densos */}
        <StatusCard />

        {/* Tips (solo aparecen si hay algo que mostrar) */}
        <OptimizationTips data={data} />

        {/* Gráfico principal - altura reducida */}
        <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-200">
              Generación Solar · Hoy
            </h2>
            <span className="text-[11px] text-zinc-500">
              Límite EcoFlow 500 W
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="hour"
                  stroke="#52525b"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#52525b"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #3f3f46",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                />
                <Area
                  type="monotone"
                  dataKey="prediction"
                  fill="#38bdf8"
                  stroke="#38bdf8"
                  fillOpacity={0.15}
                  name="Predicción"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#34d399"
                  strokeWidth={2.5}
                  name="Real"
                  dot={false}
                />
                <ReferenceLine
                  y={500}
                  stroke="#f43f5e"
                  strokeDasharray="4 4"
                  label={{
                    value: "500 W",
                    fill: "#f43f5e",
                    fontSize: 11,
                    position: "insideTopRight",
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabla colapsable más compacta */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          <button
            onClick={() => setShowTable(!showTable)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800/50 transition-colors"
          >
            <span>Datos horarios</span>
            <span className="text-zinc-500">{showTable ? "▲" : "▼"}</span>
          </button>

          {showTable && (
            <div className="overflow-x-auto border-t border-zinc-800">
              <table className="w-full text-xs text-zinc-400">
                <thead>
                  <tr className="bg-zinc-950/50">
                    <th className="px-3 py-2 text-left font-medium">Hora</th>
                    <th className="px-3 py-2 text-right font-medium">GHI</th>
                    <th className="px-3 py-2 text-right font-medium">DNI</th>
                    <th className="px-3 py-2 text-right font-medium">Temp</th>
                    <th className="px-3 py-2 text-right font-medium">Predicción</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((d, i) => (
                    <tr key={i} className="border-t border-zinc-800/60 hover:bg-zinc-800/30">
                      <td className="px-3 py-1.5">{d.hour}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums">{d.ghi.toFixed(0)}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums">{d.dni.toFixed(0)}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums">{d.temp.toFixed(1)}°</td>
                      <td className="px-3 py-1.5 text-right tabular-nums">{d.prediction.toFixed(0)} W</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}