/**
 * Gauge – Indicador circular o semicircular.
 *
 * Props:
 * - value: valor actual
 * - max: valor máximo (default 100)
 * - label: texto debajo
 * - unit: unidad (%, W, etc.)
 * - type: "full" | "semi"
 * - color: color del arco (Tailwind o hex)
 */

"use client";

import { motion } from "framer-motion";

interface GaugeProps {
  value: number;
  max?: number;
  label?: string;
  unit?: string;
  type?: "full" | "semi";
  size?: number;
  color?: string;
  trackColor?: string;
}

export function Gauge({
  value,
  max = 100,
  label,
  unit = "",
  type = "full",
  size = 120,
  color = "#34d399",
  trackColor = "#27272a",
}: GaugeProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const isSemi = type === "semi";

  // Geometría SVG
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = isSemi ? circumference / 2 : circumference;
  const offset = arcLength - (percentage / 100) * arcLength;

  const viewBox = isSemi
    ? `0 0 ${size} ${size / 2 + stroke}`
    : `0 0 ${size} ${size}`;

// Mensaje de tooltip según el tipo de gauge
  const tooltipText = (() => {
    if (unit === "%") {
      if (value > 80) return `Batería en buen estado (${Math.round(value)}%)`;
      if (value > 40) return `Nivel medio de batería (${Math.round(value)}%)`;
      return `Batería baja (${Math.round(value)}%) · reduce el consumo`;
    }
    if (unit === "W" && max === 500) {
      const pct = Math.round((value / max) * 100);
      if (pct > 95) return `Muy cerca del límite EcoFlow (${Math.round(value)} W)`;
      if (pct > 70) return `Buena producción solar (${Math.round(value)} W)`;
      return `Producción actual: ${Math.round(value)} W de ${max} W posibles`;
    }
    return `${Math.round(value)}${unit} de ${max}${unit}`;
  })();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div
        className="group relative flex flex-col items-center gap-1 cursor-default"
        title={tooltipText}
      >
        <motion.div
          whileHover={{ scale: 1.04 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
        >
          <svg
            width={size}
            height={isSemi ? size / 2 + stroke : size}
            viewBox={viewBox}
            className="overflow-visible"
          >
            {/* Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={trackColor}
              strokeWidth={stroke}
              strokeDasharray={isSemi ? `${arcLength} ${circumference}` : undefined}
              strokeLinecap="round"
              transform={isSemi ? `rotate(180 ${size / 2} ${size / 2})` : undefined}
            />

            {/* Valor animado */}
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={stroke}
              strokeDasharray={arcLength}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform={isSemi ? `rotate(180 ${size / 2} ${size / 2})` : `rotate(-90 ${size / 2} ${size / 2})`}
              initial={{ strokeDashoffset: arcLength }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: "easeOut" }}
            />

            {/* Texto central (solo full) */}
            {!isSemi && (
              <text
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
                className="fill-zinc-50 text-xl font-bold"
                style={{ fontSize: size * 0.18 }}
              >
                {Math.round(value)}
                {unit && (
                  <tspan style={{ fontSize: size * 0.11 }} className="fill-zinc-400">
                    {unit}
                  </tspan>
                )}
              </text>
            )}
          </svg>
        </motion.div>

        {/* Texto para semicircular */}
        {isSemi && (
          <div className="text-center -mt-2">
            <p className="text-xl font-bold tabular-nums text-zinc-50">
              {Math.round(value)}
              <span className="text-sm font-medium text-zinc-400 ml-0.5">
                {unit}
              </span>
            </p>
          </div>
        )}

        {label && (
          <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
        )}
      </div>
    </motion.div>
  );
}



