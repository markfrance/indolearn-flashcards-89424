# Seeding IndoLearn Flashcards in Supabase

Follow these steps to seed your Supabase instance:

1) In Supabase Dashboard > SQL Editor, run Step 1 and Step 2 from assets/supabase.md:
   - Bootstrap RPC public.run_sql
   - Create tables and policies

2) Create demo users in Authentication > Users:
   - demo1@example.com
   - demo2@example.com

3) Copy the UUID of demo1 and replace DEMO_USER_ID in Step 3 in assets/supabase.md, then run it to create:
   - A demo quiz with 5 questions
   - Two quiz attempts for demo1

4) Verify data in Tables:
   - categories (3)
   - word_lists (1: Indonesian 1500)
   - flashcards (5)
   - quizzes, quiz_questions, quiz_attempts (some rows for demo1)

After Step 1 is executed, tooling-based automation can manage tables and seed additional data.
