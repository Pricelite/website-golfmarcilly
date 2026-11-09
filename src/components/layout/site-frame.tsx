"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "./header";
import { MobileActions } from "./mobile-actions";

/** Keep the public navigation out of the administration workspace. */
export function SiteFrame({ children, footer, preview }: { children: ReactNode; footer: ReactNode; preview: ReactNode }) {
  const pathname = usePathname();
  const admin = pathname === "/admin" || pathname.startsWith("/admin/");
  return <div className={admin ? undefined : "pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-0"}>
    {!admin ? <Header /> : null}
    {preview}
    <main id="main-content">{children}</main>
    {!admin ? <>{footer}<MobileActions /></> : null}
  </div>;
}
