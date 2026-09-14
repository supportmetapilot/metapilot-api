import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * POST /api/verify
 * Verify user login credentials + check subscription validity
 * 
 * Supports dedicated tables:
 * - pro_trials & pro_subscriptions
 * - go_trials & go_subscriptions
 * - Fallback to trials & subscriptions
 *
 * Body: { userId, password, deviceUUID, app_type }
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
    const rawApp = (body.app_type || body.appType || body.app || "").toLowerCase();
    const isGo = rawApp.includes("go");

    if (!userId || !password) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: userId, password" },
        { status: 400 }
      );
    }

    const now = new Date();

    // Determine candidate tables based on app_type (prioritize the specific app's tables, but check both)
    const trialTables = isGo ? ["go_trials", "pro_trials", "trials"] : ["pro_trials", "go_trials", "trials"];
    const subTables = isGo ? ["go_subscriptions", "pro_subscriptions", "subscriptions"] : ["pro_subscriptions", "go_subscriptions", "subscriptions"];

    function normalizePassword(p) {
      return (p || "")
        .trim()
        .toUpperCase()
        .replace(/O/g, "0")
        .replace(/S/g, "5")
        .replace(/[IL]/g, "1");
    }

    // 1. Check Trials
    for (const table of trialTables) {
      try {
        const { data: candidates } = await supabase
          .from(table)
          .select("*")
          .ilike("user_id", userId);

        if (candidates && candidates.length > 0) {
          const t = candidates.find(item => {
            const p1 = (item.password || "").trim();
            const p2 = password.trim();
            if (p1.toLowerCase() === p2.toLowerCase()) return true;
            return normalizePassword(p1) === normalizePassword(p2);
          });

          if (t) {
            // Auto-bind device on first login or allow companion app
            if (deviceUUID) {
              const boundDevices = (t.device_uuid || "").split(",").map(d => d.trim()).filter(Boolean);
              if (boundDevices.length === 0) {
                await supabase.from(table).update({ device_uuid: deviceUUID }).eq("id", t.id);
                t.device_uuid = deviceUUID;
              } else if (!boundDevices.includes(deviceUUID)) {
                if (boundDevices.length < 2) {
                  const updated = `${t.device_uuid},${deviceUUID}`;
                  await supabase.from(table).update({ device_uuid: updated }).eq("id", t.id);
                  t.device_uuid = updated;
                } else {
                  return NextResponse.json({
                    success: false,
                    valid: false,
                    message: "This account is linked to another device. Contact administrator.",
                    error: "This account is linked to another device.",
                    code: "DEVICE_MISMATCH",
                  });
                }
              }
            }

            const endDate = new Date(t.end_date);
            const isActive = now < endDate && t.status === "Trial";

            if (!isActive) {
              return NextResponse.json({
                success: false,
                valid: false,
                message: "Your 1-Day Free Trial has expired. Please upgrade to continue.",
                error: "Trial has expired.",
                code: "EXPIRED",
              });
            }

            return NextResponse.json({
              success: true,
              valid: true,
              plan: "1-Day Free",
              status: "Active",
              endDate: t.end_date,
              table: table,
              message: "Trial is active",
            });
          }
        }
      } catch (_) {
        // Table might not exist yet, continue to fallback
      }
    }

    // 2. Check Subscriptions
    for (const table of subTables) {
      try {
        const { data: candidates } = await supabase
          .from(table)
          .select("*")
          .ilike("user_id", userId);

        if (candidates && candidates.length > 0) {
          const s = candidates.find(item => {
            const p1 = (item.password || "").trim();
            const p2 = password.trim();
            if (p1.toLowerCase() === p2.toLowerCase()) return true;
            return normalizePassword(p1) === normalizePassword(p2);
          });

          if (s) {
            // Check if payment is still pending
            if (s.status === "Pending") {
              return NextResponse.json({
                success: false,
                valid: false,
                message: "Subscription pending payment. Please complete payment using the link sent to your email.",
                error: "Subscription pending payment.",
                code: "PENDING_PAYMENT",
              });
            }

            // Auto-bind device on first login or allow companion app (Go + Pro on same PC)
            if (deviceUUID) {
              const boundDevices = (s.device_uuid || "").split(",").map(d => d.trim()).filter(Boolean);
              if (boundDevices.length === 0) {
                await supabase.from(table).update({ device_uuid: deviceUUID }).eq("id", s.id);
                s.device_uuid = deviceUUID;
              } else if (!boundDevices.includes(deviceUUID)) {
                if (boundDevices.length < 2) {
                  const updated = `${s.device_uuid},${deviceUUID}`;
                  await supabase.from(table).update({ device_uuid: updated }).eq("id", s.id);
                  s.device_uuid = updated;
                } else {
                  return NextResponse.json({
                    success: false,
                    valid: false,
                    message: "This account is linked to another device. Contact administrator.",
                    error: "This account is linked to another device.",
                    code: "DEVICE_MISMATCH",
                  });
                }
              }
            }

            const endDate = s.end_date ? new Date(s.end_date) : null;
            const isActive = s.status === "Paid" && endDate && now < endDate;

            if (!isActive) {
              return NextResponse.json({
                success: false,
                valid: false,
                message: "Your subscription has expired. Please renew your plan to continue.",
                error: "Subscription expired.",
                code: "EXPIRED",
              });
            }

            return NextResponse.json({
              success: true,
              valid: true,
              plan: s.plan_type,
              status: "Active",
              endDate: s.end_date,
              table: table,
              message: "Subscription is active",
            });
          }
        }
      } catch (_) {
        // Table might not exist yet, continue to fallback
      }
    }

    return NextResponse.json({
      success: false,
      valid: false,
      message: "Invalid User ID or Password",
      error: "Invalid User ID or Password",
      code: "NOT_FOUND",
    });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { success: false, error: error.message, message: error.message },
      { status: 500 }
    );
  }
}
