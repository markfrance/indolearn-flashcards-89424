"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useAuth } from "@/lib/auth-context";

// PUBLIC_INTERFACE
export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const err = await login(email.trim(), password);
    if (err) setError(err);
    setSubmitting(false);
  };

  const disabled = submitting || !email.trim() || !password;

  return (
    <section className="mt-6 grid gap-4">
      <div className="card" style={{maxWidth: 520, margin: "0 auto", width: "100%"}}>
        <div className="card-inner">
          <h1 className="text-2xl font-extrabold" style={{color:"var(--color-primary)"}}>Welcome back</h1>
          <p className="opacity-80 mt-1">Log in to continue your learning.</p>

          <form onSubmit={onSubmit} className="mt-4 grid gap-3" noValidate>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" className="input" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" className="input" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} />
            </div>

            {error && <p role="alert" className="text-sm" style={{color:"var(--color-error)"}}>{error}</p>}

            <button className="btn btn-primary" disabled={disabled} type="submit">
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-sm opacity-80 mt-3">
            No account? <Link className="btn btn-ghost" href="/register">Create one</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
