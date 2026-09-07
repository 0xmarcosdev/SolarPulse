import StatusCard from "@/components/StatusCard";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 px-4 py-16">
      <main className="flex w-full max-w-4xl flex-col items-center gap-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            SolarPulse
          </h1>
          <p className="mt-2 text-zinc-600">
            Monitor solar y estado EcoFlow en tiempo local
          </p>
        </header>
        <StatusCard />
      </main>
    </div>
  );
}
