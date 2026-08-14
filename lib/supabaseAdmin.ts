import { createClient } from "@supabase/supabase-js";

export function supabaseAdmin() {
  const rawUrl = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!rawUrl || !key) {
    throw new Error(
      "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  const url = rawUrl
    .trim()
    .replace(/\/rest\/v1\/?$/, "")
    .replace(/\/+$/, "");

  if (!url.startsWith("https://")) {
    throw new Error(
      `SUPABASE_URL inválida. Debe comenzar con https://`
    );
  }

  return createClient(url, key.trim(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
