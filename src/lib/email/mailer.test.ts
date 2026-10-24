import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("SMTP keeps hostile display names separate from destination and reply addresses without sending", () => {
  const result = spawnSync(process.execPath, ["--conditions=react-server", "--import", "tsx", "--input-type=module", "-e", `
    import assert from 'node:assert/strict';
    import nodemailer from 'nodemailer';
    import { sendMail } from './src/lib/email/mailer.ts';
    const createTransport = nodemailer.createTransport.bind(nodemailer);
    let message;
    nodemailer.createTransport = () => ({ sendMail: async payload => {
      const compiled = await createTransport({ streamTransport: true, buffer: true }).sendMail(payload);
      message = { payload, envelope: compiled.envelope };
    }});
    const name = 'Test" <extra@example.net>, "Autre';
    await sendMail({ to: 'visitor@example.org', toName: name, replyTo: 'reply@example.org', replyToName: name, subject: 'Test', text: 'Test' });
    assert.deepEqual(message.envelope.to, ['visitor@example.org']);
    assert.deepEqual(message.payload.replyTo, { address: 'reply@example.org', name });
  `], {
    encoding: "utf8",
    env: { ...process.env, MAIL_PROVIDER: "smtp", SMTP_HOST: "smtp.invalid", SMTP_PORT: "587", SMTP_USER: "test", SMTP_PASS: "test", EMAIL_FROM: "sender@example.org", BREVO_API_KEY: "" },
  });
  assert.equal(result.status, 0, result.stderr);
});
