import { NextResponse } from "next/server";

import { getContactFallbackQueueSnapshot } from "@/lib/contact/fallback-store";
import { hasValidOpsToken } from "@/lib/ops/auth";
import { getEnvironmentOverview } from "@/lib/ops/environment";
import { getServiceHealth } from "@/lib/ops/health";

export async function GET(request: Request) {
  const overview = getEnvironmentOverview();
  const publicStatus = await getServiceHealth();
  const isInternalView = hasValidOpsToken(request, process.env.OPS_CRON_TOKEN);

  if (!isInternalView) {
    return NextResponse.json(
      {
        status: publicStatus.status,
        services: publicStatus.services,
        checkedAt: publicStatus.checkedAt,
        scope: publicStatus.scope,
      },
      {
        status: publicStatus.status === "ok" ? 200 : 503,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  const fallbackQueue = await getContactFallbackQueueSnapshot();
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
