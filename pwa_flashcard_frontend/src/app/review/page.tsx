"use client";

import { api } from "@/lib/api";
import { shuffle, pickDistractors } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

// Types for quiz
type Question = { id: string; prompt: string; choices: string[]; answer: string; cardId: string };
type Quiz = { id: string; questions: Question[] };

// PUBLIC_INTERFACE
export default function ReviewPage() {
  const [direction, setDirection] = useState<"en-id" | "id-en">("en-id");
  const [category, setCategory] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const current = quiz?.questions[index];

  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await api.categories();
      if (mounted && res.data) setCategories(res.data);
    })();
    return () => { mounted = false; };
  }, []);

  const startQuiz = async () => {
    setLoading(true);
    const res = await api.createQuiz({ size, category: category || undefined, type: type || undefined, direction });
    if (res.data) {
      // Fallback: ensure choices exist
      const questions = res.data.questions.map((q) => {
        if (q.choices?.length >= 4) return q;
        return { ...q, choices: shuffle([q.answer, ...pickDistractors(q.answer, (res.data?.questions || []).map(qq => qq.answer))]).slice(0,4) };
      });
      setQuiz({ id: res.data.id, questions });
      setIndex(0);
      setAnswers({});
    }
    setLoading(false);
  };

  const selectChoice = (q: Question, choice: string) => {
    setAnswers((prev) => ({ ...prev, [q.id]: choice }));
  };

  const next = () => {
    if (!quiz) return;
    if (index < quiz.questions.length - 1) {
      setIndex(index + 1);
    }
  };
  const prev = () => {
    if (index > 0) setIndex(index - 1);
  };

  const submit = async () => {
    if (!quiz) return;
    setSubmitting(true);
    const responses = quiz.questions.map((q) => ({ questionId: q.id, choice: answers[q.id] || "" }));
    const res = await api.submitQuiz(quiz.id, { responses });
    setSubmitting(false);
    if (res.data) {
      alert(`Score: ${res.data.score} (${res.data.correct}/${res.data.total})`);
    } else if (res.error) {
      alert(res.error);
    }
  };

  // Spaced repetition grading UI
  const grade = (difficulty: "easy" | "good" | "hard") => {
    // We map difficulty to auto-select correct or distractor to influence backend schedule via submitQuiz details.
    if (!current) return;
    const choice =
      difficulty === "easy"
        ? current.answer
        : difficulty === "good"
          ? answers[current.id] || current.choices[0]
          : // hard: pick a random wrong
            (current.choices.find((c) => c !== current.answer) || current.choices[0]);
    selectChoice(current, choice);
    next();
  };

  const progress = useMemo(() => {
    if (!quiz) return 0;
    return Math.round(((Object.keys(answers).length) / quiz.questions.length) * 100);
  }, [answers, quiz]);

  return (
    <section className="mt-6 grid gap-4">
      <div className="card">
        <div className="card-inner">
          <h1 className="text-2xl font-extrabold" style={{color:"var(--color-primary)"}}>Review</h1>
          <p className="opacity-80 text-sm">Practice with intelligent multiple-choice and spaced repetition prompts.</p>
          <div className="mt-3" style={{display:'grid', gap:'.75rem'}}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem'}}>
              <div>
                <span className="label">Direction</span>
                <select
                  className="input"
                  value={direction}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDirection(v === "id-en" ? "id-en" : "en-id");
                  }}
                >
                  <option value="en-id">English → Indonesian</option>
                  <option value="id-en">Indonesian → English</option>
                </select>
              </div>
              <div>
                <span className="label">Quiz Size</span>
                <input className="input" type="number" min={5} max={50} value={size} onChange={e=>setSize(parseInt(e.target.value || "10"))} />
              </div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem'}}>
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
            </div>
            <button className="btn btn-primary" onClick={startQuiz} disabled={loading}>
              {loading ? "Preparing..." : "Start Quiz"}
            </button>
          </div>
        </div>
      </div>

      {quiz && current && (
        <div className="card">
          <div className="card-inner">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:'.75rem', flexWrap:'wrap'}}>
              <div className="badge">Question {index + 1} / {quiz.questions.length}</div>
              <div className="badge">Progress {progress}%</div>
            </div>
            <h2 className="text-xl font-bold mt-3">{current.prompt}</h2>
            <div className="grid mt-3" style={{gap:'.5rem'}}>
              {current.choices.map((c) => {
                const isSelected = answers[current.id] === c;
                return (
                  <button
                    key={c}
                    className={`btn ${isSelected ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => selectChoice(current, c)}
                    aria-pressed={isSelected}
                  >
                    {c}
                  </button>
                );
              })}
            </div>

            <div className="mt-4" style={{display:'flex', gap:'.5rem', flexWrap:'wrap'}}>
              <button className="btn btn-ghost" onClick={prev} disabled={index === 0}>Back</button>
              <button className="btn btn-secondary" onClick={next} disabled={index >= quiz.questions.length - 1}>Next</button>
              <button className="btn btn-primary" onClick={submit} disabled={submitting}>Submit</button>
            </div>

            <div className="mt-4">
              <div className="opacity-80 text-sm">How was this card?</div>
              <div style={{display:'flex', gap:'.5rem', flexWrap:'wrap', marginTop:'.5rem'}}>
                <button className="btn" style={{background:"var(--color-success)", color:"white"}} onClick={()=>grade("easy")}>Easy</button>
                <button className="btn btn-secondary" onClick={()=>grade("good")}>Good</button>
                <button className="btn" style={{background:"var(--color-error)", color:"white"}} onClick={()=>grade("hard")}>Hard</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
