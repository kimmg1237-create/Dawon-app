import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const TOSS_CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm"

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return json({ error: "인증이 필요합니다." }, 401)
    }

    const tossSecret = Deno.env.get("TOSS_SECRET_KEY")
    if (!tossSecret) {
      return json({ error: "TOSS_SECRET_KEY가 설정되지 않았습니다." }, 500)
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
      paymentKey?: string
      orderId?: string
      amount?: number
    }

    const paymentKey = body.paymentKey?.trim()
    const orderId = body.orderId?.trim()
    const amount = body.amount

    if (!paymentKey || !orderId || amount == null) {
      return json({ error: "paymentKey, orderId, amount가 필요합니다." }, 400)
    }

    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const admin = createClient(supabaseUrl, serviceKey)

    const { data: order, error: orderError } = await admin
      .from("payment_orders")
      .select("*")
      .eq("order_id", orderId)
      .maybeSingle()

    if (orderError || !order) {
      return json({ error: "주문을 찾을 수 없습니다." }, 404)
    }

    if (order.user_id !== user.id) {
      return json({ error: "주문 소유자가 일치하지 않습니다." }, 403)
    }

    if (order.status === "paid") {
      return json({ message: "이미 처리된 결제입니다." })
    }

    if (order.amount !== amount) {
      return json({ error: "결제 금액이 주문과 일치하지 않습니다." }, 400)
    }

    const encoded = btoa(`${tossSecret}:`)
    const confirmRes = await fetch(TOSS_CONFIRM_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${encoded}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    })

    const confirmBody = await confirmRes.json()

    if (!confirmRes.ok) {
      await admin
        .from("payment_orders")
        .update({ status: "failed", raw_response: confirmBody })
        .eq("order_id", orderId)

      return json({
        error: confirmBody.message ?? confirmBody.code ?? "토스 결제 승인 실패",
      }, 400)
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const { data: existing } = await admin
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    const { error: subError } = await admin.from("user_subscriptions").upsert({
      user_id: user.id,
      plan: order.product === "b2b" ? "b2b" : "monthly",
      status: "active",
      expires_at: order.product === "b2b" ? null : expiresAt.toISOString(),
      trial_ends_at: existing?.trial_ends_at ?? null,
      ad_access_until: null,
      source: "toss",
      external_id: paymentKey,
      updated_at: new Date().toISOString(),
    })

    if (subError) {
      return json({ error: `결제는 승인됐으나 구독 반영 실패: ${subError.message}` }, 500)
    }

    await admin
      .from("payment_orders")
      .update({
        status: "paid",
        payment_key: paymentKey,
        paid_at: new Date().toISOString(),
        raw_response: confirmBody,
      })
      .eq("order_id", orderId)

    return json({
      message: "결제가 완료되었고 구독이 활성화되었습니다.",
      paymentKey,
      orderId,
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
