import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="bg-background text-foreground flex min-h-screen flex-1 items-center justify-center px-6 py-16">
      <section className="w-full max-w-2xl space-y-8 text-center">
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm font-medium tracking-[0.18em] uppercase">
            Redomiciled
          </p>
          <h1 className="text-4xl leading-tight font-semibold sm:text-5xl">
            Start Here
          </h1>
          <p className="text-muted-foreground mx-auto max-w-xl text-base leading-7 sm:text-lg">
            Intake form scaffold ready for the Redomiciled funnel. The final
            experience will follow the brand guidance in DESIGN.md.
          </p>
        </div>

        <Button size="lg" type="button">
          Form build in progress
        </Button>
      </section>
    </main>
  );
}
