import { createBrowserClient } from "@supabase/ssr";

// Browser client; the admin session lives in cookies shared with the server client.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
