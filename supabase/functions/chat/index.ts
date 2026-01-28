import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type ClientMsg = { role: "user" | "assistant"; content: string };

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json(401, { error: "Unauthorized" });
    }
    const token = authHeader.replace("Bearer ", "").trim();

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
      return json(500, { error: "Server misconfigured" });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      console.error("auth.getClaims failed", claimsError);
      return json(401, { error: "Unauthorized" });
    }

    const payload = await req.json().catch(() => null) as
      | { messages?: ClientMsg[]; mode?: "default" | "quality" }
      | null;
    const messages = payload?.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return json(400, { error: "Invalid payload" });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("Missing LOVABLE_API_KEY");
      return json(500, { error: "AI is not configured" });
    }

    const systemPrompt =
      "Aap AION GPT ho — duniya ke ek coding expert assistant. Aap HINDI me jawab doge, lekin commands/code ENGLISH me exactly. Termux-focused step-by-step guidance do. Format: (1) Short summary (2) Steps (3) Commands/Code blocks (4) Verification (5) Common errors & fixes. Unsafe/illegal help deny karo. IMPORTANT: Agar output bahut lamba ho aur aapko lagta hai ki stream cut ho sakta hai, to last line me exactly [[AION_CONTINUE]] likho. Continue karte waqt pehle ka text repeat mat karo.";

    const model = payload?.mode === "quality" ? "google/gemini-3-pro-preview" : "google/gemini-3-flash-preview";

    console.log("chat: streaming request", { msgCount: messages.length, userId: claimsData.claims.sub });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);

      if (response.status === 429) return json(429, { error: "Rate limit ho gaya—thoda wait karke try karein." });
      if (response.status === 402) return json(402, { error: "AI credits khatam—workspace me credits add karein." });

      return json(500, { error: "AI gateway error" });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat function error:", e);
    return json(500, { error: e instanceof Error ? e.message : "Unknown error" });
  }
});
