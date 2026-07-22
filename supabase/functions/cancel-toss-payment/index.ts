import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const TOSS_CANCEL_URL = "https://api.tosspayments.com/v1/payments"

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
      orderId?: string
      cancelReason?: string
    }

    const orderId = body.orderId?.trim()
    const cancelReason = (body.cancelReason || "고객 청약철회·환불 요청").slice(0, 200)

    if (!orderId) {
      return json({ error: "orderId가 필요합니다." }, 400)
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

    if (order.status === "refunded" || order.status === "cancelled") {
      return json({ message: "이미 환불·취소된 결제입니다.", orderId })
    }

    if (order.status !== "paid" || !order.payment_key) {
      return json({ error: "환불 가능한 결제 상태가 아닙니다." }, 400)
    }

    const { data: sub } = await admin
      .from("user_subscriptions")
      .select("content_first_used_at")
      .eq("user_id", user.id)
      .maybeSingle()

    const paidAt = order.paid_at ? new Date(order.paid_at).getTime() : 0
    const coolingMs = 7 * 24 * 60 * 60 * 1000
    const withinCooling = Date.now() - paidAt <= coolingMs
    const contentUsed = Boolean(sub?.content_first_used_at)

    if (!withinCooling) {
      return json({
        error:
          "결제일로부터 7일이 지나 자동 환불이 제한됩니다. 서비스 하자 등은 고객센터로 문의해 주세요.",
        code: "cooling_off_expired",
      }, 400)
    }

    if (contentUsed) {
      return json({
        error:
          "디지털 콘텐츠를 이미 이용하여 청약철회가 제한됩니다. 오결제·장애는 고객센터로 문의해 주세요.",
        code: "used_digital",
      }, 400)
    }

    const encoded = btoa(`${tossSecret}:`)
    const cancelRes = await fetch(`${TOSS_CANCEL_URL}/${order.payment_key}/cancel`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${encoded}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cancelReason }),
    })

    const cancelBody = await cancelRes.json()

    if (!cancelRes.ok) {
      await admin.from("refund_requests").insert({
        user_id: user.id,
        order_id: orderId,
        amount: order.amount,
        status: "rejected",
        decision_code: "toss_cancel_failed",
        reason: cancelReason,
        admin_note: cancelBody.message ?? cancelBody.code ?? "toss cancel failed",
        processed_at: new Date().toISOString(),
      })

      return json({
        error: cancelBody.message ?? cancelBody.code ?? "토스 결제 취소 실패",
      }, 400)
    }

    await admin
      .from("payment_orders")
      .update({
        status: "refunded",
        refunded_at: new Date().toISOString(),
        refund_reason: cancelReason,
        raw_response: cancelBody,
      })
      .eq("order_id", orderId)

    await admin.from("user_subscriptions").upsert({
      user_id: user.id,
      plan: "free",
      status: "cancelled",
      expires_at: new Date().toISOString(),
      cancel_at_period_end: false,
      cancelled_at: new Date().toISOString(),
      source: "toss",
      updated_at: new Date().toISOString(),
    })

    await admin.from("refund_requests").insert({
      user_id: user.id,
      order_id: orderId,
      amount: order.amount,
      status: "completed",
      decision_code: "full_unused",
      reason: cancelReason,
      processed_at: new Date().toISOString(),
    })

    return json({
      message: "환불이 완료되었습니다. 카드사 반영까지 영업일 기준 3~7일 정도 걸릴 수 있습니다.",
      orderId,
      amount: order.amount,
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
