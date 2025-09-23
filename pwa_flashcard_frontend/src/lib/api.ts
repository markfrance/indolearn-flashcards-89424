"use client";

/**
 * Centralized API client for backend REST endpoints.
 * Uses environment variable NEXT_PUBLIC_API_BASE for base URL.
 *
 * PUBLIC_INTERFACE
 */
export type ApiResult<T> = { data?: T; error?: string; status: number };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      credentials: "include",
      cache: "no-store",
    });
    const status = res.status;
    const text = await res.text();
    let parsed: unknown = undefined;
    try {
      parsed = text ? JSON.parse(text) : undefined;
    } catch {
      parsed = undefined;
    }
    if (!res.ok) {
      const errMsg =
        typeof parsed === "object" && parsed !== null && "message" in parsed
          ? String((parsed as { message?: unknown }).message)
          : typeof parsed === "object" && parsed !== null && "error" in parsed
          ? String((parsed as { error?: unknown }).error)
          : res.statusText || "Request failed";
      return { status, error: errMsg };
    }
    return { status, data: parsed as T };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    return { status: 0, error: msg };
  }
}

// PUBLIC_INTERFACE
export const api = {
  register: (body: { email: string; password: string; name?: string }) =>
    request<{ id: string; email: string }>("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<{ token?: string; user?: { id: string; email: string; name?: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  logout: () => request<object>("/auth/logout", { method: "POST" }),

  me: () => request<{ id: string; email: string; name?: string }>("/users/me"),

  updateMe: (body: { name?: string }) => request<{ id: string; email: string; name?: string }>("/users/me", {
    method: "PUT",
    body: JSON.stringify(body),
  }),

  categories: () => request<Array<{ id: string; name: string; count?: number }>>("/categories"),

  flashcards: (params: { q?: string; category?: string; type?: string; direction?: "en-id" | "id-en"; page?: number } = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") query.set(k, String(v));
    });
    return request<Array<{ id: string; word: string; meaning: string; type?: string; category?: string }>>(`/flashcards?${query.toString()}`);
  },

  createQuiz: (body: { size: number; category?: string; type?: string; direction?: "en-id" | "id-en" }) =>
    request<{ id: string; questions: Array<{ id: string; prompt: string; choices: string[]; answer: string; cardId: string }> }>("/quizzes", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  submitQuiz: (id: string, body: { responses: Array<{ questionId: string; choice: string }> }) =>
    request<{ score: number; correct: number; total: number; details: Record<string, unknown> }>(`/quizzes/${id}/submit`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getQuiz: (id: string) => request<{ id: string; result?: Record<string, unknown> }>(`/quizzes/${id}`),

  statsOverview: () => request<{
    dueToday: number; mastered: number; accuracy: number; streak: number;
    byCategory: Array<{ name: string; accuracy: number }>;
    reviewHeatmap?: Array<{ date: string; reviews: number }>;
  }>("/stats/overview"),
};
