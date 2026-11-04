// 好食光：拍照辨識健身器材，回傳這台能做的動作
// 需要在 Supabase 的 Edge Function Secrets 設定 ANTHROPIC_API_KEY
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Anthropic from "npm:@anthropic-ai/sdk";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

interface Candidate {
  id: string;
  zh: string;
  en?: string;
}

const SCHEMA = {
  type: "object",
  properties: {
    machine: { type: "string", description: "器材的繁體中文名稱，例如「坐姿划船機」「登階機」" },
    confidence: { type: "string", enum: ["high", "medium", "low"] },
    exerciseIds: { type: "array", items: { type: "string" }, description: "清單裡能在這台器材上做的動作 id，最可能的排前面，最多 5 個" },
  },
  required: ["machine", "confidence", "exerciseIds"],
  additionalProperties: false,
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return json({ error: "no_key" }, 503);

  let body: { image?: string; mediaType?: string; candidates?: Candidate[] } = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad json" }, 400);
  }
  const image = body.image ?? "";
  const candidates = (body.candidates ?? []).slice(0, 400);
  if (!image || image.length > 4_000_000 || !candidates.length) return json({ error: "bad request" }, 400);
  const mediaType = body.mediaType === "image/png" || body.mediaType === "image/webp" ? body.mediaType : "image/jpeg";

  const list = candidates.map((c) => `${c.id}｜${c.zh}${c.en ? `｜${c.en}` : ""}`).join("\n");
  const client = new Anthropic({ apiKey: key });
  try {
    // deno-lint-ignore no-explicit-any
    const res: any = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
      system:
        "你會看到一張健身房器材的照片。判斷它是什麼器材，並從使用者給的動作清單中挑出可以在這台器材上做的動作 id（只能用清單裡的 id）。看不出來或照片不是健身器材時，confidence 填 low、exerciseIds 給空陣列。",
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: image } },
            { type: "text", text: `動作清單（id｜中文｜英文）：\n${list}` },
          ],
        },
      ],
    // deno-lint-ignore no-explicit-any
    } as any);
    if (res.stop_reason === "refusal") return json({ error: "refused" }, 422);
    const text = (res.content ?? []).find((b: { type: string }) => b.type === "text")?.text ?? "{}";
    const out = JSON.parse(text) as { machine: string; confidence: string; exerciseIds: string[] };
    const valid = new Set(candidates.map((c) => c.id));
    return json({ machine: out.machine, confidence: out.confidence, exerciseIds: out.exerciseIds.filter((id) => valid.has(id)).slice(0, 5) });
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});
