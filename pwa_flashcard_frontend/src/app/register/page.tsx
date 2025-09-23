"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useAuth } from "@/lib/auth-context";

// PUBLIC_INTERFACE
export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const err = await register(name, email, password);
    if (err) setError(err);
    setSubmitting(false);
  };

  return (
    <section className="mt-6 grid gap-4">
      <div className="card" style={{maxWidth: 520, margin: "0 auto", width: "100%"}}>
        <div className="card-inner">
          <h1 className="text-2xl font-extrabold" style={{color:"var(--color-primary)"}}>Create account</h1>
          <p className="opacity-80 mt-1">Start learning Indonesian today.</p>

          <form onSubmit={onSubmit} className="mt-4 grid gap-3" noValidate>
            <div>
              <label className="label" htmlFor="name">Name</label>
              <input id="name" className="input" type="text" autoComplete="name" required value={name} onChange={e=>setName(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" className="input" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" className="input" type="password" autoComplete="new-password" required value={password} onChange={e=>setPassword(e.target.value)} />
            </div>

            {error && <p role="alert" className="text-sm" style={{color:"var(--color-error)"}}>{error}</p>}

            <button className="btn btn-primary" disabled={submitting} type="submit">
              {submitting ? "Creating..." : "Create account"}
            </button>
          </form>

          <p className="text-sm opacity-80 mt-3">
            Already have an account? <Link className="btn btn-ghost" href="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
