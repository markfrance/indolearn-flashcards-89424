"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

/**
 * PUBLIC_INTERFACE
 * ClientHeader renders the app bar and conditionally shows navigation items
 * only after the user has logged in. It avoids server/client boundary issues
 * by living entirely in the client layer.
 */
export default function ClientHeader() {
  const { user, loading } = useAuth();

  return (
    <header className="appbar">
      <div className="appbar-content container">
        <div className="brand">
          <span aria-hidden="true" style={{ width: 10, height: 10, background: "white", borderRadius: 2, opacity: 0.9 }} />
          <Link href="/" className="text-white" aria-label="IndoLearn Home">
            IndoLearn
          </Link>
        </div>
        {!loading && user && (
          <nav className="nav" aria-label="Primary">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/review">Review</Link>
            <Link href="/browse">Browse</Link>
            <Link href="/stats">Stats</Link>
            <Link href="/settings">Settings</Link>
          </nav>
        )}
      </div>
    </header>
  );
}
