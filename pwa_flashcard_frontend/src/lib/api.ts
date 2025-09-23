"use client";

import { getSupabaseClient } from "./supabaseClient";
import { shuffle } from "./utils";
import { getURL } from "./getURL";

/**
 * PUBLIC_INTERFACE
 * ApiResult is the common return envelope for API calls.
 */
export type ApiResult<T> = { data?: T; error?: string; status: number };

type Direction = "en-id" | "id-en";

type Category = { id: string; name: string; count?: number };
type Flashcard = {
  id: string;
  indonesian: string;
  english: string;
  part_of_speech?: string | null;
  category_id?: string | null;
  category?: { name?: string | null } | null;
};

type FlashcardListItem = {
  id: string;
  word: string;
  meaning: string;
  type?: string;
  category?: string;
};

type QuizQuestion = { id: string; prompt: string; choices: string[]; answer: string; cardId: string };
type Quiz = { id: string; questions: QuizQuestion[] };

const QUIZ_STORAGE_KEY_PREFIX = "indolearn_quiz_";
const LOGS_STORAGE_KEY = "indolearn_review_logs";

function ok<T>(data: T, status = 200): ApiResult<T> {
  return { data, status };
}

function fail<T>(error: string, status = 400): ApiResult<T> {
  return { error, status };
}

function getSiteUrl(): string {
  // Prefer env, fallback to current origin when running in browser
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env && env.trim()) return env;
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return "http://localhost:3000";
}

function saveQuizLocal(quiz: Quiz) {
  try {
    localStorage.setItem(QUIZ_STORAGE_KEY_PREFIX + quiz.id, JSON.stringify(quiz));
  } catch {
    // ignore quota issues
  }
}

function loadQuizLocal(id: string): Quiz | null {
  try {
    const txt = localStorage.getItem(QUIZ_STORAGE_KEY_PREFIX + id);
    return txt ? (JSON.parse(txt) as Quiz) : null;
  } catch {
    return null;
  }
}

type ReviewLog = { date: string; categoryId?: string | null; flashcardId: string; correct: boolean };
function pushReviewLogs(logs: ReviewLog[]) {
  try {
    const current: ReviewLog[] = JSON.parse(localStorage.getItem(LOGS_STORAGE_KEY) || "[]");
    const merged = current.concat(logs);
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // ignore
  }
}

