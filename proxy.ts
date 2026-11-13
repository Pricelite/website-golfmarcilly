import type { NextRequest } from "next/server";
import { proxy as siteProxy } from "./src/proxy";

// Les pages et API vérifient ensuite leurs droits propres à chaque rubrique.
export function proxy(request: NextRequest) {
  return siteProxy(request);
}

export const config = { matcher: "/:path*" };
