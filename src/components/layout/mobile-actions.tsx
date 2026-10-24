"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import RestaurantReservationModal from "@/components/restaurant-reservation-modal";
import { siteConfig } from "@/data/site";

export function MobileActions() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  const initiation = pathname === "/je-debute-le-golf" || pathname.startsWith("/initiation");
  const teaching = pathname === "/enseignement" || pathname === "/reserver-un-cours";
  const action = initiation
    ? { href: pathname === "/initiation/reservation" ? "#choisir-initiation" : "/initiation/reservation", label: "Choisir une initiation" }
    : pathname === "/evenements"
      ? { href: "#devis", label: "Demander un devis" }
      : teaching
        ? { href: "/enseignement#enseignants", label: "Contacter un enseignant" }
        : pathname === "/partenaires"
          ? { href: "/contact#reservation", label: "Devenir partenaire" }
          : pathname === "/contact"
            ? { href: "#reservation", label: "Écrire au golf" }
            : { href: siteConfig.bookingEngineUrl, label: "Réserver un départ" };
  const actionClass = "site-button site-button-primary flex min-h-12 flex-[2] items-center justify-center rounded-full px-3 py-3 text-center text-sm font-semibold leading-5";
  return <nav aria-label="Actions rapides" className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-[#f7f4e9] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 lg:hidden">
    <div className="mx-auto flex max-w-md items-center gap-2 rounded-full border border-emerald-950/15 bg-white/95 p-2 shadow-lg backdrop-blur">
      <a className="site-button flex min-h-12 flex-1 items-center justify-center rounded-full px-3 text-sm font-semibold" href={`tel:${siteConfig.phoneHref}`}>Appeler</a>
      {pathname === "/restaurant" ? <RestaurantReservationModal triggerLabel="Demander une table" triggerClassName={actionClass} /> :
        <Link className={actionClass} href={action.href}>
          {action.label}
        </Link>}
    </div>
  </nav>;
}
