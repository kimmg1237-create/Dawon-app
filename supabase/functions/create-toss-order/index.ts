import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const PRICES: Record<string, number> = { monthly: 12900, b2b: 990000, sotong: 13000, healing: 13000 }
const LABELS: Record<string, string> = {
  monthly: "월 구독 (30일)",
  b2b: "기관·B2B 이용권",
  sotong: "자신과의 소통",
  healing: "힐링게임",
}

function parseProduct(raw?: string) {
  if (raw === "b2b" || raw === "sotong" || raw === "healing") return raw
  return "monthly"
}

async function logEvent(
  admin: SupabaseClient,
  orderId: string,
  eventType: string,
  payload: Record<string, unknown> = {},
) {
  await admin.from("order_events").insert({ order_id: orderId, event_type: eventType, payload })
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
      action?: string
      orderId?: string
      amount?: number
      product?: string
      buyer?: { name?: string; email?: string; phone?: string }
      format?: string
      shipping?: { zip?: string; address1?: string; address2?: string; receiverName?: string }
      failCode?: string
      failMessage?: string
    }

    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const admin = createClient(supabaseUrl, serviceKey)

    if (body.action === "fail") {
      const orderId = body.orderId?.trim()
      if (!orderId) return json({ error: "orderId가 필요합니다." }, 400)
      const { data: order } = await admin.from("payment_orders").select("*").eq("order_id", orderId).maybeSingle()
      if (!order || order.user_id !== user.id) {
        return json({ error: "주문을 찾을 수 없습니다." }, 404)
      }
      if (order.status === "paid" || order.status === "refunded") {
        return json({ message: "이미 처리된 주문입니다.", orderId })
      }
      await admin
        .from("payment_orders")
        .update({
          status: "failed",
          fail_code: (body.failCode || "").slice(0, 80),
          fail_message: (body.failMessage || "").slice(0, 500),
        })
        .eq("order_id", orderId)
      await logEvent(admin, orderId, "payment_failed", {
        code: body.failCode || "",
        message: body.failMessage || "",
      })
      return json({ message: "결제 실패가 주문에 기록되었습니다.", orderId })
    }

    const orderId = body.orderId?.trim()
    const amount = Number(body.amount)
    const product = parseProduct(body.product)
    const expected = PRICES[product]
    const name = (body.buyer?.name || "").trim()
    const email = (body.buyer?.email || user.email || "").trim().toLowerCase()
    const phone = (body.buyer?.phone || "").replace(/[^\d]/g, "")

    if (!orderId || !Number.isFinite(amount) || amount <= 0) {
      return json({ error: "orderId와 amount가 필요합니다." }, 400)
    }
    if (amount !== expected) {
      return json(
        { error: `결제 금액이 상품과 일치하지 않습니다. (요청 ${amount}원 / 기대 ${expected}원)` },
        400,
      )
    }
    const isBook = product === "sotong" || product === "healing"
    const format = isBook && body.format === "paper" ? "paper" : isBook ? "ebook" : "none"
    const zip = (body.shipping?.zip || "").replace(/[^\d]/g, "").slice(0, 6)
    const address1 = (body.shipping?.address1 || "").trim()
    const address2 = (body.shipping?.address2 || "").trim()
    const receiver = (body.shipping?.receiverName || name).trim()

    if (name.length < 2 || !email.includes("@") || phone.length < 9) {
      return json({ error: "주문자 이름·이메일·연락처를 입력해 주세요." }, 400)
    }
    if (format === "paper" && (zip.length < 5 || !address1 || !address2)) {
      return json({ error: "종이책은 받는 분 주소(우편번호·기본·상세)가 필요합니다." }, 400)
    }

    const formatLabel = format === "paper" ? "종이책" : format === "ebook" ? "전자책" : ""
    const productName = formatLabel ? `${LABELS[product]} (${formatLabel})` : LABELS[product]
    const now = new Date().toISOString()
    const orderSheet = {
      product,
      productName,
      format,
      amount,
      quantity: 1,
      currency: "KRW",
      buyer: { name, email, phone },
      shipping: format === "paper" ? { zip, address1, address2, receiver } : null,
      userId: user.id,
      createdAt: now,
    }

    const { error: insertError } = await admin.from("payment_orders").insert({
      order_id: orderId,
      user_id: user.id,
      amount,
      product,
      product_name: productName,
      quantity: 1,
      status: "pending",
      fulfillment_status: "pending",
      book_format: format,
      buyer_name: name,
      buyer_email: email,
      buyer_phone: phone,
      ship_zip: format === "paper" ? zip : null,
      ship_address1: format === "paper" ? address1 : null,
      ship_address2: format === "paper" ? address2 : null,
      ship_receiver: format === "paper" ? receiver : null,
      agreed_terms_at: now,
      agreed_digital_at: now,
      order_sheet: orderSheet,
    })

    if (insertError) {
      const msg = insertError.message || ""
      if (/column .* does not exist/i.test(msg)) {
        return json(
          { error: "주문 테이블 컬럼이 없습니다. supabase/orders.sql 을 실행해 주세요." },
          400,
        )
      }
      if (/relation .*payment_orders.* does not exist|Could not find the table/i.test(msg)) {
        return json(
          { error: "payment_orders 테이블이 없습니다. supabase/payments.sql 을 실행해 주세요." },
          400,
        )
      }
      return json({ error: `주문 저장 실패: ${msg}` }, 400)
    }

    await admin.from("buyer_profiles").upsert({
      user_id: user.id,
      name,
      email,
      phone,
      zip: zip || "",
      address1: address1 || "",
      address2: address2 || "",
      receiver_name: receiver || name,
      updated_at: now,
    })

    await logEvent(admin, orderId, "order_created", orderSheet)
    await logEvent(admin, orderId, "payment_requested", { amount, product })

    return json({
      orderId,
      amount,
      customerKey: user.id.replace(/[^a-zA-Z0-9\-_=.]/g, "").slice(0, 50),
      product,
      productName,
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
