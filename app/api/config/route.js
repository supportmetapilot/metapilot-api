import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const DEFAULT_MODELS = {
  groq_text_model: "openai/gpt-oss-20b",
  gemini_model: "gemini-3.5-flash-lite",
  gemini_version: "v1beta",
  download_url: "https://drive.google.com/file/d/1zYSrNRMw4DzabIYP7N0n0Ob5cbycQp-E/view?usp=sharing",
};

/**
 * GET /api/config
 * Returns remote model configuration for Groq, Gemini and Download URL
 */
export async function GET(request) {
  try {
    const { data, error } = await supabase.from("app_config").select("key, value");

    if (error || !data || data.length === 0) {
      return NextResponse.json({
        success: true,
        models: DEFAULT_MODELS,
      });
    }

    const models = { ...DEFAULT_MODELS };
    for (const item of data) {
      if (item.key && item.value) {
        models[item.key] = item.value;
      }
    }

    return NextResponse.json({
      success: true,
      models: models,
    });
  } catch (_) {
    return NextResponse.json({
      success: true,
      models: DEFAULT_MODELS,
    });
  }
}
