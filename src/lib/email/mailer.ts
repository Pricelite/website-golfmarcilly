import "server-only";

import nodemailer from "nodemailer";

type SendMailParams = {
  to: string;
  toName?: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  replyToName?: string;
};

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

type BrevoConfig = {
  apiKey: string;
  fromEmail: string;
  fromName?: string;
};

type MailProvider = "smtp" | "brevo";

export class MailerError extends Error {
  code: "config" | "auth" | "network" | "send";

  constructor(code: "config" | "auth" | "network" | "send", message: string) {
    super(message);
    this.name = "MailerError";
    this.code = code;
  }
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new MailerError("config", "Email configuration is incomplete.");
  }

  return value;
}

function parseSecureSetting(port: number): boolean {
  const raw = process.env.SMTP_SECURE;

  if (raw === "true") {
    return true;
  }

  if (raw === "false") {
    return false;
  }

  return port === 465;
}

function getSmtpConfig(): SmtpConfig {
  const host = getRequiredEnv("SMTP_HOST");
  const portRaw = getRequiredEnv("SMTP_PORT");
  const user = getRequiredEnv("SMTP_USER");
  const pass = getRequiredEnv("SMTP_PASS");
  const from = getRequiredEnv("EMAIL_FROM");
  const port = Number.parseInt(portRaw, 10);

  if (Number.isNaN(port)) {
    throw new MailerError("config", "Email configuration is incomplete.");
  }

  const secure = parseSecureSetting(port);

  return { host, port, secure, user, pass, from };
}

function getBrevoConfig(): BrevoConfig {
  const apiKey = getRequiredEnv("BREVO_API_KEY");
  const fromEmail = getRequiredEnv("EMAIL_FROM");
  const fromName = process.env.EMAIL_FROM_NAME?.trim();

  return {
    apiKey,
    fromEmail,
    fromName: fromName && fromName.length > 0 ? fromName : undefined,
  };
}

function getMailProvider(): MailProvider {
  const raw = process.env.MAIL_PROVIDER?.trim().toLowerCase();
  if (raw === "brevo") {
    return "brevo";
  }

  if (raw === "smtp") {
    return "smtp";
  }

  if (process.env.BREVO_API_KEY?.trim()) {
    return "brevo";
  }

  return "smtp";
}

function normalizeMailerError(error: unknown): MailerError {
  const err = error as {
    code?: string;
    responseCode?: number;
    message?: string;
    response?: string;
  };
  const response = err.response || "";
  const message = err.message || "Unable to send email at the moment.";

  if (
    err.code === "EAUTH" ||
    err.responseCode === 535 ||
    response.includes("5.7.139")
  ) {
    return new MailerError("auth", message);
  }

  if (
    err.code === "ECONNECTION" ||
    err.code === "ETIMEDOUT" ||
    err.code === "ESOCKET" ||
    err.code === "ECONNREFUSED" ||
    err.code === "ENOTFOUND"
  ) {
    return new MailerError("network", message);
  }

  return new MailerError("send", message);
}

function getSafeErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "Unable to send email at the moment.";
  }

  const candidate = payload as { message?: unknown; code?: unknown };
  const message =
    typeof candidate.message === "string" ? candidate.message : undefined;
  const code = typeof candidate.code === "string" ? candidate.code : undefined;

  if (message && code) {
    return `${message} (${code})`;
  }

  if (message) {
    return message;
  }

  return "Unable to send email at the moment.";
}

async function sendViaBrevo({
  to,
  toName,
  subject,
  text,
  html,
  replyTo,
  replyToName,
}: SendMailParams): Promise<void> {
  const config = getBrevoConfig();
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": config.apiKey,
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        email: config.fromEmail,
        ...(config.fromName ? { name: config.fromName } : {}),
      },
      to: [{ email: to, ...(toName ? { name: toName } : {}) }],
      subject,
      textContent: text,
      ...(html ? { htmlContent: html } : {}),
      ...(replyTo
        ? {
            replyTo: {
              email: replyTo,
              ...(replyToName ? { name: replyToName } : {}),
            },
          }
        : {}),
    }),
  });

  if (response.ok) {
    return;
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    // Ignore JSON parsing errors and keep a generic message.
  }

  const message = getSafeErrorMessage(payload);

  if (response.status === 401 || response.status === 403) {
    throw new MailerError("auth", message);
  }

  if (response.status === 400 || response.status === 422) {
    throw new MailerError("config", message);
  }

  if (response.status === 429 || response.status >= 500) {
    throw new MailerError("network", message);
  }

  throw new MailerError("send", message);
}

async function sendViaSmtp({
  to,
  toName,
  subject,
  text,
  html,
  replyTo,
  replyToName,
}: SendMailParams): Promise<void> {
  const config = getSmtpConfig();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    requireTLS: !config.secure,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: {
      servername: config.host,
    },
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transporter.sendMail({
    from: config.from,
    to: toName ? `"${toName}" <${to}>` : to,
    subject,
    text,
    ...(html ? { html } : {}),
    ...(replyTo
      ? {
          replyTo: replyToName
            ? `"${replyToName}" <${replyTo}>`
            : replyTo,
        }
      : {}),
  });
}

export async function sendMail({
  to,
  toName,
  subject,
  text,
  html,
  replyTo,
  replyToName,
}: SendMailParams): Promise<void> {
  try {
    const provider = getMailProvider();
    if (provider === "brevo") {
      await sendViaBrevo({
        to,
        toName,
        subject,
        text,
        html,
        replyTo,
        replyToName,
      });
      return;
    }

    await sendViaSmtp({
      to,
      toName,
      subject,
      text,
      html,
      replyTo,
      replyToName,
    });
  } catch (error) {
    if (error instanceof MailerError) {
      throw error;
    }

    throw normalizeMailerError(error);
  }
}
