"use client";

import { usePathname, useRouter } from "next/navigation";

type HeroBackButtonProps = {
  className?: string;
};

export default function HeroBackButton({ className }: HeroBackButtonProps) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/") {
    return null;
  }

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  }

  return (
    <button
      className={`inline-flex items-center gap-2 rounded-full border border-emerald-900/15 bg-emerald-50/80 px-4 py-2 text-sm font-semibold text-emerald-900 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-900/25 hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${
        className ?? ""
      }`}
      type="button"
      onClick={handleBack}
      aria-label="Revenir à la page précédente"
    >
      <span aria-hidden="true">←</span>
      Retour
    </button>
  );
}
