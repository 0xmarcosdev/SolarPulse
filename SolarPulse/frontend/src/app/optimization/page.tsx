"use client";

import Link from "next/link";
import { ArrowLeft, Sliders, Zap, Flame, BatteryCharging, CheckCircle2, TrendingUp } from "lucide-react";

export default function OptimizationPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-8 flex flex-col items-center">
      <main className="w-full max-w-3xl flex flex-col gap-6">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors bg-zinc-900 border border-zinc-800 px-3.5 py-2 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Dashboard
          </Link>
          <Link
            href="/config"
            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors bg-zinc-900 border border-zinc-800 px-3.5 py-2 rounded-lg"
          >
            <Sliders className="h-4 w-4" />
            Configuración del Panel
          </Link>
        </div>

        <header className="border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Centro de Optimización Solar</h1>
              <p className="text-sm text-zinc-400">
                Estrategias para maximizar el aprovechamiento de tu panel RUNERGY 585W y EcoFlow Delta 3.
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-6">
          {/* Card 1: Clipping Strategy */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <BatteryCharging className="h-4 w-4" /> Gestión de Recorte (Clipping a 500W)
              </span>
              <span className="text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-0.5 rounded-full font-medium">
                Alta Prioridad
              </span>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed">
              Tu panel RUNERGY HY-DH144N8-585 produce hasta <strong>585W STC</strong>, pero el inversor solar de la EcoFlow Delta 3 Classic tiene un límite estricto de <strong>500W DC</strong>. Toda energía por encima de ese umbral se disipa si la estación está en modo de carga pura.
            </p>

            <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-4 text-sm text-blue-200 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-blue-300">
                <TrendingUp className="h-4 w-4" /> Recomendación de Cargas Activas:
              </div>
              <p className="text-xs text-blue-200/90 leading-relaxed">
                Durante las horas de radiación pico (11:00 AM - 3:00 PM), activa consumos en las salidas AC (computadoras, refrigeración, ventilación o recargas secundarias). Al descargar simultáneamente la estación, el controlador MPPT mantiene el punto de máxima potencia aprovechando el excedente solar sin desperdicio.
              </p>
            </div>
          </section>

          {/* Card 2: Thermal Management */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <Flame className="h-4 w-4" /> Coeficiente Térmico y Ventilación
              </span>
              <span className="text-xs bg-rose-500/10 border border-rose-500/30 text-rose-400 px-2.5 py-0.5 rounded-full font-medium">
                P loss: -0.29%/°C
              </span>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed">
              El panel cuenta con tecnología N-Type TOPCon con un excelente coeficiente térmico de <strong>-0.29%/°C</strong> (NOCT 45°C). Aun así, en el clima tropical de Cuba, temperaturas de celda de 55°C a 65°C reducen la potencia pico entre un 8% y un 12%.
            </p>

            <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-4 text-sm text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-amber-300">
                <CheckCircle2 className="h-4 w-4" /> Buenas Prácticas de Instalación:
              </div>
              <ul className="text-xs text-amber-200/90 space-y-1.5 list-disc list-inside">
                <li>Mantén una separación mínima de 10-15 cm entre la parte trasera del panel y el techo para flujo de aire pasivo.</li>
                <li>Evita colocar la estación EcoFlow bajo exposición solar directa; mantenla en sombra y ambiente ventilado.</li>
                <li>Limpia periódicamente la superficie del panel; el polvo acumulado en climas cálidos retiene calor residual.</li>
              </ul>
            </div>
          </section>

          {/* Card 3: Bifacial Gain */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Zap className="h-4 w-4" /> Ganancia Bifacial (Factor 0.80)
              </span>
              <span className="text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full font-medium">
                TOPCon Bifacial
              </span>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed">
              La cara posterior del módulo RUNERGY absorbe luz difusa y albedo con un <strong>80% de bifacialidad</strong>. Si el suelo o techo sobre el que está montado es reflectante (hormigón claro, pintura blanca o membrana blanca), puedes ganar entre 20W y 60W adicionales en horas de radiación difusa matutina o vespertina.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
