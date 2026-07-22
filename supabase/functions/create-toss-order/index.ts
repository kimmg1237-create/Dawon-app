import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return json({ error: "인증이 필요합니다." }, 401)
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!
    const userClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser()

    if (userError || !user) {
      return json({ error: "유효하지 않은 세션입니다." }, 401)
    }

    const body = (await req.json()) as {
      orderId?: string
      amount?: number
      product?: string
    }

    const orderId = body.orderId?.trim()
    const amount = body.amount
    const product = body.product === "b2b" ? "b2b" : "monthly"

    const PRICES: Record<string, number> = { monthly: 12900, b2b: 990000 }
    const expected = PRICES[product]
    if (!orderId || !amount || amount <= 0) {
      return json({ error: "orderId와 amount가 필요합니다." }, 400)
    }
    if (amount !== expected) {
      return json({ error: "결제 금액이 상품과 일치하지 않습니다." }, 400)
    }

    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const admin = createClient(supabaseUrl, serviceKey)

    const { error: insertError } = await admin.from("payment_orders").insert({
      order_id: orderId,
      user_id: user.id,
      amount,
      product,
      status: "pending",
    })

    if (insertError) {
      return json({ error: insertError.message }, 400)
    }

    return json({
      orderId,
      amount,
      customerKey: user.id.replace(/[^a-zA-Z0-9\-_=.]/g, "").slice(0, 50),
      product,
    })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "서버 오류" }, 500)
  }
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}
