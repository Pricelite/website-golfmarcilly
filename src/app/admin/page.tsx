import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/metadata";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/lib/initiation/admin-auth";
import {
  listReservationsForAdmin,
  markExpiredPendingReservations,
  type InitiationReservationWithSlot,
} from "@/lib/initiation/db";

export const metadata: Metadata = {
  title: "Administration du golf",
  description: "Suivi des demandes d'initiation par email et archives des anciennes réservations.",
  alternates: { canonical: absoluteUrl("/admin") },
  robots: {
    index: false,
    follow: false,
  },
};

type AdminPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

function formatEuro(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function statusLabel(status: InitiationReservationWithSlot["status"]): string {
  switch (status) {
    case "CONFIRMED":
      return "Confirmée - paiement sur place";
    case "PAID":
      return "PAID";
    case "PENDING":
      return "PENDING";
    case "CANCELED":
      return "CANCELED";
    case "FAILED":
      return "FAILED";
    case "EXPIRED":
      return "EXPIRED";
    default:
      return status;
  }
}

function statusClass(status: InitiationReservationWithSlot["status"]): string {
  switch (status) {
    case "CONFIRMED":
    case "PAID":
      return "bg-emerald-100 text-emerald-900";
    case "PENDING":
      return "bg-amber-100 text-amber-900";
    default:
      return "bg-red-100 text-red-800";
  }
}

function formatDate(value: string): string {
  const [yearRaw, monthRaw, dayRaw] = value.split("-");
  const year = Number.parseInt(yearRaw, 10);
  const month = Number.parseInt(monthRaw, 10);
  const day = Number.parseInt(dayRaw, 10);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function parseDateTime(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  }).format(new Date(value));
}

function buildSlotSummary(reservations: InitiationReservationWithSlot[]) {
  const grouped = new Map<
    string,
    {
      slotLabel: string;
      withMealParticipants: number;
      withoutMealParticipants: number;
      totalParticipants: number;
      totalPaidCents: number;
    }
  >();

  for (const reservation of reservations) {
    if (!reservation.slot) {
      continue;
    }

    const key = `${reservation.slot.date}|${reservation.slot.startTime}|${reservation.slot.endTime}`;
    const current = grouped.get(key) || {
      slotLabel: `${formatDate(reservation.slot.date)} ${reservation.slot.startTime}-${reservation.slot.endTime}`,
      withMealParticipants: 0,
      withoutMealParticipants: 0,
      totalParticipants: 0,
      totalPaidCents: 0,
    };

    if (reservation.status === "PAID" || reservation.status === "PENDING" || reservation.status === "CONFIRMED") {
      current.totalParticipants += reservation.participantsCount;
      if (reservation.mealOption === "WITH_MEAL") {
        current.withMealParticipants += reservation.participantsCount;
      } else {
        current.withoutMealParticipants += reservation.participantsCount;
      }
    }

    if (reservation.status === "PAID") {
      current.totalPaidCents += reservation.totalPriceCents;
    }

    grouped.set(key, current);
  }

  return Array.from(grouped.values()).sort((a, b) => a.slotLabel.localeCompare(b.slotLabel));
}

function AdminLogin(props: { error?: string; next?: string }) {
  const errorMessage =
    props.error === "rate_limited"
      ? "Trop de tentatives. Merci de patienter avant de réessayer."
      : props.error === "untrusted_origin"
        ? "Origine non autorisée. Rechargez la page puis réessayez."
        : props.error === "missing_password"
          ? "Le mot de passe est requis."
          : props.error
            ? "Mot de passe invalide."
            : "";

  return (
    <div className="mx-auto w-full max-w-md px-6 py-12">
      <section className="rounded-3xl border border-emerald-900/10 bg-white/90 p-6 shadow-xl shadow-emerald-900/10">
        <h1 className="font-[var(--font-display)] text-2xl text-emerald-950">
          Administration du golf
        </h1>
        <p className="mt-2 text-sm text-emerald-900/70">
          Entrez le mot de passe administrateur.
        </p>

        {errorMessage ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {errorMessage}
          </p>
        ) : null}

        <form action="/admin/login" method="post" className="mt-4 space-y-4">
          <input type="hidden" name="next" value={props.next === "/admin/competitions" ? props.next : "/admin"} />
          <label className="block text-sm text-emerald-900/80">
            Mot de passe
            <input
              className="mt-1 w-full rounded-xl border border-emerald-900/15 bg-white px-3 py-2 text-sm text-emerald-950 outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              type="password"
              name="password"
              required
            />
          </label>
          <button
            className="inline-flex rounded-full bg-emerald-900 px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-800"
            type="submit"
          >
            Se connecter
          </button>
        </form>
      </section>
    </div>
  );
}

