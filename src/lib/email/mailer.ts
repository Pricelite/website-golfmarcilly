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
  user: string;
  pass: string;
  from: string;
};

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error("Email configuration is incomplete.");
  }

  return value;
}

function getMailerConfig(): MailerConfig {
  const host = getRequiredEnv("SMTP_HOST");
  const portRaw = getRequiredEnv("SMTP_PORT");
  const user = getRequiredEnv("SMTP_USER");
  const pass = getRequiredEnv("SMTP_PASS");
  const from = getRequiredEnv("EMAIL_FROM");
  const port = Number.parseInt(portRaw, 10);

  if (Number.isNaN(port)) {
    throw new Error("Email configuration is incomplete.");
  }

  return { host, port, user, pass, from };
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
    secure: config.port === 465,
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
  } catch {
    throw new Error("Unable to send email at the moment.");
  }
}
