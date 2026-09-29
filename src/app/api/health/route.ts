import { NextResponse } from "next/server";

import { getContactFallbackQueueSnapshot } from "@/lib/contact/fallback-store";
import { hasValidOpsToken } from "@/lib/ops/auth";
import { getEnvironmentOverview } from "@/lib/ops/environment";
import { getServiceHealth } from "@/lib/ops/health";

export async function GET(request: Request) {
  const isInternalView = hasValidOpsToken(request, process.env.OPS_CRON_TOKEN);

  if (!isInternalView) {
    return NextResponse.json(
      {
        status: "ok",
        scope: "liveness",
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  const overview = getEnvironmentOverview();
  const publicStatus = await getServiceHealth();
  let fallbackQueue;
  try {
    fallbackQueue = await getContactFallbackQueueSnapshot();
  } catch {
    return NextResponse.json(
      { status: "degraded", services: publicStatus.services, scope: publicStatus.scope, fallbackQueue: "unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
  const internalStatus =
    publicStatus.status === "ok" && fallbackQueue.failed === 0 && fallbackQueue.pending === 0 ? "ok" : "degraded";

  return NextResponse.json(
    {
      status: internalStatus,
      services: publicStatus.services,
      checkedAt: publicStatus.checkedAt,
      scope: publicStatus.scope,
      environment: overview,
      fallbackQueue,
      generatedAt: new Date().toISOString(),
    },
    {
      status: internalStatus === "ok" ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
