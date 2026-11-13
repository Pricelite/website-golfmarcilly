"use client";

import { useRouter } from "next/navigation";
import { resetPostHogIdentity } from "@/lib/analytics/posthog-client";

export function LogoutButton() {
  const router = useRouter();
  return <button type="button" onClick={async () => {
    resetPostHogIdentity();
    await fetch("/api/backoffice/session", { method: "DELETE" });
    router.push("/admin/contenu/connexion");
    router.refresh();
  }} className="rounded-full border border-emerald-950/20 px-4 py-2 text-sm">Déconnexion</button>;
}
