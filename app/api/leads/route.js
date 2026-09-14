import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/leads
 * Fetch leads with optional filtering
 * Query params: ?status=pending&limit=50&offset=0
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status"); // "pending", "sent", "all"

    let query = supabase.from("leads").select("*", { count: "exact" });

    if (status === "pending") {
      query = query.is("mail_1_status", null);
    } else if (status === "sent") {
      query = query.not("mail_1_status", "is", null);
    }

    const { data, error, count } = await query
      .order("id", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({ success: true, leads: data, total: count });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/leads
 * Import leads (single or bulk)
 * Body: { leads: [{ full_name, email, mobile, job_role, years_of_experience, notice_period }] }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { leads } = body;

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json(
        { success: false, error: "Provide an array of leads" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.from("leads").insert(leads).select();

    if (error) throw error;

    return NextResponse.json({ success: true, imported: data.length });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
