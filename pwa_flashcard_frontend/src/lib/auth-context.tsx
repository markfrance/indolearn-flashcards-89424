"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseClient } from "./supabaseClient";

type User = { id: string; email: string; name?: string };

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (name: string, email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// PUBLIC_INTERFACE
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await api.me();
      if (!mounted) return;
      if (res.data) setUser(res.data);
      setLoading(false);
    })();

    // Subscribe to Supabase auth changes to keep UI in sync across tabs
    const supabase = (() => {
      try { return getSupabaseClient(); } catch { return null; }
    })();
    const { data: subscription } = supabase?.auth.onAuthStateChange(async () => {
      const me = await api.me();
      if (me.data) setUser(me.data);
      else setUser(null);
    }) || { data: { subscription: null }, error: null } as any;

    return () => {
      mounted = false;
      if (subscription?.subscription) {
        subscription.subscription.unsubscribe();
      }
    };
  }, []);

  const publicRoutes = useMemo(() => ["/", "/login", "/register", "/privacy", "/terms"], []);
  useEffect(() => {
    if (!loading) {
      if (!user && !publicRoutes.includes(pathname)) {
        router.replace("/login");
      }
      if (user && (pathname === "/login" || pathname === "/register" || pathname === "/")) {
        router.replace("/dashboard");
      }
    }
  }, [loading, user, pathname, publicRoutes, router]);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    if (res.error) return res.error;
    const me = await api.me();
    if (me.data) setUser(me.data);
    return null;
  };

  const register = async (name: string, email: string, password: string) => {
    const reg = await api.register({ name, email, password });
    if (reg.error) return reg.error;
    // Optional immediate sign-in for smooth UX
    const log = await api.login({ email, password });
    if (log.error) return log.error;
    const me = await api.me();
    if (me.data) setUser(me.data);
    return null;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    router.replace("/login");
  };

  const value: AuthContextValue = { user, loading, login, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
