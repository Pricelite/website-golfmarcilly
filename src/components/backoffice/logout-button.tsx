"use client";

import { useRouter } from "next/navigation";
import posthog from "posthog-js";

export function LogoutButton() {
  const router = useRouter();
  return <button type="button" onClick={async () => {
    if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST) posthog.reset();
    await fetch("/api/backoffice/session", { method: "DELETE" });
    router.push("/admin/contenu/connexion");
    router.refresh();
  }} className="rounded-full border border-emerald-950/20 px-4 py-2 text-sm">Déconnexion</button>;
}