function CurrentInitiationRequests() {
  const inbox = process.env.EMAIL_TO?.trim() || "golf@marcilly.com";
  return (
    <section className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-lg shadow-emerald-900/10">
      <h2 className="font-serif text-2xl text-emerald-950">Demandes d’initiation actuelles</h2>
      <p className="mt-3 text-sm leading-7 text-emerald-900/80">
        Le formulaire actuel transmet les demandes à la boîte <strong>{inbox}</strong>. Consultez-y les messages dont l’objet commence par <strong>[Initiation] Demande pour le</strong>, puis répondez au visiteur pour confirmer le créneau. Aucun créneau ni paiement n’est enregistré automatiquement.
      </p>
      <p className="mt-3 text-sm leading-7 text-emerald-900/80">
        Les demandes reçues par email ne figurent pas dans les archives ci-dessous. En cas d’échec d’envoi, le formulaire affiche une erreur au visiteur.
      </p>
    </section>
  );
}

export default async function AdminPage(props: AdminPageProps) {
  const searchParams = await props.searchParams;
  const cookieStore = await cookies();

  if (!process.env.ADMIN_PASSWORD?.trim()) {
    return <div className="mx-auto max-w-xl px-6 py-12"><h1 className="font-serif text-3xl">Administration du golf</h1><p className="mt-4">L’accès administrateur n’est pas encore configuré. Définissez le mot de passe administrateur dans la configuration du serveur pour activer la connexion.</p></div>;
  }

  if (!(await isAdminAuthenticated(cookieStore))) {
    return <AdminLogin error={searchParams.error} next={searchParams.next} />;
  }

  if (searchParams.next === "/admin/competitions") redirect("/admin/competitions");

  let reservations: InitiationReservationWithSlot[];
  try {
    await markExpiredPendingReservations();
    reservations = await listReservationsForAdmin();
  } catch {
    return <div className="mx-auto max-w-5xl space-y-6 px-6 py-12"><h1 className="font-serif text-3xl">Administration du golf</h1><CurrentInitiationRequests /><Link className="inline-block rounded-full bg-emerald-900 px-5 py-3 text-white" href="/admin/competitions">Gérer les compétitions</Link><p role="alert">Les archives des anciennes réservations sont momentanément indisponibles.</p><form action="/admin/logout" method="post"><button type="submit" className="underline">Déconnexion</button></form></div>;
  }
  const slotSummary = buildSlotSummary(reservations);

  const totals = reservations.reduce(
    (acc, reservation) => {
      if (reservation.status === "PAID" || reservation.status === "PENDING" || reservation.status === "CONFIRMED") {
        acc.totalParticipants += reservation.participantsCount;
        if (reservation.mealOption === "WITH_MEAL") {
          acc.withMealParticipants += reservation.participantsCount;
        } else {
          acc.withoutMealParticipants += reservation.participantsCount;
        }
      }

      if (reservation.status === "PAID") {
        acc.totalPaidCents += reservation.totalPriceCents;
      }

      return acc;
    },
    {
      totalParticipants: 0,
      withMealParticipants: 0,
      withoutMealParticipants: 0,
      totalPaidCents: 0,
    }
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-10">
      <section className="rounded-3xl border border-emerald-900/10 bg-white/90 p-6 shadow-xl shadow-emerald-900/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-[var(--font-display)] text-3xl text-emerald-950">
              Administration du golf
            </h1>
            <p className="mt-1 text-sm text-emerald-900/70">
              Demandes actuelles par email et anciennes réservations.
            </p>
          </div>
          <Link className="rounded-full bg-emerald-900 px-4 py-2 text-sm font-semibold text-white" href="/admin/competitions">Gérer les compétitions</Link>
          <form action="/admin/logout" method="post">
            <button
              className="inline-flex rounded-full border border-emerald-900/20 px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
              type="submit"
            >
              Déconnexion
            </button>
          </form>
        </div>

        <div className="mt-6"><CurrentInitiationRequests /></div>

        <h2 className="mt-8 font-serif text-2xl text-emerald-950">Archives des anciennes réservations</h2>
        <p className="mt-2 text-sm text-emerald-900/70">Les chiffres et listes qui suivent proviennent uniquement de l’ancien parcours Supabase.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <article className="rounded-2xl border border-emerald-900/10 bg-emerald-50/50 p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-900/70">
              Participants
            </p>
            <p className="mt-1 text-2xl font-semibold text-emerald-950">
              {totals.totalParticipants}
            </p>
          </article>
          <article className="rounded-2xl border border-emerald-900/10 bg-emerald-50/50 p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-900/70">
              Avec repas
            </p>
            <p className="mt-1 text-2xl font-semibold text-emerald-950">
              {totals.withMealParticipants}
            </p>
          </article>
          <article className="rounded-2xl border border-emerald-900/10 bg-emerald-50/50 p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-900/70">
              Sans repas
            </p>
            <p className="mt-1 text-2xl font-semibold text-emerald-950">
              {totals.withoutMealParticipants}
            </p>
          </article>
          <article className="rounded-2xl border border-emerald-900/10 bg-emerald-50/50 p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-900/70">
              Montant encaissé
            </p>
            <p className="mt-1 text-2xl font-semibold text-emerald-950">
              {formatEuro(totals.totalPaidCents)}
            </p>
          </article>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-emerald-900/10 bg-white/90 p-6 shadow-lg shadow-emerald-900/10">
        <h2 className="text-xl font-semibold text-emerald-950">
          Participants par ancien créneau
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-emerald-900/85">
            <thead>
              <tr className="border-b border-emerald-900/10">
                <th className="px-2 py-2 font-semibold text-emerald-950">
                  Créneau
                </th>
                <th className="px-2 py-2 text-right font-semibold text-emerald-950">
                  Avec repas
                </th>
                <th className="px-2 py-2 text-right font-semibold text-emerald-950">
                  Sans repas
                </th>
                <th className="px-2 py-2 text-right font-semibold text-emerald-950">
                  Total
                </th>
                <th className="px-2 py-2 text-right font-semibold text-emerald-950">
                  Encaissé
                </th>
              </tr>
            </thead>
            <tbody>
              {slotSummary.map((summary) => (
                <tr
                  key={summary.slotLabel}
                  className="border-b border-emerald-900/10"
                >
                  <td className="px-2 py-2">{summary.slotLabel}</td>
                  <td className="px-2 py-2 text-right">
                    {summary.withMealParticipants}
                  </td>
                  <td className="px-2 py-2 text-right">
                    {summary.withoutMealParticipants}
                  </td>
                  <td className="px-2 py-2 text-right font-semibold">
                    {summary.totalParticipants}
                  </td>
                  <td className="px-2 py-2 text-right font-semibold">
                    {formatEuro(summary.totalPaidCents)}
                  </td>
                </tr>
              ))}
              {slotSummary.length === 0 ? (
                <tr>
                  <td className="px-2 py-3 text-sm text-emerald-900/70" colSpan={5}>
                    Aucune réservation pour le moment.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-emerald-900/10 bg-white/90 p-6 shadow-lg shadow-emerald-900/10">
        <h2 className="text-xl font-semibold text-emerald-950">
          Anciennes réservations
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-emerald-900/85">
            <thead>
              <tr className="border-b border-emerald-900/10">
                <th className="px-2 py-2 font-semibold text-emerald-950">
                  Créé le
                </th>
                <th className="px-2 py-2 font-semibold text-emerald-950">
                  Créneau
                </th>
                <th className="px-2 py-2 font-semibold text-emerald-950">
                  Client
                </th>
                <th className="px-2 py-2 font-semibold text-emerald-950">
                  Contact
                </th>
                <th className="px-2 py-2 text-right font-semibold text-emerald-950">
                  Pax
                </th>
                <th className="px-2 py-2 font-semibold text-emerald-950">
                  Repas
                </th>
                <th className="px-2 py-2 text-right font-semibold text-emerald-950">
                  Total
                </th>
                <th className="px-2 py-2 font-semibold text-emerald-950">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr
                  key={reservation.id}
                  className="border-b border-emerald-900/10"
                >
                  <td className="px-2 py-2">
                    {parseDateTime(reservation.createdAt)}
                  </td>
                  <td className="px-2 py-2">
                    {reservation.slot
                      ? `${formatDate(reservation.slot.date)} ${reservation.slot.startTime}-${reservation.slot.endTime}`
                      : "-"}
                  </td>
                  <td className="px-2 py-2 font-semibold text-emerald-950">
                    {reservation.fullName}
                  </td>
                  <td className="px-2 py-2">
                    <div>{reservation.email}</div>
                    <div>{reservation.phone}</div>
                  </td>
                  <td className="px-2 py-2 text-right">
                    {reservation.participantsCount}
                  </td>
                  <td className="px-2 py-2">
                    {reservation.mealOption === "WITH_MEAL"
                      ? "Avec repas"
                      : "Sans repas"}
                  </td>
                  <td className="px-2 py-2 text-right font-semibold">
                    {formatEuro(reservation.totalPriceCents)}
                  </td>
                  <td className="px-2 py-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusClass(
                        reservation.status
                      )}`}
                    >
                      {statusLabel(reservation.status)}
                    </span>
                  </td>
                </tr>
              ))}
              {reservations.length === 0 ? (
                <tr>
                  <td className="px-2 py-3 text-sm text-emerald-900/70" colSpan={8}>
                    Aucune réservation enregistrée.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
