import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEFAULT_CONFIG = {
  groq_text_model: "openai/gpt-oss-20b",
  gemini_model: "gemini-3.5-flash-lite",
  gemini_version: "v1beta",
  download_url_pro: "https://drive.google.com/file/d/1zYSrNRMw4DzablYP7N0n0Ob5cbycQp-E/view?usp=drive_link",
  download_url_go: "https://drive.google.com/file/d/17YVtttKGi9-FTCYceb2PzPKKV_yeqshz/view?usp=drive_link",
  download_url: "https://drive.google.com/file/d/1zYSrNRMw4DzablYP7N0n0Ob5cbycQp-E/view?usp=drive_link",
};

/**
 * GET /api/config
 * Returns remote model configuration and separate Pro and Go download URLs
 */
export async function GET(request) {
  const headers = {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  };

  try {
    const { data, error } = await supabase.from("app_config").select("key, value");

    if (error || !data || data.length === 0) {
      return NextResponse.json(
        {
          success: true,
          download_url_pro: DEFAULT_CONFIG.download_url_pro,
          download_url_go: DEFAULT_CONFIG.download_url_go,
          download_url: DEFAULT_CONFIG.download_url_pro,
          models: DEFAULT_CONFIG,
        },
        { headers }
      );
    }

    const config = { ...DEFAULT_CONFIG };
    for (const item of data) {
      if (item.key && item.value) {
        config[item.key] = item.value;
      }
    }

    const proUrl = config.download_url_pro || config.download_url;
    const goUrl = config.download_url_go || DEFAULT_CONFIG.download_url_go;

    return NextResponse.json(
      {
        success: true,
        download_url_pro: proUrl,
        download_url_go: goUrl,
        download_url: proUrl,
        models: config,
        config: config,
      },
      { headers }
    );
  } catch (_) {
    return NextResponse.json(
      {
        success: true,
        download_url_pro: DEFAULT_CONFIG.download_url_pro,
        download_url_go: DEFAULT_CONFIG.download_url_go,
        download_url: DEFAULT_CONFIG.download_url_pro,
        models: DEFAULT_CONFIG,
      },
      { headers }
    );
  }
}
