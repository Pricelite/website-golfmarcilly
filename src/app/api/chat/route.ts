import { NextResponse } from "next/server";

import { selectChatKnowledge } from "@/data/chat-knowledge";
import { readJsonBody } from "@/lib/api/request-body";
import { buildChatInstructions, buildDemoReply, buildOpenAIInput, extractOpenAIText, parseChatTurns, parseModelReply } from "@/lib/chat/core";
import { consumeRateLimit, hasTrustedOrigin, parseClientIpFromHeaders } from "@/lib/security/request-guards";
import { chatAllowedPaths } from "@/lib/chat/shared";

export const runtime = "nodejs";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 12;
const MAX_REQUEST_BYTES = 12_000;
const MODEL = "gpt-6-luna";

export function GET() {
  return NextResponse.json(
    { mode: process.env.OPENAI_API_KEY?.trim() ? "ai" : "demo" },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request.headers, { fallbackHost: new URL(request.url).host, allowVercelPreview: true })) {
    return NextResponse.json({ error: "Cette demande ne provient pas du site du golf." }, { status: 403 });
  }

  const limit = await consumeRateLimit({
    namespace: "golf-chatbot",
    identifier: parseClientIpFromHeaders(request.headers),
    limit: RATE_LIMIT_MAX_REQUESTS,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: limit.unavailable ? "L’assistant est momentanément indisponible. Contactez le golf directement." : "Vous avez envoyé beaucoup de messages. Réessayez dans quelques minutes." },
      { status: limit.unavailable ? 503 : 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const body = await readJsonBody<Record<string, unknown>>(request, MAX_REQUEST_BYTES);
  if (!body.ok) {
    return NextResponse.json({ error: body.tooLarge ? "La conversation est trop longue. Recommencez une nouvelle discussion." : "Le message n’a pas pu être lu. Réessayez." }, { status: body.tooLarge ? 413 : 400 });
  }
  const turns = parseChatTurns(body.data.messages);
  if (!turns) {
    return NextResponse.json({ error: "Le message est vide ou trop long (800 caractères maximum)." }, { status: 400 });
  }

  const question = turns.at(-1)!.content;
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return NextResponse.json(buildDemoReply(question), { headers: { "Cache-Control": "no-store" } });

  const entries = selectChatKnowledge(question);
  const model = process.env.OPENAI_MODEL?.trim() || MODEL;
  try {
    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        ...(model === MODEL ? { reasoning: { effort: "none" } } : {}),
        instructions: buildChatInstructions(),
        input: [{ role: "user", content: buildOpenAIInput(turns, entries) }],
        max_output_tokens: 450,
        store: false,
        text: {
          format: {
            type: "json_schema",
            name: "golf_chat_reply",
            strict: true,
            schema: {
              type: "object",
              properties: {
                answer: { type: "string" },
                links: { type: "array", items: { type: "string", enum: [...chatAllowedPaths] } },
              },
              required: ["answer", "links"],
              additionalProperties: false,
            },
          },
        },
      }),
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: "L’assistant IA ne peut pas répondre pour le moment. Contactez le golf ou réessayez plus tard." }, { status: 503 });
    }
    const text = extractOpenAIText(await upstream.json());
    const reply = text ? parseModelReply(text, entries) : null;
    if (!reply) {
      return NextResponse.json({ error: "Je n’ai pas pu vérifier cette réponse. Reformulez votre question ou contactez le golf." }, { status: 502 });
    }
    return NextResponse.json(reply, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "La connexion à l’assistant IA a échoué. Réessayez dans un instant." }, { status: 503 });
  }
}
