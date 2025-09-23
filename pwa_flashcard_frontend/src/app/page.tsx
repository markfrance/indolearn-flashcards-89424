import Link from "next/link";

export default function Home() {
  return (
    <section className="grid gap-4 mt-4">
      <div className="card">
        <div className="card-inner">
          <h1 className="text-2xl font-extrabold" style={{color:"var(--color-primary)"}}>
            IndoLearn Flashcards
          </h1>
          <p className="mt-2 opacity-80">
            Learn Indonesian with intelligent multiple-choice quizzes and spaced repetition. Mobile-first, installable, and fast.
          </p>
          <div className="mt-4" style={{display:'flex', gap:'.75rem', flexWrap:'wrap'}}>
            <Link className="btn btn-primary" href="/login">Login</Link>
            <Link className="btn btn-secondary" href="/register">Create Account</Link>
          </div>
        </div>
      </div>

      <div className="grid-cards">
        <div className="card">
          <div className="card-inner">
            <h2 className="font-bold">Spaced Repetition</h2>
            <p className="opacity-80 text-sm mt-1">Optimized schedules ensure durable learning with timely reviews.</p>
          </div>
        </div>
        <div className="card">
          <div className="card-inner">
            <h2 className="font-bold">Smart Multiple Choice</h2>
            <p className="opacity-80 text-sm mt-1">Intelligent distractors based on categories and word types.</p>
          </div>
        </div>
        <div className="card">
          <div className="card-inner">
            <h2 className="font-bold">Track Progress</h2>
            <p className="opacity-80 text-sm mt-1">Visualize accuracy, streaks, and mastery across categories.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
