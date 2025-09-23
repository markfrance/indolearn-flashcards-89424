"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

type Overview = {
  dueToday: number; mastered: number; accuracy: number; streak: number;
  byCategory: Array<{ name: string; accuracy: number }>;
  reviewHeatmap?: Array<{ date: string; reviews: number }>;
};

// PUBLIC_INTERFACE
export default function StatsPage() {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await api.statsOverview();
      if (mounted && res.data) setData(res.data);
    })();
    return () => { mounted = false; };
  }, []);

  const maxReviews = useMemo(() => {
    return (data?.reviewHeatmap || []).reduce((m, d) => Math.max(m, d.reviews), 1);
  }, [data]);

  return (
    <section className="mt-6 grid gap-4">
      <div className="card">
        <div className="card-inner">
          <h1 className="text-2xl font-extrabold" style={{color:"var(--color-primary)"}}>Statistics</h1>
          <p className="opacity-80 text-sm">Track your progress and mastery over time.</p>
        </div>
      </div>

      <div className="grid-cards">
        <KPI title="Due Today" value={String(data?.dueToday ?? 0)} />
        <KPI title="Mastered" value={String(data?.mastered ?? 0)} />
        <KPI title="Accuracy" value={`${data?.accuracy ?? 0}%`} />
        <KPI title="Streak" value={`${data?.streak ?? 0} days`} />
      </div>

      <div className="card">
        <div className="card-inner">
          <h2 className="font-bold">Category Accuracy</h2>
          <div className="mt-3 grid" style={{gap:'.5rem'}}>
            {(data?.byCategory || []).map((c) => (
              <div key={c.name} style={{display:'grid', gridTemplateColumns:'140px 1fr', alignItems:'center', gap:'.75rem'}}>
                <div className="badge">{c.name}</div>
                <div style={{height: 10, background: "rgba(30,58,138,.1)", borderRadius: 999}}>
                  <div style={{height: 10, width: `${Math.min(100, Math.max(0, c.accuracy))}%`, background: "var(--color-primary)", borderRadius: 999}} />
                </div>
              </div>
            ))}
            {(data?.byCategory?.length || 0) === 0 && <p className="opacity-80 text-sm">No category data.</p>}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-inner">
          <h2 className="font-bold">Review Activity</h2>
          <div className="mt-3" style={{display:'grid', gridTemplateColumns:'repeat(14, 1fr)', gap:'.25rem'}}>
            {(data?.reviewHeatmap || []).slice(-112).map((d, i) => {
              const intensity = d.reviews / (maxReviews || 1);
              const color = `rgba(30,58,138,${0.15 + 0.65 * intensity})`;
              return <div key={i} title={`${d.date}: ${d.reviews}`} style={{width:'100%', aspectRatio:'1', borderRadius: 4, background: color}} />;
            })}
            {(!data?.reviewHeatmap || data.reviewHeatmap.length === 0) && <p className="opacity-80 text-sm">No activity yet.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

function KPI({ title, value }: { title: string; value: string }) {
  return (
    <div className="card">
      <div className="card-inner">
        <div className="opacity-70 text-sm">{title}</div>
        <div className="text-2xl font-extrabold" style={{color:"var(--color-primary)"}}>{value}</div>
      </div>
    </div>
  );
}
