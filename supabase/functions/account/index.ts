// 好食光：帳號管理（刪除自己的帳號、管理員停用／恢復會員）
// 用官方的帳號管理 API，需要 service role，所以放在伺服器端
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

  // 確認是誰在呼叫
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: who, error: whoErr } = await admin.auth.getUser(token);
  if (whoErr || !who.user) return json({ error: "not signed in" }, 401);
  const me = who.user;

  let body: { action?: string; target?: string; ban?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad json" }, 400);
  }

  if (body.action === "delete_me") {
    const { error } = await admin.auth.admin.deleteUser(me.id);
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  if (body.action === "ban") {
    const { data: prof } = await admin.from("profiles").select("role").eq("id", me.id).single();
    if (prof?.role !== "admin") return json({ error: "admin only" }, 403);
    if (!body.target || body.target === me.id) return json({ error: "invalid target" }, 400);
    const { error } = await admin.auth.admin.updateUserById(body.target, { ban_duration: body.ban ? "876000h" : "none" });
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  return json({ error: "unknown action" }, 400);
});
