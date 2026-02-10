import "server-only";

import nodemailer from "nodemailer";

type SendMailParams = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
};

type MailerConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

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

function getMailerConfig(): MailerConfig {
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

export async function sendMail({
  to,
  subject,
  text,
  replyTo,
}: SendMailParams): Promise<void> {
  const config = getMailerConfig();
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

  try {
    await transporter.sendMail({
      from: config.from,
      to,
      subject,
      text,
      replyTo,
    });
  } catch (error) {
    throw normalizeMailerError(error);
  }
}
