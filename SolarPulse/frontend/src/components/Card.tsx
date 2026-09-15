import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}