import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * POST /api/register
 * Register a new trial or pro user (replaces GAS doPost)
 *
 * Body: { name, email, mobile, jobRole, planType, deviceUUID }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, mobile, jobRole, planType, deviceUUID } = body;

    if (!name || !email || !deviceUUID) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, email, deviceUUID" },
        { status: 400 }
      );
    }

    // Generate credentials
    const userId = name.substring(0, 4).toUpperCase();
    const password = deviceUUID.substring(0, 4);

    if (planType === "1-Day Free" || planType === "trial") {
      // Check if HWID already claimed trial
      const { data: existing } = await supabase
        .from("trials")
        .select("id, status")
        .eq("device_uuid", deviceUUID)
        .limit(1);

      if (existing && existing.length > 0) {
        return NextResponse.json({
          success: false,
          error: "Trial already claimed on this device",
          code: "TRIAL_CLAIMED",
        });
      }

      // Create trial
      const now = new Date();
      const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24 hours

      const { data, error } = await supabase.from("trials").insert({
        full_name: name,
        email: email,
        mobile: mobile || "",
        job_role: jobRole || "",
        plan_type: "1-Day Free",
        device_uuid: deviceUUID,
        user_id: userId,
        password: password,
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
        status: "Trial",
      }).select();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: "Trial activated!",
        userId: userId,
        password: password,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
      });

    } else {
      // Pro registration
      const { data: existing } = await supabase
        .from("subscriptions")
        .select("id, status")
        .eq("device_uuid", deviceUUID)
        .eq("status", "Paid")
        .limit(1);

      if (existing && existing.length > 0) {
        return NextResponse.json({
          success: false,
          error: "Active subscription already exists on this device",
          code: "ALREADY_SUBSCRIBED",
        });
      }

      const { data, error } = await supabase.from("subscriptions").insert({
        full_name: name,
        email: email,
        mobile: mobile || "",
        job_role: jobRole || "",
        plan_type: planType || "MetaPilot Pro",
        device_uuid: deviceUUID,
        user_id: userId,
        password: password,
        status: "Pending",
      }).select();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: "Registration received. Payment link will be sent to your email.",
        code: "PAYMENT_PENDING",
      });
    }
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
