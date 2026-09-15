/**
 * Skeleton – Placeholder animado de carga.
 * Úsalo mientras esperas datos del backend.
 */

"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-zinc-800/80 ${className}`}
    />
  );
}