import { Loader2 } from "lucide-react";

export default function StatusCard() {
  return (
    <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            SolarPulse
          </p>
          <p className="text-lg font-semibold text-zinc-900">
            Conectando al backend...
          </p>
        </div>
      </div>
    </section>
  );
}
