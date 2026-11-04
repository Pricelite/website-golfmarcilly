import { handleFeedback } from "@/lib/admin-feedback/handler";

export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  return handleFeedback(request);
}
