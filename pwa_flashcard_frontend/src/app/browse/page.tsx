"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// PUBLIC_INTERFACE
export default function BrowsePage() {
  const [q, setQ] = useState("");
  const [direction, setDirection] = useState<"en-id" | "id-en">("en-id");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [items, setItems] = useState<Array<{ id: string; word: string; meaning: string; type?: string; category?: string }>>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await api.categories();
      if (mounted && res.data) setCategories(res.data);
    })();
    return () => { mounted = false; };
  }, []);

  const search = async () => {
    setLoading(true);
    const res = await api.flashcards({ q, category: category || undefined, type: type || undefined, direction });
    if (res.data) setItems(res.data);
    setLoading(false);
  };

  useEffect(() => {
    // initial search on mount and when key filters change
    void (async () => {
      await search();
    })();
  }, [direction, category, type, search]);

  return (
    <section className="mt-6 grid gap-4">
      <div className="card">
        <div className="card-inner">
          <h1 className="text-2xl font-extrabold" style={{color:"var(--color-primary)"}}>Browse Words</h1>
          <p className="opacity-80 text-sm">Filter by category and word type. Tap a card to review in context.</p>
        </div>
      </div>

      <div className="grid" style={{gridTemplateColumns: "1fr", gap: "1rem"}}>
        <aside className="card">
          <div className="card-inner">
            <div className="grid" style={{gap:'.75rem'}}>
              <div>
                <span className="label">Search</span>
                <input className="input" value={q} onChange={e=>setQ(e.target.value)} placeholder="Type to search…" />
              </div>
              <div>
                <span className="label">Direction</span>
                <select
                  className="input"
                  value={direction}
                  onChange={(e) => setDirection(e.target.value === "id-en" ? "id-en" : "en-id")}
                >
                  <option value="en-id">English → Indonesian</option>
                  <option value="id-en">Indonesian → English</option>
                </select>
              </div>
              <div>
                <span className="label">Category</span>
                <select className="input" value={category} onChange={e=>setCategory(e.target.value)}>
                  <option value="">All</option>
                  {categories.map((c)=> <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <span className="label">Word Type</span>
                <select className="input" value={type} onChange={e=>setType(e.target.value)}>
                  <option value="">All</option>
                  <option value="noun">Noun</option>
                  <option value="verb">Verb</option>
                  <option value="adjective">Adjective</option>
                  <option value="adverb">Adverb</option>
                </select>
              </div>
              <button className="btn btn-primary" onClick={search} disabled={loading}>{loading ? "Searching..." : "Apply"}</button>
            </div>
          </div>
        </aside>

        <div className="grid-cards">
          {items.map((it) => (
            <div key={it.id} className="card">
              <div className="card-inner">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div className="badge">{it.category || "General"}</div>
                  <div className="badge">{it.type || "—"}</div>
                </div>
                <h3 className="text-xl font-bold mt-2" style={{color:"var(--color-primary)"}}>{direction === "en-id" ? it.word : it.meaning}</h3>
                <p className="mt-1">{direction === "en-id" ? it.meaning : it.word}</p>
              </div>
            </div>
          ))}
          {items.length === 0 && !loading && <p className="opacity-80 text-sm">No words found.</p>}
        </div>
      </div>
    </section>
  );
}
