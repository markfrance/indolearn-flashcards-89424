"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

// PUBLIC_INTERFACE
export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
  }, [user?.name, user?.email]);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    const res = await api.updateMe({ name });
    if (res.error) setMsg(res.error);
    else setMsg("Saved!");
    setSaving(false);
  };

  return (
    <section className="mt-6 grid gap-4">
      <div className="card" style={{maxWidth:640}}>
        <div className="card-inner">
          <h1 className="text-2xl font-extrabold" style={{color:"var(--color-primary)"}}>Settings</h1>
          <div className="mt-3 grid" style={{gap:'.75rem'}}>
            <div>
              <span className="label">Name</span>
              <input className="input" value={name} onChange={e=>setName(e.target.value)} />
            </div>
            <div>
              <span className="label">Email</span>
              <input className="input" value={email} readOnly />
            </div>
            {msg && <p className="text-sm opacity-80">{msg}</p>}
            <div style={{display:'flex', gap:'.5rem', flexWrap:'wrap'}}>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
              <button className="btn btn-ghost" onClick={logout}>Logout</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
