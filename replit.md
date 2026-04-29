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

## Key Commands

- `pnpm --filter @workspace/edu-portal run dev` — run EDU PORTAL locally
- `pnpm --filter @workspace/edu-portal run build` — production build (output: `artifacts/edu-portal/dist/public`)

## Deployment

- Vercel-ready. Build command `pnpm --filter @workspace/edu-portal run build`, output dir `artifacts/edu-portal/dist/public`. `vercel.json` handles SPA fallback.
- `vite.config.ts` no longer requires `PORT` / `BASE_PATH` env vars — they default for Vercel builds.

## Firestore Security Rules

See the comment block at the bottom of `artifacts/edu-portal/src/lib/firebase.ts` — copy it into Firebase Console → Firestore → Rules.
