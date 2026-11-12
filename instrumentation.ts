import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchLogRecordProcessor, LoggerProvider } from "@opentelemetry/sdk-logs";

const posthogToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN?.trim();
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim().replace(/\/$/, "");

if ((!posthogToken || !posthogHost) && process.env.NODE_ENV !== "production") {
  const missingVariable = !posthogToken
    ? "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN"
    : "NEXT_PUBLIC_POSTHOG_HOST";

  console.warn(
    `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`
  );
}

export const posthogLogProvider = posthogToken && posthogHost
  ? new LoggerProvider({
      resource: resourceFromAttributes({
        "service.name": "website-golfmarcilly",
      }),
      processors: [
        new BatchLogRecordProcessor({
          exporter: new OTLPLogExporter({
            url: `${posthogHost}/i/v1/logs`,
            timeoutMillis: 2_000,
            headers: {
              Authorization: `Bearer ${posthogToken}`,
              "Content-Type": "application/json",
            },
          }),
        }),
      ],
    })
  : undefined;

export function register() {
  // The dedicated provider is intentionally not global: only log lines added for PostHog use it.
}
