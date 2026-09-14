"use client";
import { useState } from "react";
import Link from "next/link";
import StatusCard from "@/components/StatusCard";
import OptimizationTips, { HourlySolarData } from "@/components/OptimizationTips";
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";

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
    <div className="flex min-h-screen flex-col items-center bg-zinc-950 px-4 py-8 text-white">
      <main className="flex w-full max-w-5xl flex-col gap-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">SolarPulse Dashboard</h1>
          <div className="flex gap-2">
            <Link href="/optimization" className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm border border-zinc-700 transition-colors">
              💡 Optimización
            </Link>
            <Link href="/config" className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm border border-zinc-700 transition-colors">
              ⚙️ Configuración
            </Link>
          </div>
        </header>

        <StatusCard />
        <OptimizationTips data={data} />

        <div className="bg-zinc-900 p-6 rounded-xl shadow-lg h-96 border border-zinc-800">
          <h2 className="text-xl font-semibold mb-4">Generación Solar</h2>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="hour" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid #444" }} />
              <Area type="monotone" dataKey="prediction" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.2} name="Predicción" />
              <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Real" dot={false} />
              <ReferenceLine y={500} label={{ value: "Límite EcoFlow (500W)", fill: "#ef4444", fontSize: 12 }} stroke="#ef4444" strokeDasharray="3 3" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <button onClick={() => setShowTable(!showTable)} className="text-lg font-semibold text-blue-400">
            {showTable ? "▲ Ocultar" : "▼ Ver Tabla de Datos"}
          </button>
          {showTable && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm text-zinc-400">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="p-2">Hora</th>
                    <th className="p-2">GHI</th>
                    <th className="p-2">DNI</th>
                    <th className="p-2">Temp</th>
                    <th className="p-2">Predicción</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((d, i) => (
                    <tr key={i} className="border-b border-zinc-800">
                      <td className="p-2">{d.hour}</td>
                      <td className="p-2">{d.ghi.toFixed(0)}</td>
                      <td className="p-2">{d.dni.toFixed(0)}</td>
                      <td className="p-2">{d.temp.toFixed(1)}°C</td>
                      <td className="p-2">{d.prediction.toFixed(0)}W</td>
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
