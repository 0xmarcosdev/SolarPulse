export interface HourlySolarData {
  hour: string;
  prediction: number;
  actual: number;
  ghi: number;
  dni: number;
  temp: number;
}

export default function OptimizationTips({ data }: { data: HourlySolarData[] }) {
  const latest = data[data.length - 1];
  if (!latest) return null;

  const highTemp = latest.temp > 30;
  const clipping = latest.prediction > 480;

  if (!highTemp && !clipping) return null;

  return (
    <div className="bg-zinc-900 border-l-4 border-amber-500 p-4 rounded-lg shadow-lg my-4 text-zinc-300">
      <h3 className="font-bold text-amber-500">💡 Sugerencias de Optimización</h3>
      {highTemp && <p>⚠️ Alerta de Calor: Alta temperatura. La eficiencia del panel puede reducirse.</p>}
      {clipping && <p>⚡ Clipping Detectado: La generación supera 480W. Considera encender cargas AC para aprovechar el exceso de energía.</p>}
    </div>
  );
}
