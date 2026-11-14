import type { Metadata } from "next";
import { AdminShell, type AdminNavigationGroup } from "@/components/admin/admin-shell";
import { currentStaffActor, isSuperAdmin } from "@/lib/admin-access";
import { currentContentActor } from "@/lib/backoffice/content-access";
import { openDb, parseUserGrants } from "@/lib/backoffice/db";
import { can } from "@/lib/backoffice/model";
import { canAccessAdminSection } from "@/lib/restaurant-admin/policy";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const golfSession = await isSuperAdmin();
  const groups: AdminNavigationGroup[] = [];
  let analyticsIdentity: { id: string; role: string } | undefined;
  if (golfSession) groups.push({ label: "Gestion du golf", items: [
    { href: "/admin", label: "Tableau de bord", detail: "Les accès essentiels" },
    { href: "/admin/competitions", label: "Calendrier", detail: "Compétitions et animations" },
    { href: "/admin/restaurant", label: "Restaurant", detail: "Carte et plat du jour" },
    { href: "/admin/restaurant/acces", label: "Comptes et accès", detail: "Droits de chaque personne" },
    { href: "/admin/site-conditions", label: "État du golf", detail: "Parcours et services" },
    { href: "/admin/publicites", label: "Publicités", detail: "Visuels et diffusion sur l’accueil" },
    { href: "/admin/statistiques", label: "Statistiques", detail: "Fréquentation du site" },
    { href: "/admin/archives", label: "Archives des initiations", detail: "Consulter les anciens dossiers" },
  ] });
  const staff = golfSession ? null : await currentStaffActor();
  const restaurantSession = Boolean(staff);
  if (staff) {
    analyticsIdentity = { id: staff.id, role: staff.role };
    const items = [
      { section: "restaurant" as const, href: "/admin/restaurant", label: "Restaurant", detail: "Carte et plat du jour" },
      { section: "competitions" as const, href: "/admin/competitions", label: "Calendrier", detail: "Compétitions et animations" },
      { section: "site_conditions" as const, href: "/admin/site-conditions", label: "État du golf", detail: "Parcours et services" },
      { section: "publicites" as const, href: "/admin/publicites", label: "Publicités", detail: "Visuels de l’accueil" },
      { section: "statistiques" as const, href: "/admin/statistiques", label: "Statistiques", detail: "Fréquentation du site" },
      { section: "archives" as const, href: "/admin/archives", label: "Archives", detail: "Anciennes initiations" },
    ].filter(item => canAccessAdminSection(staff, item.section));
    if (items.length) groups.push({ label: "Gestion du golf", items });
    groups.push({ label: "Compte personnel", items: [{ href: "/admin/mon-compte", label: "Mon compte", detail: "Changer mon mot de passe" }] });
  }
  let contentSession = false;
  // Navigation only: each page and API keeps its own authorization checks.
  try {
      const db = openDb();
      try {
        const actor = await currentContentActor(db);
        if (actor) {
          contentSession = true;
          analyticsIdentity = { id: actor.id, role: actor.role };
          const items = [] as { href: string; label: string; detail: string }[];
          if (can(parseUserGrants(actor), actor.role, "view", "pages")) items.push({ href: "/admin/contenu", label: "Pages du site", detail: "Rédiger et publier" });
          if (can(parseUserGrants(actor), actor.role, "view", "media")) items.push({ href: "/admin/contenu/medias", label: "Médiathèque", detail: "Images et fichiers" });
          if (actor.role === "admin") {
            items.push({ href: "/admin/contenu/conditions", label: "Conditions avancées", detail: "États personnalisés" }, { href: "/admin/contenu/utilisateurs", label: "Utilisateurs et droits", detail: "Comptes de l’équipe" });
            if (!golfSession && !staff) items.push({ href: "/admin/statistiques", label: "Statistiques", detail: "Fréquentation du site" }, { href: "/admin", label: "Gestion du golf", detail: "Connexion administrateur" });
          }
          if (items.length) groups.push({ label: "Contenu du site", items });
        }
      } finally { db.close(); }
  } catch { /* The content pages report their own storage/configuration errors. */ }
  if (golfSession && !contentSession) groups.push({ label: "Contenu du site · accès dédié", items: [{ href: "/admin/contenu/connexion", label: "Pages et médias", detail: "Connexion personnelle" }] });
  return <AdminShell groups={groups} golfSession={golfSession} contentSession={contentSession} restaurantSession={restaurantSession} analyticsIdentity={analyticsIdentity}>{children}</AdminShell>;
}
