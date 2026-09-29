import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { isAdminAuthenticated } from "@/lib/initiation/admin-auth";

function isPublicAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname === "/admin/login" || pathname === "/admin/logout";
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/admin") && !isPublicAdminPath(pathname)) {
    const isAuthenticated = Boolean(process.env.ADMIN_PASSWORD) && await isAdminAuthenticated(request.cookies);
    if (!isAuthenticated) {
      const target = new URL("/admin", request.url);
      if (pathname === "/admin/competitions") target.searchParams.set("next", pathname);
      return NextResponse.redirect(target);
    }
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
