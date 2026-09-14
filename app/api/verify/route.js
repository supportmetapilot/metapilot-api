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
    const body = await request.json();
    const { userId, password, deviceUUID } = body;

    if (!userId || !password || !deviceUUID) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const now = new Date();

    // Check trials first
    const { data: trial } = await supabase
      .from("trials")
      .select("*")
      .eq("user_id", userId)
      .eq("password", password)
      .eq("device_uuid", deviceUUID)
      .limit(1);

    if (trial && trial.length > 0) {
      const t = trial[0];
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
      .eq("user_id", userId)
      .eq("password", password)
      .eq("device_uuid", deviceUUID)
      .limit(1);

    if (sub && sub.length > 0) {
      const s = sub[0];
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
