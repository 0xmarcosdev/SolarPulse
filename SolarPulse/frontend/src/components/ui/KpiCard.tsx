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
  iconColor = "text-[var(--color-muted)]",
  iconBg = "bg-[var(--color-surface-2)] border-[var(--color-border)]",
  progress,
  progressColor = "bg-[var(--color-success)]",
  badge,
  sparkData,
  sparkColor = "var(--color-success)",
  children,
}: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 flex flex-col gap-3 relative overflow-hidden group shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] hover:-translate-y-0.5 transition-all"
    >
      {/* Línea superior con gradiente ámbar -> cian al hacer hover */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-cyan)] opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Cabecera: icono + badge */}
      <div className="flex items-start justify-between gap-2">
        <div className={`p-2.5 rounded-[var(--radius-md)] border ${iconBg} shadow-inner`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        {badge && (
          <span className="text-[10px] font-[family-name:var(--font-ui)] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-[var(--radius-full)] bg-[var(--color-surface-2)] text-[var(--color-accent)] border border-[var(--color-border)]">
            {badge}
          </span>
        )}
      </div>

      {/* Valor principal con tipografía Clean Pulse */}
      <div className="min-h-[52px]">
        <p className="text-[11px] font-[family-name:var(--font-ui)] uppercase tracking-wider text-[var(--color-muted)] mb-1">{title}</p>
        <p className="text-2xl font-bold font-[family-name:var(--font-mono)] text-[var(--color-foreground)] tabular-nums leading-none">
          {value}
          {unit && (
            <span className="text-xs font-normal text-[var(--color-muted)] ml-1 font-[family-name:var(--font-sans)]">{unit}</span>
          )}
        </p>
        {subtitle && <p className="text-xs font-[family-name:var(--font-sans)] text-[var(--color-muted)] mt-1.5">{subtitle}</p>}
      </div>

      {/* Barra de progreso */}
      {typeof progress === "number" && (
        <div className="w-full bg-[var(--color-surface-2)] rounded-[var(--radius-full)] h-1.5 overflow-hidden border border-[var(--color-border)]">
          <motion.div
            className={`h-full rounded-[var(--radius-full)] ${progressColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      )}

      {/* Sparkline con datos reales */}
      {sparkData && sparkData.length > 1 && (
        <div className="h-10 -mx-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData}>
              <Area
                type="monotone"
                dataKey="value"
                stroke={sparkColor}
                fill={sparkColor}
                fillOpacity={0.12}
                strokeWidth={1.5}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {children}
    </motion.div>
  );
}