"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../../lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const supabase = getSupabaseClient();
      try {
        // Try the v2-friendly exchange first; fallback if not available
        const anyAuth: any = supabase.auth as any;
        let error: any = null;

        if (typeof anyAuth.exchangeCodeForSession === "function") {
          const { error: e } = await anyAuth.exchangeCodeForSession(window.location.href);
          if (e) error = e;
        } else if (typeof anyAuth.getSessionFromUrl === "function") {
          const { error: e } = await anyAuth.getSessionFromUrl({ storeSession: true });
          if (e) error = e;
        }

        if (error) {
          console.error("Auth callback error:", error);
          router.replace("/auth/error");
          return;
        }

        // On success, redirect to dashboard
        router.replace("/dashboard");
      } catch (e) {
        console.error("Auth callback exception:", e);
        router.replace("/auth/error");
      }
    };
    run();
    // Intentionally run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Processing authentication…</h1>
        <p className="text-gray-600 mt-2">Please wait while we complete your sign-in.</p>
      </div>
    </div>
  );
}