function readReviewLogs(): ReviewLog[] {
  try {
    return JSON.parse(localStorage.getItem(LOGS_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

/**
 * PUBLIC_INTERFACE
 * Supabase-backed API that mirrors the earlier REST API surface used by pages.
 */
export const api = {
  // AUTH
  async register(body: { email: string; password: string; name?: string }): Promise<ApiResult<{ id: string; email: string }>> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email: body.email,
        password: body.password,
        options: {
          data: body.name ? { name: body.name } : undefined,
          emailRedirectTo: `${getURL()}auth/callback`,
        },
      });
      if (error) return fail(error.message, 400);
      if (!data.user) return fail("Registration failed", 400);
      return ok({ id: data.user.id, email: data.user.email || body.email }, 201);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Registration error";
      return fail(msg, 500);
    }
  },

  async login(body: { email: string; password: string }): Promise<ApiResult<{ token?: string; user?: { id: string; email: string; name?: string } }>> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: body.email,
        password: body.password,
      });
      if (error) return fail(error.message, 401);
      const user = data.user;
      return ok({
        token: data.session?.access_token,
        user: user ? { id: user.id, email: user.email || body.email, name: (user.user_metadata as any)?.name } : undefined,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Login error";
      return fail(msg, 500);
    }
  },

  async logout(): Promise<ApiResult<object>> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signOut();
      if (error) return fail(error.message, 400);
      return ok({});
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Logout error";
      return fail(msg, 500);
    }
  },

  async me(): Promise<ApiResult<{ id: string; email: string; name?: string }>> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.getUser();
      if (error) return fail(error.message, 401);
      const user = data.user;
      if (!user || !user.id) return fail("Not authenticated", 401);
      return ok({ id: user.id, email: user.email || "", name: (user.user_metadata as any)?.name });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Auth error";
      return fail(msg, 500);
    }
  },

  async updateMe(body: { name?: string }): Promise<ApiResult<{ id: string; email: string; name?: string }>> {
    try {
      const supabase = getSupabaseClient();
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) return fail(userErr.message, 401);
      if (!userRes.user) return fail("Not authenticated", 401);

      const { data, error } = await supabase.auth.updateUser({
        data: body.name ? { name: body.name } : {},
      });
      if (error) return fail(error.message, 400);
      const u = data.user || userRes.user;
      return ok({ id: u.id, email: u.email || "", name: (u.user_metadata as any)?.name });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Update error";
      return fail(msg, 500);
    }
  },

  // DATA
  async categories(): Promise<ApiResult<Array<Category>>> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name", { ascending: true });
      if (error) return fail(error.message, 400);
      return ok((data || []).map((c) => ({ id: String(c.id), name: c.name || "" })));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load categories";
      return fail(msg, 500);
    }
  },

  async flashcards(params: {
    q?: string;
    category?: string; // categoryId
    type?: string;
    direction?: Direction;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResult<Array<FlashcardListItem>>> {
    try {
      const supabase = getSupabaseClient();
      const limit = Math.min(Math.max(params.limit || 100, 1), 500);
      let query = supabase
        .from("flashcards")
        .select("id, indonesian, english, part_of_speech, category_id, categories(name)")
        .limit(limit);

      if (params.q && params.q.trim()) {
        // Filter by either language
        const q = params.q.trim();
        // Supabase cannot OR across two ilike easily with a single filter; use textSearch if available or do multiple filters with or()
        query = query.or(`indonesian.ilike.%${q}%,english.ilike.%${q}%`);
      }
      if (params.category && params.category.trim()) {
        query = query.eq("category_id", params.category);
      }
      if (params.type && params.type.trim()) {
        query = query.ilike("part_of_speech", params.type.trim());
      }

      const { data, error } = await query;
      if (error) return fail(error.message, 400);

      const items: FlashcardListItem[] = (data as Flashcard[]).map((f) => ({
        id: String(f.id),
        word: (params.direction || "en-id") === "en-id" ? (f.english || "") : (f.indonesian || ""),
        meaning: (params.direction || "en-id") === "en-id" ? (f.indonesian || "") : (f.english || ""),
        type: f.part_of_speech || undefined,
        category: f.category?.name || undefined,
      }));
      return ok(items);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load flashcards";
      return fail(msg, 500);
    }
  },

  async createQuiz(body: { size: number; category?: string; type?: string; direction?: Direction }): Promise<ApiResult<{ id: string; questions: QuizQuestion[] }>> {
    try {
      const direction = body.direction || "en-id";
      // Fetch a pool of flashcards and sample client-side
      const poolRes = await api.flashcards({
        category: body.category,
        type: body.type,
        direction,
        limit: Math.max(body.size * 6, 50),
      });
      if (poolRes.error || !poolRes.data) return fail(poolRes.error || "Failed to create quiz", poolRes.status);

      // Build base flashcards array in both languages to construct distractors
      const supabase = getSupabaseClient();
      const { data: rawCards, error: rawErr } = await supabase
        .from("flashcards")
        .select("id, indonesian, english, category_id")
        .limit(500);
      if (rawErr) return fail(rawErr.message, 400);
      const allCards = (rawCards || []).map((c) => ({
        id: String(c.id),
        en: c.english || "",
        idn: c.indonesian || "",
        categoryId: c.category_id ? String(c.category_id) : null,
      }));

      // Pick unique items
      const chosen = shuffle(poolRes.data).slice(0, Math.max(1, body.size));
      const questions: QuizQuestion[] = chosen.map((it, idx) => {
        // Map back to underlying flashcard for consistent answer/distractors
        const card = allCards.find((c) =>
          direction === "en-id"
            ? c.en === it.word && c.idn === it.meaning
            : c.idn === it.word && c.en === it.meaning
        ) || allCards.find((c) =>
          direction === "en-id"
            ? c.idn === it.meaning
            : c.en === it.meaning
        );

        const prompt = direction === "en-id" ? (card?.en || it.word) : (card?.idn || it.word);
        const answer = direction === "en-id" ? (card?.idn || it.meaning) : (card?.en || it.meaning);

        // Distractors from allCards in the target language
        const pool = allCards.filter((c) => (direction === "en-id" ? c.idn !== answer : c.en !== answer));
        const distractors = shuffle(pool).slice(0, 3).map((c) => (direction === "en-id" ? c.idn : c.en));
        const choices = shuffle([answer, ...distractors]).slice(0, 4);

        return {
          id: `q_${idx}_${Date.now()}`,
          prompt,
          answer,
          choices,
          cardId: card?.id || it.id,
        };
      });

      const id = `local_${Date.now()}`;
      const quiz: Quiz = { id, questions };
      saveQuizLocal(quiz);
      return ok({ id, questions });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create quiz";
      return fail(msg, 500);
    }
  },

  async submitQuiz(id: string, body: { responses: Array<{ questionId: string; choice: string }> }): Promise<ApiResult<{ score: number; correct: number; total: number; details: Record<string, unknown> }>> {
    try {
      const quiz = loadQuizLocal(id);
      if (!quiz) return fail("Quiz not found or expired", 404);

      const total = quiz.questions.length;
      let correct = 0;
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);

      const logs: ReviewLog[] = [];
      const byQ: Record<string, { selected?: string; correct: boolean }> = {};

      for (const q of quiz.questions) {
        const chosen = body.responses.find((r) => r.questionId === q.id)?.choice || "";
        const isCorrect = chosen === q.answer;
        if (isCorrect) correct += 1;
        byQ[q.id] = { selected: chosen, correct: isCorrect };
        logs.push({ date: dateStr, categoryId: null, flashcardId: q.cardId, correct: isCorrect });
      }

      // Save to local review logs (client-side stats)
      pushReviewLogs(logs);

      const score = Math.round((correct / Math.max(1, total)) * 100);
      return ok({ score, correct, total, details: byQ });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to submit quiz";
      return fail(msg, 500);
    }
  },

  async getQuiz(id: string): Promise<ApiResult<{ id: string; result?: Record<string, unknown> }>> {
    try {
      const quiz = loadQuizLocal(id);
      if (!quiz) return fail("Quiz not found", 404);
      return ok({ id: quiz.id, result: { total: quiz.questions.length } });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load quiz";
      return fail(msg, 500);
    }
  },

  async statsOverview(): Promise<ApiResult<{
    dueToday: number;
    mastered: number;
    accuracy: number;
    streak: number;
    byCategory: Array<{ name: string; accuracy: number }>;
    reviewHeatmap?: Array<{ date: string; reviews: number }>;
  }>> {
    try {
      // Build stats from local review logs for now (no server-side RLS setup required)
      const logs = readReviewLogs();

      const byDate: Record<string, { total: number; correct: number }> = {};
      for (const l of logs) {
        if (!byDate[l.date]) byDate[l.date] = { total: 0, correct: 0 };
        byDate[l.date].total += 1;
        if (l.correct) byDate[l.date].correct += 1;
      }

      // Compute accuracy and streak
      let total = 0;
      let totalCorrect = 0;
      Object.values(byDate).forEach((d) => {
        total += d.total;
        totalCorrect += d.correct;
      });
      const accuracy = total ? Math.round((100 * totalCorrect) / total) : 0;

      // Streak: count consecutive days (ending today) with at least one review
      const today = new Date();
      let streak = 0;
      for (let i = 0; i < 365; i++) {
        const d = new Date(today.getTime() - i * 86400000);
        const key = d.toISOString().slice(0, 10);
        if (byDate[key]?.total > 0) streak += 1;
        else break;
      }

      // Heatmap: last 16 weeks
      const heatmap: Array<{ date: string; reviews: number }> = [];
      for (let i = 16 * 7 - 1; i >= 0; i--) {
        const d = new Date(today.getTime() - i * 86400000);
        const k = d.toISOString().slice(0, 10);
        heatmap.push({ date: k, reviews: byDate[k]?.total || 0 });
      }

      // By category: use categories and flashcards count from Supabase
      const supabase = getSupabaseClient();
      const { data: cats, error: catErr } = await supabase.from("categories").select("id, name");
      if (catErr) return fail(catErr.message, 400);
      // No per-category logs yet (needs flashcard->category mapping during logging). Show 0% by default.
      const byCategory = (cats || []).map((c) => ({ name: c.name || "General", accuracy: 0 }));

      return ok({
        dueToday: 0,
        mastered: 0,
        accuracy,
        streak,
        byCategory,
        reviewHeatmap: heatmap,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load stats";
      return fail(msg, 500);
    }
  },
};
