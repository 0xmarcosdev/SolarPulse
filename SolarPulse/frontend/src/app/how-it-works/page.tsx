/**
 * Vista educativa: "Cómo predice SolarPulse"
 */

"use client";

import { Navbar } from "@/components/Navbar";
import { BookOpen, Zap, Sun, Thermometer, Database, GitBranch } from "lucide-react";
import { motion } from "framer-motion";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      
      <main className="mx-auto w-full max-w-4xl px-4 py-8 space-y-10">
        <header>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-6 w-6 text-amber-400" />
            <h1 className="text-2xl font-bold">Cómo predice SolarPulse</h1>
          </div>
          <p className="text-zinc-400 text-sm">
            Entendiendo nuestro motor de predicción basado en datos meteorológicos y optimización solar.
          </p>
        </header>

        {/* 1. Datos Sensados */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-sky-400" />
            Datos de Open-Meteo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <span className="font-semibold text-zinc-200">GHI (Global Horizontal Irradiance)</span>
              <p className="text-zinc-500 mt-1">Irradiancia solar total sobre superficie horizontal. Es la base de toda la energía solar disponible.</p>
            </div>
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <span className="font-semibold text-zinc-200">DNI (Direct Normal Irradiance)</span>
              <p className="text-zinc-500 mt-1">Luz solar directa sin obstrucciones. Crítica para paneles de alto rendimiento.</p>
            </div>
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <span className="font-semibold text-zinc-200">DHI (Diffuse Horizontal Irradiance)</span>
              <p className="text-zinc-500 mt-1">Luz solar dispersada por nubes y partículas. Energía disponible incluso en días nublados.</p>
            </div>
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <span className="font-semibold text-zinc-200">Temperatura (2m)</span>
              <p className="text-zinc-500 mt-1">Temperatura ambiente para ajustar la eficiencia del panel (coeficiente térmico).</p>
            </div>
          </div>
        </section>

        {/* 2. Pipeline */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-emerald-400" />
            Pipeline de Cálculo
          </h2>
          <div className="space-y-4">
            <PipelineStep number={1} title="POA (Plane of Array)" description="Ajuste de irradiancia GHI/DNI/DHI a la inclinación real del panel (45°)." />
            <PipelineStep number={2} title="Potencia DC" description="Cálculo basado en POA + temperatura de celda usando el modelo del panel (585W)." />
            <PipelineStep number={3} title="Clipping (500W)" description="EcoFlow Delta 3 limita la entrada a 500W. Cualquier exceso sobre 500W se recorta." />
            <PipelineStep number={4} title="Pérdidas (15%)" description="Factor final de eficiencia del sistema (cableado, conversión) aplicado: 85%." />
          </div>
        </section>

        {/* 3. Setup */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            Tu Configuración
          </h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <DetailItem label="Panel" value="RUNERGY HY-DH144N8-585" />
            <DetailItem label="Clipping" value="500 W" />
            <DetailItem label="Inclinación" value="45°" />
            <DetailItem label="Azimut" value="180° (Sur)" />
            <DetailItem label="Pérdidas sist." value="15%" />
            <DetailItem label="Zona Horaria" value="America/Havana" />
          </dl>
        </section>
      </main>
    </div>
  );
}

function PipelineStep({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 text-sm">
        {number}
      </div>
      <div>
        <h4 className="font-semibold text-zinc-200">{title}</h4>
        <p className="text-sm text-zinc-500">{description}</p>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
      <dt className="text-zinc-500 text-[11px] uppercase tracking-wider">{label}</dt>
      <dd className="text-zinc-100 font-medium text-sm mt-0.5">{value}</dd>
    </div>
  );
}
