/**
 * Navbar – Navegación principal del dashboard SolarPulse.
 *
 * Características:
 * - Sticky (siempre visible)
 * - Tabs con indicador de página activa (usePathname)
 * - Diseño compacto y coherente con el tema oscuro
 * - Preparado para añadir más rutas en el futuro (historial, alertas…)
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, History, BookOpen, Lightbulb, Settings } from "lucide-react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/history", label: "Histórico", icon: History },
  { href: "/how-it-works", label: "Motor Solar", icon: BookOpen },
  { href: "/optimization", label: "Optimización", icon: Lightbulb },
  { href: "/config", label: "Configuración", icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo / Título */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
            <span className="text-sm font-bold text-amber-400">S</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors">
              SolarPulse
            </span>
          </div>
        </Link>

        {/* Tabs de navegación */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "text-amber-400"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>

                {/* Indicador animado de página activa */}
                {isActive && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 rounded-lg bg-amber-500/10 border border-amber-500/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}