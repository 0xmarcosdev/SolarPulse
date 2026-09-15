/**
 * KpiCard – Tarjeta de indicador densa para el dashboard SolarPulse.
 *
 * Características:
 * - Valor principal grande + unidad
 * - Barra de progreso opcional (ej. SoC de batería)
 * - Sparkline opcional con datos reales
 * - Badge de estado (en vivo, clipping, manual…)
 * - Icono con color temático
 *
 * Buenas prácticas:
 * - Mantiene altura consistente para alineación en grid
 * - Usa tabular-nums para que los números no “salten”
 * - Sparkline desactiva animación por defecto para rendimiento
 */

"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

interface SparkPoint {
  value: number;
}

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  progress?: number; // 0-100
  progressColor?: string;
  badge?: string;
  sparkData?: SparkPoint[];
  sparkColor?: string;
  children?: ReactNode;
}

export function KpiCard({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  iconColor = "text-zinc-400",
  iconBg = "bg-zinc-800 border-zinc-700",
  progress,
  progressColor = "bg-emerald-500",
  badge,
  sparkData,
  sparkColor = "#10b981",
  children,
}: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden"
    >
      {/* Cabecera: icono + badge */}
      <div className="flex items-start justify-between gap-2">
        <div className={`p-2 rounded-xl border ${iconBg}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        {badge && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
            {badge}
          </span>
        )}
      </div>

      {/* Valor principal */}
      <div className="min-h-[52px]">
        <p className="text-xs font-medium text-zinc-400 mb-0.5">{title}</p>
        <p className="text-2xl font-bold text-zinc-50 tabular-nums leading-none">
          {value}
          {unit && (
            <span className="text-sm font-medium text-zinc-400 ml-1">{unit}</span>
          )}
        </p>
        {subtitle && <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>}
      </div>

      {/* Barra de progreso */}
      {typeof progress === "number" && (
        <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${progressColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      )}

      {/* Sparkline con datos reales */}
      {sparkData && sparkData.length > 1 && (
        <div className="h-10 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData}>
              <Area
                type="monotone"
                dataKey="value"
                stroke={sparkColor}
                fill={sparkColor}
                fillOpacity={0.15}
                strokeWidth={1.5}
                isAnimationActive={false} // desactivado para no saturar en polling
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {children}
    </motion.div>
  );
}