import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * POST /api/verify
 * Verify user login credentials + check subscription validity
 * Replaces GAS login verification
 *
 * Body: { userId, password, deviceUUID }
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

    const userId = (body.userId || body.userid || body.user_id || "").trim();
    const password = (body.password || body.key || "").trim();
    const deviceUUID = (body.deviceUUID || body.deviceId || body.device_uuid || "").trim();

    if (!userId || !password) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: userId, password" },
        { status: 400 }
      );
    }

    const now = new Date();

    // Check trials first (case-insensitive userId)
    const { data: trial } = await supabase
      .from("trials")
      .select("*")
      .ilike("user_id", userId)
      .eq("password", password)
      .limit(1);

    if (trial && trial.length > 0) {
      const t = trial[0];
      // If deviceUUID provided, verify hardware binding
      if (deviceUUID && t.device_uuid && t.device_uuid !== deviceUUID) {
        return NextResponse.json({
          success: false,
          valid: false,
          error: "This account is linked to another device.",
          code: "DEVICE_MISMATCH",
        });
      }
      const endDate = new Date(t.end_date);
      const isActive = now < endDate && t.status === "Trial";

      return NextResponse.json({
        success: true,
        valid: isActive,
        plan: "1-Day Free",
        status: isActive ? "Active" : "Expired",
        endDate: t.end_date,
        message: isActive ? "Trial is active" : "Trial has expired. Please upgrade to Pro.",
      });
    }

    // Check subscriptions
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("*")
      .ilike("user_id", userId)
      .eq("password", password)
      .limit(1);

    if (sub && sub.length > 0) {
      const s = sub[0];
      if (deviceUUID && s.device_uuid && s.device_uuid !== deviceUUID) {
        return NextResponse.json({
          success: false,
          valid: false,
          error: "This account is linked to another device.",
          code: "DEVICE_MISMATCH",
        });
      }
      const endDate = s.end_date ? new Date(s.end_date) : null;
      const isActive = s.status === "Paid" && endDate && now < endDate;

      return NextResponse.json({
        success: true,
        valid: isActive,
        plan: s.plan_type,
        status: isActive ? "Active" : s.status,
        endDate: s.end_date,
        message: isActive ? "Subscription is active" : "Subscription is " + s.status,
      });
    }

    return NextResponse.json({
      success: false,
      valid: false,
      error: "Invalid credentials or device",
      code: "NOT_FOUND",
    });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
