import { SeverityNumber } from "@opentelemetry/api-logs";
import { after } from "next/server";

import { posthogLogProvider } from "../../../instrumentation";

type FormKind = "contact" | "newsletter";

const formDeliveryLogger = posthogLogProvider?.getLogger("website-golfmarcilly.form-delivery");

function flushPostHogLogs(): void {
  const provider = posthogLogProvider;
  if (!provider) {
    return;
  }

  after(async () => {
    await provider.forceFlush().catch(() => {});
  });
}

export function logFormMailDeliveryCompleted(formKind: FormKind, queued: boolean): void {
  formDeliveryLogger?.emit({
    body: "form_mail_delivery_completed",
    severityNumber: SeverityNumber.INFO,
    attributes: {
      form_kind: formKind,
      delivery_mode: queued ? "fallback_queue" : "email",
    },
  });
  flushPostHogLogs();
}

export function logFormMailDeliveryFailed(formKind: FormKind, errorCode: string): void {
  formDeliveryLogger?.emit({
    body: "form_mail_delivery_failed",
    severityNumber: SeverityNumber.ERROR,
    attributes: {
      form_kind: formKind,
      error_code: errorCode,
    },
  });
  flushPostHogLogs();
}
