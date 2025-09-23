import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mt-6">
      <div className="card" role="alert" aria-live="assertive">
        <div className="card-inner">
          <h1 className="text-2xl font-extrabold" style={{color:"var(--color-primary)"}}>404 – Page Not Found</h1>
          <p className="opacity-80 mt-1">The page you’re looking for doesn’t exist.</p>
          <div className="mt-3">
            <Link className="btn btn-primary" href="/">Go Home</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
