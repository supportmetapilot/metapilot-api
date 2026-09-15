import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
};

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
    // Select all coupons that are not explicitly disabled (handles true or null)
    const { data, error } = await supabase
      .from("coupons")
      .select("code, discount_percent, is_active")
      .neq("is_active", false);

    if (error || !data || data.length === 0) {
      return DEFAULT_COUPONS;
    }

    const map = {};
    for (const item of data) {
      if (item.code) {
        map[item.code.trim().toUpperCase()] = Number(item.discount_percent);
      }
    }
    return map;
  } catch (_) {
    return DEFAULT_COUPONS;
  }
}

/**
 * GET /api/coupons
 * Returns live list/dictionary of all active coupons with zero caching
 */
export async function GET(request) {
  const coupons = await getCouponsMap();
  return NextResponse.json(
    {
      success: true,
      coupons: coupons,
    },
    { headers: NO_CACHE_HEADERS }
  );
}

/**
 * POST /api/coupons
 * Validates a single coupon code with direct live database lookup
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
      return NextResponse.json(
        { success: false, error: "Please provide a coupon code" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // 1. Direct Live Query from Supabase table for instant edit reflection
    try {
      const { data: dbCoupons, error: dbErr } = await supabase
        .from("coupons")
        .select("code, discount_percent, is_active")
        .ilike("code", rawCoupon)
        .neq("is_active", false)
        .limit(1);

      if (!dbErr && dbCoupons && dbCoupons.length > 0) {
        const found = dbCoupons[0];
        const discountVal = Number(found.discount_percent);
        return NextResponse.json(
          {
            success: true,
            valid: true,
            discount: discountVal,
            code: found.code.trim().toUpperCase(),
          },
          { headers: NO_CACHE_HEADERS }
        );
      }
    } catch (_) {
      // Continue to fallback
    }

    // 2. Fallback to full active map
    const coupons = await getCouponsMap();
    if (coupons[rawCoupon] !== undefined) {
      return NextResponse.json(
        {
          success: true,
          valid: true,
          discount: coupons[rawCoupon],
          code: rawCoupon,
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      {
        success: false,
        valid: false,
        error: "Invalid coupon code",
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
