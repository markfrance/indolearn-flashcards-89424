"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * PUBLIC_INTERFACE
 * getSupabaseClient returns a singleton Supabase client configured from environment variables.
 * 
 * Environment variables:
 * - NEXT_PUBLIC_SUPABASE_URL: Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase anon key
 */
export function getSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Provide an explicit error that will be visible in the UI for easier setup debugging
    throw new Error(
      "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment."
    );
  }

  // Use a module-level singleton to avoid multiple client instances
  // eslint-disable-next-line no-var
  var globalAny = global as any;
  if (!globalAny.__supabase_client__) {
    globalAny.__supabase_client__ = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  }
  return globalAny.__supabase_client__ as SupabaseClient;
}
