import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const TOSS_CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm"

async function logEvent(
  admin: SupabaseClient,
  orderId: string,
  eventType: string,
  payload: Record<string, unknown> = {},
) {
  await admin.from("order_events").insert({ order_id: orderId, event_type: eventType, payload })
}

function receiptNo(orderId: string) {
  const d = new Date()
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`
  const tail = orderId.replace(/[^a-zA-Z0-9]/g, "").slice(-8).toUpperCase()
  return `DW-${ymd}-${tail}`
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
      return json({
        message: "이미 처리된 결제입니다.",
        paymentKey: order.payment_key,
        orderId,
        product: order.product,
        productName: order.product_name,
        receiptNo: order.receipt_no,
      })
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
        .update({
          status: "failed",
          raw_response: confirmBody,
          fail_code: confirmBody.code ?? "",
          fail_message: confirmBody.message ?? "",
        })
        .eq("order_id", orderId)
      await logEvent(admin, orderId, "payment_failed", confirmBody as Record<string, unknown>)
      return json({
        error: confirmBody.message ?? confirmBody.code ?? "토스 결제 승인 실패",
      }, 400)
    }

    const isBook = order.product === "sotong" || order.product === "healing"
    const isPaper = isBook && order.book_format === "paper"
    const now = new Date().toISOString()
    const issuedReceipt = order.receipt_no || receiptNo(orderId)

    if (!isBook) {
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
        updated_at: now,
      })

      if (subError) {
        return json({ error: `결제는 승인됐으나 구독 반영 실패: ${subError.message}` }, 500)
      }
    } else if (!isPaper) {
      await admin.from("user_entitlements").upsert(
        {
          user_id: user.id,
          product: order.product,
          order_id: orderId,
          granted_at: now,
        },
        { onConflict: "order_id" },
      )
    }

    await admin
      .from("payment_orders")
      .update({
        status: "paid",
        payment_key: paymentKey,
        paid_at: now,
        raw_response: confirmBody,
        receipt_no: issuedReceipt,
        fulfillment_status: isPaper ? "pending" : "fulfilled",
        fulfilled_at: isPaper ? null : now,
      })
      .eq("order_id", orderId)

    await logEvent(admin, orderId, "paid", {
      paymentKey,
      method: confirmBody.method,
      approvedAt: confirmBody.approvedAt,
    })
    await logEvent(admin, orderId, isPaper ? "shipping_queued" : "fulfilled", {
      kind: isPaper ? "paper_book" : isBook ? "ebook" : "subscription",
      receiptNo: issuedReceipt,
    })

    return json({
      message: isPaper
        ? "종이책 주문이 완료되었습니다. 마이페이지에서 배송지를 확인할 수 있습니다."
        : isBook
          ? "전자책 주문이 완료되었습니다. 서재와 마이페이지에서 확인할 수 있습니다."
          : "결제가 완료되었고 구독이 활성화되었습니다.",
      paymentKey,
      orderId,
      product: order.product,
      productName: order.product_name,
      receiptNo: issuedReceipt,
      buyerName: order.buyer_name,
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
