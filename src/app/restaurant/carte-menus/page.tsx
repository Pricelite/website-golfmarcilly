import PageHero from "@/components/page-hero";

export default function Page() {
  return (
    <div className="text-emerald-950">
      <PageHero title="" />

      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <section className="rounded-[32px] border border-emerald-900/10 bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur">
          <p className="text-sm text-emerald-900/80">Page en construction.</p>
          <p className="mt-3 text-sm text-emerald-900/70"></p>
        </section>
      </main>
    </div>
  );
}
