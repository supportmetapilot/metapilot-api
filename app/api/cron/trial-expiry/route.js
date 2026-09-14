import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/cron/trial-expiry
 * Check and expire trials that have passed their end_date
 * Vercel Cron Job — runs daily
 */
export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date().toISOString();

    // Mark expired trials
    const { data, error } = await supabase
      .from("trials")
      .update({ status: "Expired" })
      .eq("status", "Trial")
      .lt("end_date", now)
      .select("id, email, full_name");

    if (error) throw error;

    return NextResponse.json({
      success: true,
      expired: data ? data.length : 0,
      timestamp: now,
    });
  } catch (error) {
    console.error("Trial expiry cron error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
