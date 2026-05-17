import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let serverClient: SupabaseClient | null = null;
let browserClient: SupabaseClient | null = null;

const getSupabaseUrl = (): string | undefined => process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const getSupabaseAnonKey = (): string | undefined => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
const getSupabaseServiceKey = (): string | undefined => process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Server-side Supabase client using the service role key.
 * Throws a clear error when required env vars are missing.
 */
export const getSupabaseAdmin = (): SupabaseClient => {
  if (serverClient) return serverClient;

  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceKey();

  if (!supabaseUrl) throw new Error("Missing Supabase URL. Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL.");
  if (!serviceRoleKey) throw new Error("Missing Supabase service role key. Set SUPABASE_SERVICE_ROLE_KEY.");

  serverClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });

  return serverClient;
};

/**
 * Browser/public Supabase client using the anon/public key.
 * This is safe to call from client code; it will throw if anon key is missing.
 */
export const getSupabaseClient = (): SupabaseClient => {
  if (browserClient) return browserClient;

  const supabaseUrl = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!supabaseUrl) throw new Error("Missing Supabase URL. Set NEXT_PUBLIC_SUPABASE_URL.");
  if (!anonKey) throw new Error("Missing Supabase anon/public key. Set NEXT_PUBLIC_SUPABASE_ANON_KEY.");

  browserClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
  });

  return browserClient;
};
