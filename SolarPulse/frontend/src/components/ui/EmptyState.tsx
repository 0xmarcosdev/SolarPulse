/**
 * EmptyState – Mensaje claro cuando no hay datos.
 */

"use client";

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center py-8 px-4"
    >
      <div className="p-3 rounded-2xl bg-zinc-800/80 border border-zinc-700 mb-3">
        <Icon className="h-6 w-6 text-zinc-500" />
      </div>
      <h3 className="text-sm font-semibold text-zinc-200 mb-1">{title}</h3>
      <p className="text-xs text-zinc-500 max-w-xs mb-4">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}