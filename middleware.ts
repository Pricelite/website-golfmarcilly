import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { isAdminAuthenticated } from "@/lib/initiation/admin-auth";

function isPublicAdminPath(pathname: string): boolean {
  return (
    pathname === "/admin" ||
    pathname === "/admin/login" ||
    pathname === "/admin/logout"
  );
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/images/") ||
    pathname.startsWith("/restaurant/") ||
    pathname === "/sarahgratte.png"
  ) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (pathname.startsWith("/admin") && !isPublicAdminPath(pathname)) {
    const isAuthenticated = await isAdminAuthenticated(request.cookies);
    if (!isAuthenticated) {
      const target = new URL("/admin", request.url);
      return NextResponse.redirect(target);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/images/:path*",
    "/restaurant/:path*",
    "/sarahgratte.png",
    "/admin/:path*",
  ],
};
