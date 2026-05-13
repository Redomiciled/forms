import { StartHereForm } from "@/components/start-here-form";

export default function Home() {
  return (
    <main className="relative overflow-hidden bg-[#070720] max-sm:h-dvh sm:min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(92,89,255,0.42),transparent_32%),radial-gradient(circle_at_80%_12%,rgba(59,56,224,0.36),transparent_30%),linear-gradient(135deg,#2422A1_0%,#3B38E0_48%,#11102B_100%)]" />
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(125deg,transparent_0%,rgba(255,255,255,0.13)_46%,transparent_70%)] opacity-35" />
      <div className="relative max-sm:h-full max-sm:min-h-0">
        <StartHereForm />
      </div>
    </main>
  );
}
