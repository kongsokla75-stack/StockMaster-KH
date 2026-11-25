import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | undefined;

function urlFromJwksUrl(jwksUrl: string): string {
  const parsed = new URL(jwksUrl);
  return parsed.origin;
}

/**
 * Server-only Supabase client. Credentials are read lazily so builds do not
 * require them. Two modes are supported:
 *
 * 1. Service role key (preferred): SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 *    Bypasses RLS; browser never sees credentials.
 * 2. Publishable key: NEXT_PUBLIC_JWKS_URL + NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
 *    The project URL is derived from the JWKS URL. Requires anon RLS policies
 *    in supabase/schema.sql, which make writes public.
 */
export function getSupabase(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const serviceUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const jwksUrl = process.env.NEXT_PUBLIC_JWKS_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  let url: string | undefined;
  let key: string | undefined;

  if (serviceUrl && serviceRoleKey) {
    url = serviceUrl;
    key = serviceRoleKey;
  } else if (jwksUrl && publishableKey) {
    url = urlFromJwksUrl(jwksUrl);
    key = publishableKey;
  }

  if (!url || !key) {
    throw new Error(
      'Missing Supabase credentials. Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY, or NEXT_PUBLIC_JWKS_URL + NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. See .env.example.',
    );
  }

  cachedClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}
