import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminShell, type AdminNavigationGroup } from "@/components/admin/admin-shell";
import { isAdminAuthenticated } from "@/lib/initiation/admin-auth";
import { COOKIE_NAME, actorFromToken } from "@/lib/backoffice/auth";
import { openDb, parseUserGrants } from "@/lib/backoffice/db";
import { can } from "@/lib/backoffice/model";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const golfSession = Boolean(process.env.ADMIN_PASSWORD?.trim()) && await isAdminAuthenticated(jar);
  const groups: AdminNavigationGroup[] = [];
  if (golfSession) groups.push({ label: "Gestion du golf", items: [
    { href: "/admin", label: "Tableau de bord", detail: "Les accès essentiels" },
    { href: "/admin/competitions", label: "Calendrier", detail: "Compétitions et animations" },
    { href: "/admin/restaurant", label: "Restaurant", detail: "Carte et plat du jour" },
    { href: "/admin/site-conditions", label: "État du golf", detail: "Parcours et services" },
    { href: "/admin/statistiques", label: "Statistiques", detail: "Fréquentation du site" },
    { href: "/admin/archives", label: "Archives des initiations", detail: "Consulter les anciens dossiers" },
  ] });
  let contentSession = false;
  // Navigation only: each page and API keeps its own authorization checks.
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) {
    try {
      const db = openDb();
      try {
        const actor = actorFromToken(db, token);
        if (actor) {
          contentSession = true;
          const items = [{ href: "/admin/contenu", label: "Pages du site", detail: "Rédiger et publier" }];
          if (can(parseUserGrants(actor), actor.role, "view", "media")) items.push({ href: "/admin/contenu/medias", label: "Médiathèque", detail: "Images et fichiers" });
          if (actor.role === "admin") {
            items.push({ href: "/admin/contenu/conditions", label: "Conditions avancées", detail: "États personnalisés" }, { href: "/admin/contenu/utilisateurs", label: "Utilisateurs et droits", detail: "Comptes de l’équipe" });
            if (!golfSession) items.push({ href: "/admin/statistiques", label: "Statistiques", detail: "Fréquentation du site" }, { href: "/admin", label: "Gestion du golf", detail: "Connexion administrateur" });
          }
          groups.push({ label: "Contenu du site", items });
        }
      } finally { db.close(); }
    } catch { /* The content pages report their own storage/configuration errors. */ }
  }
  if (golfSession && !contentSession) groups.push({ label: "Contenu du site · accès dédié", items: [{ href: "/admin/contenu/connexion", label: "Pages et médias", detail: "Connexion personnelle" }] });
  return <AdminShell groups={groups} golfSession={golfSession} contentSession={contentSession}>{children}</AdminShell>;
}
