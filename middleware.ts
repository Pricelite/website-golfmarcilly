import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/images/") ||
    pathname.startsWith("/restaurant/") ||
    pathname === "/sarahgratte.png"
  ) {
    return new NextResponse("Not found", { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/images/:path*", "/restaurant/:path*", "/sarahgratte.png"],
};
