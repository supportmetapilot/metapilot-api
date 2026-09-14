import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Fallback coupon dictionary
const DEFAULT_COUPONS = {
  WELCOME25: 25,
  KEFKQ30: 30,
  NCLAW40: 40,
  LXNQI50: 50,
  LWIDL60: 60,
  KXKSX80: 80,
  KCKSH90: 19,
  FLSPF99: 99,
  LDJRV100: 100,
  LLKO85: 85,
};

async function getCouponsMap() {
  try {
    const { data, error } = await supabase
      .from("coupons")
      .select("code, discount_percent")
      .eq("is_active", true);

    if (error || !data || data.length === 0) {
      return DEFAULT_COUPONS;
    }

    const map = {};
    for (const item of data) {
      if (item.code) {
        map[item.code.toUpperCase()] = Number(item.discount_percent);
      }
    }
    return map;
  } catch (_) {
    return DEFAULT_COUPONS;
  }
}

/**
 * GET /api/coupons
 * Returns list/dictionary of all active coupons
 */
export async function GET(request) {
  const coupons = await getCouponsMap();
  return NextResponse.json({
    success: true,
    coupons: coupons,
  });
}

/**
 * POST /api/coupons
 * Validates a single coupon code (Go & Pro compatible)
 */
export async function POST(request) {
  try {
    let body;
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      body = Object.fromEntries(params.entries());
    } else {
      body = await request.json();
    }

    const rawCoupon = (body.coupon || body.code || "").toUpperCase().trim();
    if (!rawCoupon) {
      return NextResponse.json({ success: false, error: "Please provide a coupon code" }, { status: 400 });
    }

    const coupons = await getCouponsMap();

    if (coupons[rawCoupon] !== undefined) {
      return NextResponse.json({
        success: true,
        valid: true,
        discount: coupons[rawCoupon],
        code: rawCoupon,
      });
    }

    return NextResponse.json({
      success: false,
      valid: false,
      error: "Invalid coupon code",
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
