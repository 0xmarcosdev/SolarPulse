"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, History, BookOpen, Lightbulb, Settings, Sun } from "lucide-react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/motor", label: "Motor Solar", icon: BookOpen },
  { href: "/history", label: "Histórico", icon: History },
  { href: "/optimization", label: "Optimización", icon: Lightbulb },
  { href: "/config", label: "Configuración", icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-background)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo / Título con tipografía Clean Pulse */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dim)] p-0.5 shadow-[var(--shadow-glow-amber)]">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[var(--color-surface)]">
              <Sun className="h-5 w-5 text-[var(--color-accent)] animate-spin-slow" />
            </div>
            {/* Anillo solar pulsante */}
            <div className="absolute inset-0 rounded-[var(--radius-md)] border border-[var(--color-accent)] opacity-40 animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
          </div>

          <div className="flex flex-col">
            <span className="font-[family-name:var(--font-display)] text-2xl tracking-wider text-[var(--color-foreground)] group-hover:text-[var(--color-accent)] transition-colors">
              SolarPulse
            </span>
            <span className="font-[family-name:var(--font-ui)] text-[9px] uppercase tracking-widest text-[var(--color-muted)]">
              Clean Pulse v3
            </span>
          </div>
        </Link>

        {/* Estado en vivo / Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-[var(--radius-full)] bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-[family-name:var(--font-ui)]">
          <span className="h-2 w-2 rounded-full bg-[var(--color-success)] shadow-[var(--shadow-glow-success)]" style={{ animation: 'breath-glow 2s infinite alternate' }} />
          <span className="text-[var(--color-muted)]">EcoFlow:</span>
          <span className="font-[family-name:var(--font-mono)] text-[var(--color-success)]">ONLINE</span>
        </div>

        {/* Tabs de navegación */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] font-[family-name:var(--font-ui)] text-xs uppercase tracking-wider transition-all ${
                  isActive
                    ? "text-[var(--color-accent)] font-bold"
                    : "text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface)]"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>

                {/* Indicador animado de página activa */}
                {isActive && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 rounded-[var(--radius-sm)] bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 shadow-[var(--shadow-glow-amber)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
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
