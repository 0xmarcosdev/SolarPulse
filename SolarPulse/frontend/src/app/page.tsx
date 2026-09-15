/**
 * Página principal del Dashboard SolarPulse.
 *
 * - Carga el estado actual desde /api/current-status
 * - Pasa los datos reales a PowerFlow y a los Gauges
 * - Mantiene StatusCard (que sigue teniendo su propia lógica de sparklines y formulario)
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import StatusCard from "@/components/StatusCard";
import OptimizationTips, { HourlySolarData } from "@/components/OptimizationTips";
import { PowerFlow } from "@/components/PowerFlow";
import { Navbar } from "@/components/Navbar";
import { Gauge } from "@/components/ui/Gauge";
import { AlertsPanel, type AlertItem } from "@/components/AlertsPanel";
import { DaySummary } from "@/components/DaySummary";
import { Battery } from "lucide-react";
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
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface StatusData {
// ... existing
}

interface DailyEnergyItem {
  date: string;
  predicted_kwh: number;
  actual_kwh: number;
  sample_count: number;
  sample_count_forecast: number;
  sample_count_actual: number;
  peak_predicted_watts: number;
  peak_actual_watts: number;
  coverage_ratio: number;
}

function generateInitialSolarData(): HourlySolarData[] {
  return Array.from({ length: 24 }).map((_, i) => ({
    hour: `${i}:00`,
    prediction: Math.max(0, Math.sin((i / 24) * Math.PI) * 600),
    actual: Math.max(
      0,
      Math.sin((i / 24) * Math.PI) * 550 + (i % 2 === 0 ? 15 : -15)
    ),
    ghi: Math.max(0, Math.sin((i / 24) * Math.PI) * 900),
    dni: Math.max(0, Math.sin((i / 24) * Math.PI) * 800),
    temp: 24 + Math.sin((i / 24) * Math.PI) * 9,
  }));
}



export default function Home() {
  // ---------- Estado ----------
  const [chartData] = useState<HourlySolarData[]>(generateInitialSolarData);
  const [showTable, setShowTable] = useState(false);
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true); // ← nuevo
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [dailyEnergy, setDailyEnergy] = useState<DailyEnergyItem | null>(null);

  // ---------- Fetch del estado actual y energía diaria ----------
  const fetchStatus = useCallback(async () => {
    try {
      const [statusRes, energyRes] = await Promise.all([
        fetch(`${API_URL}/api/current-status`),
        fetch(`${API_URL}/api/energy/daily?days=1`),
      ]);
      
      if (statusRes.ok) {
        const json: StatusData = await statusRes.json();
        setStatus(json);
      }
      
      if (energyRes.ok) {
        const energyJson: DailyEnergyItem[] = await energyRes.json();
        if (energyJson.length > 0) {
          setDailyEnergy(energyJson[0]);
        }
      }
    } catch {
      // silencioso
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchStatus();
    };
    void load();
    const interval = setInterval(() => {
      void load();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // ---------- Valores derivados (después de tener `status`) ----------
  const solarW = status?.ecoflow?.input_watts ?? 0;
  const loadW = status?.ecoflow?.output_watts ?? 0;
  const batterySoc = status?.ecoflow?.battery_soc ?? 0;
  const prediction = status?.generation_forecast?.final_ac_power ?? 0;

  // ---------- Alertas ----------
  function buildAlerts(current: StatusData | null): AlertItem[] {
    const list: AlertItem[] = [];
    if (!current) return list;

    const solar = current.ecoflow?.input_watts ?? 0;
    const soc = current.ecoflow?.battery_soc ?? 100;

    if (solar >= 480) {
      list.push({
        id: "clipping",
        type: "clipping",
        title: "Clipping detectado",
        message: `Entrada solar en ${Math.round(solar)} W. Enciende cargas AC para aprovechar el excedente.`,
      });
    }

    if (soc < 25) {
      list.push({
        id: "low_battery",
        type: "low_battery",
        title: "Batería baja",
        message: `SoC en ${soc}%. Reduce el consumo o espera más radiación.`,
      });
    }

    if (!current.ecoflow) {
      list.push({
        id: "no_data",
        type: "info",
        title: "Sin lecturas de EcoFlow",
        message: "Registra una lectura manual o espera la conexión MQTT.",
      });
    }

    return list.filter((a) => !dismissedIds.includes(a.id));
  }

  const alerts = buildAlerts(status);
  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => [...prev, id]);
  };

// ---------- Estimaciones del día ----------
  // Usamos los datos reales si están disponibles, si no, fallback a estimación o 0
  const actualKwh = dailyEnergy?.actual_kwh ?? 0;
  const predictedKwh = dailyEnergy?.predicted_kwh ?? 2.8; // Fallback razonable o 0

  function getNextPeakInfo() {
    const now = new Date();
    const peakDate = new Date(now);
    peakDate.setHours(13, 0, 0, 0);

    if (now > peakDate) {
      return { hour: "Mañana ~13:00", watts: 480 };
    }
    return {
      hour: peakDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      watts: 480,
    };
  }

  function getSunHoursLeft() {
    const now = new Date();
    const sunset = new Date(now);
    sunset.setHours(18, 30, 0, 0);
    const diffMs = sunset.getTime() - now.getTime();
    return Math.max(0, diffMs / (1000 * 60 * 60));
  }

  const peak = getNextPeakInfo();
  const sunHoursLeft = getSunHoursLeft();

return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 space-y-5">
        <StatusCard />

        <AlertsPanel alerts={alerts} onDismiss={handleDismiss} />

        <DaySummary
          predictedKwh={predictedKwh}
          actualKwh={actualKwh}
          nextPeakHour={peak.hour}
          nextPeakWatts={peak.watts}
          sunHoursLeft={sunHoursLeft}
        />

        {loadingStatus ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <Skeleton className="h-4 w-32 mb-6" />
            <div className="flex justify-between items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-2xl" />
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-16 w-16 rounded-2xl" />
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-16 w-16 rounded-2xl" />
            </div>
          </div>
        ) : (
          <PowerFlow solarW={solarW} loadW={loadW} batterySoc={batterySoc} />
        )}

        {!loadingStatus && !status?.ecoflow && (
          <EmptyState
            icon={Battery}
            title="Sin lecturas de EcoFlow"
            description="Todavía no hay datos de la estación. Registra una lectura manual o espera la conexión MQTT."
            actionLabel="Entrada manual"
            onAction={() => {
              // aquí puedes abrir el formulario manual si lo expones
            }}
          />
        )}

        {loadingStatus ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center gap-3"
              >
                <Skeleton className="h-28 w-28 rounded-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Gauges */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center">
            <Gauge
              value={batterySoc}
              max={100}
              unit="%"
              label="Carga de la batería"
              type="full"
              color={
                batterySoc > 60
                  ? "#34d399"
                  : batterySoc > 30
                  ? "#fbbf24"
                  : "#f43f5e"
              }
              size={130}
            />
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center">
            <Gauge
              value={solarW}
              max={500}
              unit="W"
              label="Generación Fotovoltáica"
              type="semi"
              color="#fbbf24"
              size={150}
            />
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center col-span-2 lg:col-span-1">
            <Gauge
              value={prediction}
              max={500}
              unit="W"
              label="Predicción AC"
              type="semi"
              color="#38bdf8"
              size={150}
            />
          </div>
        </div>
      )}
        {/* 4. Tips de optimización */}
        <OptimizationTips data={chartData} />

        {/* 5. Gráfico principal */}
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
              <ComposedChart
                data={chartData}
                margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#27272a"
                  vertical={false}
                />
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
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
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

        {/* 6. Tabla de datos */}
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
                    <th className="px-3 py-2 text-right font-medium">
                      Predicción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((d, i) => (
                    <tr
                      key={i}
                      className="border-t border-zinc-800/60 hover:bg-zinc-800/30"
                    >
                      <td className="px-3 py-1.5">{d.hour}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums">
                        {d.ghi.toFixed(0)}
                      </td>
                      <td className="px-3 py-1.5 text-right tabular-nums">
                        {d.dni.toFixed(0)}
                      </td>
                      <td className="px-3 py-1.5 text-right tabular-nums">
                        {d.temp.toFixed(1)}°
                      </td>
                      <td className="px-3 py-1.5 text-right tabular-nums">
                        {d.prediction.toFixed(0)} W
                      </td>
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