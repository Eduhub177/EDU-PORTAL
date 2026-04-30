# Workspace

## Overview

EDU PORTAL — a complete educational platform for teachers and students (classes 6–12), built as a React + Vite single-page app backed by Firebase Firestore.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js**: 24
- **TypeScript**: 5.9
- **Frontend**: React 19 + Vite + react-router-dom + framer-motion + recharts + Tailwind v4 + shadcn UI
- **Database**: Firebase Firestore (real-time `onSnapshot` listeners everywhere)
- **Auth**: custom phone + password (SHA-256 hash) with simulated SMS OTP

## Key Files

- `artifacts/edu-portal/src/lib/firebase.ts` — Firebase config (paste your keys here OR use `VITE_FIREBASE_*` env vars).
- `artifacts/edu-portal/src/lib/auth.tsx` — custom auth + AuthProvider context.
- `artifacts/edu-portal/.env.example` — template for env-based Firebase config.
- `artifacts/edu-portal/vercel.json` — SPA rewrite rules for Vercel.

## Firestore Collections

- `users` · `exams` · `questionBank` · `results` · `notifications` · `otps`

## Subjects

20 supported subjects centralized in `src/lib/constants.ts` (`SUBJECTS`): English, Mathematics, Science, Social Science, Hindi, Bengali, Sanskrit, Physics, Chemistry, Biology, History, Geography, Civics, Economics, Computer Science, Physical Education, Art, Music, Environmental Science, Moral Science. `subjectColor()` in `src/lib/utils.ts` returns a unique color for each.

## Exam Lifecycle

- Exams have `status: "draft" | "published"`.
- `teacher/exams.tsx` shows two tabs (Drafts / Published) with edit, publish, move-to-draft, and delete (cascades to results) actions.
- `teacher/create-exam.tsx` is slide-based: question-count selector (5/10/15/20/25/30/Custom), one question per slide with Prev/Next + dot navigation, Review & Publish on the last slide. Supports image upload from library or rear-camera capture (Firebase Storage). Options are pre-labeled A/B/C/D with colored borders and a green-glow radio for the correct answer. Auto-saves to a draft doc 1.5s after the last edit.

## Real Data Only

All dashboards (teacher home, student home, student exams/leaderboard/progress, teacher students/inventory, landing) are wired to Firestore via `useCollection`. No mocked/fake data is rendered — pages show empty-state messages until real data exists.

## Key Commands

- `pnpm --filter @workspace/edu-portal run dev` — run EDU PORTAL locally
- `pnpm --filter @workspace/edu-portal run build` — production build (output: `artifacts/edu-portal/dist/public`)

## Deployment

- Vercel-ready. Build command `pnpm --filter @workspace/edu-portal run build`, output dir `artifacts/edu-portal/dist/public`. `vercel.json` handles SPA fallback.
- `vite.config.ts` no longer requires `PORT` / `BASE_PATH` env vars — they default for Vercel builds.

## Firestore Security Rules

See the comment block at the bottom of `artifacts/edu-portal/src/lib/firebase.ts` — copy it into Firebase Console → Firestore → Rules.
