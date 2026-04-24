import { createBrowserClient } from "@supabase/ssr";

export const createClient = () => {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Persist session
  supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      localStorage.setItem("supabase-session", JSON.stringify(session));
    } else {
      localStorage.removeItem("supabase-session");
    }
  });

  return supabase;
};