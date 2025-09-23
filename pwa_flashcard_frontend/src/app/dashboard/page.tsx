"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

type Overview = {
  dueToday: number; mastered: number; accuracy: number; streak: number;
  byCategory: Array<{ name: string; accuracy: number }>;
  reviewHeatmap?: Array<{ date: string; reviews: number }>;
};

// PUBLIC_INTERFACE
export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await api.statsOverview();
      if (mounted) {
        if (res.data) setOverview(res.data);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <section className="mt-6 grid gap-4">
      <div className="card">
        <div className="card-inner" style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem', flexWrap:'wrap'}}>
          <div>
            <h1 className="text-2xl font-extrabold" style={{color:"var(--color-primary)"}}>Dashboard</h1>
            <p className="opacity-80">Welcome, {user?.name || user?.email}</p>
          </div>
          <div style={{display:'flex', gap:'.5rem'}}>
            <Link className="btn btn-primary" href="/review">Start Review</Link>
            <Link className="btn btn-secondary" href="/browse">Browse</Link>
            <button className="btn btn-ghost" onClick={logout}>Logout</button>
          </div>
        </div>
      </div>

      <div className="grid-cards">
        <StatCard title="Due Today" value={loading ? "…" : String(overview?.dueToday ?? 0)} />
        <StatCard title="Mastered" value={loading ? "…" : String(overview?.mastered ?? 0)} />
        <StatCard title="Accuracy" value={loading ? "…" : `${overview?.accuracy ?? 0}%`} />
      </div>

      <div className="card">
        <div className="card-inner">
          <h2 className="font-bold">By Category</h2>
          <div className="grid-cards mt-2">
            {(overview?.byCategory || []).map((c) => (
              <div key={c.name} className="card">
                <div className="card-inner" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <span className="badge">{c.name}</span>
                  <span className="font-bold">{Math.round(c.accuracy)}%</span>
                </div>
              </div>
            ))}
            {(!overview || overview.byCategory?.length === 0) && (
              <p className="opacity-80 text-sm">No category data yet.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="card">
      <div className="card-inner">
        <div className="opacity-70 text-sm">{title}</div>
        <div className="text-2xl font-extrabold" style={{color:"var(--color-primary)"}}>{value}</div>
      </div>
    </div>
  );
}
