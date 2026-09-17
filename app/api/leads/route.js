import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/leads
 * Fetch leads with optional filtering
 * Query params: ?status=pending&limit=300&offset=0
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "300");
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
 * Bulk insert leads
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

/**
 * PATCH /api/leads
 * Edit single lead in database
 * Body: { id, updates: { full_name, email, mobile, job_role, years_of_experience, notice_period, mail_1_status, mail_2_status, mail_3_status } }
 */
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json({ success: false, error: "Missing lead id or updates" }, { status: 400 });
    }

    const cleanUpdates = {};
    if ("full_name" in updates) cleanUpdates.full_name = updates.full_name;
    if ("email" in updates) cleanUpdates.email = updates.email?.toLowerCase().trim();
    if ("mobile" in updates) cleanUpdates.mobile = updates.mobile?.replace(/\D/g, "");
    if ("job_role" in updates) cleanUpdates.job_role = updates.job_role;
    if ("years_of_experience" in updates) cleanUpdates.years_of_experience = updates.years_of_experience;
    if ("notice_period" in updates) cleanUpdates.notice_period = updates.notice_period;
    if ("mail_1_status" in updates) cleanUpdates.mail_1_status = updates.mail_1_status || null;
    if ("mail_2_status" in updates) cleanUpdates.mail_2_status = updates.mail_2_status || null;
    if ("mail_3_status" in updates) cleanUpdates.mail_3_status = updates.mail_3_status || null;

    const { data, error } = await supabase
      .from("leads")
      .update(cleanUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, lead: data, message: "Lead updated successfully." });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/leads
 * Delete single lead, range of IDs, or clear all
 * Query params: ?id=123 OR ?fromId=100&toId=150 OR ?action=clear_all
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const fromId = searchParams.get("fromId");
    const toId = searchParams.get("toId");
    const action = searchParams.get("action");

    if (id) {
      // Delete single lead
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true, message: `Lead ${id} deleted.` });
    }

    if (fromId && toId) {
      // Delete range of IDs
      const from = parseInt(fromId, 10);
      const to = parseInt(toId, 10);
      const { error } = await supabase
        .from("leads")
        .delete()
        .gte("id", from)
        .lte("id", to);

      if (error) throw error;
      return NextResponse.json({ success: true, message: `Leads from ID ${from} to ${to} deleted.` });
    }

    if (action === "clear_all") {
      const { error } = await supabase.from("leads").delete().neq("id", 0);
      if (error) throw error;
      return NextResponse.json({ success: true, message: "All leads cleared." });
    }

    return NextResponse.json({ success: false, error: "Missing delete target" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
