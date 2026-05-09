# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication

Always respond in Ukrainian.

## Commands

Package manager is **bun** (see `bun.lockb`).

- `bun dev` — Next.js dev server with Turbopack
- `bun run build` — runs `prisma generate && next build` (Prisma generation is required before build, as enforced for Vercel deploys)
- `bun start` — serve the production build
- `bun run lint` — ESLint via `eslint-config-next`
- `bun run db:push` — push Prisma schema to the database; uses `dotenv -e .env.local` so it reads from `.env.local` rather than the default env

There is no test runner configured.

## Required environment variables

- `DATABASE_URL` — PostgreSQL connection string (Prisma datasource)
- `RAINFOREST_API_KEY` — Rainforest API key for Amazon product scraping
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` and `AUTH_SECRET` — NextAuth v5 with Google provider

Local env lives in `.env.local`.

## Architecture

Next.js 15 App Router + React 19 + Tailwind v4 + shadcn/ui (Radix). Auth is NextAuth v5 (Google), Prisma 6 over PostgreSQL.

### Prisma client location (non-standard)

The Prisma client is generated to `generated/prisma` (configured in `prisma/schema.prisma` via `output = "../generated/prisma"`), **not** `node_modules/@prisma/client`. Always import via `@/lib/db` (which re-exports a `prisma` instance from `../../generated/prisma`). Do not import `@prisma/client` directly. Because the generated client lives in-tree, `prisma generate` must run before `next build` (already wired in the `build` script).

### Data model (`prisma/schema.prisma`)

- `Product` — a tracked product per user (`@@unique([amazonId, userEmail])`). Stores the **current** snapshot; `price` is in **cents** (integer).
- `ProductDataHistory` — append-only daily snapshots keyed by `amazonId` (no FK; not user-scoped). Used for charts and price-drop detection.
- `Notification` — per-user price-drop notifications.

Prices are stored as integer cents; ratings are stored as integer × 10 (see `productScraper.ts`). UI must divide accordingly.

### Auth & routing

- `src/auth.ts` exports `{ handlers, signIn, signOut, auth }` from NextAuth.
- `src/middleware.ts` re-exports `auth` as the middleware, so **every** request is gated by NextAuth session middleware by default. There is no `matcher` config — any added public route needs an explicit matcher or it will be wrapped in auth.
- API auth handler: `src/app/api/auth/[...nextauth]/route.ts`.
- Server actions in `src/actions/productActions.ts` always re-check `await auth()` and scope mutations by `session.user.email`. Follow this pattern for new mutations — `userEmail` is the tenant key throughout the schema.

### Scraping & refresh job

- `src/lib/productScraper.ts` calls Rainforest API (`api.rainforestapi.com`) by ASIN; returns the shape used by both `Product` and `ProductDataHistory`.
- `src/app/api/products/refresh/route.ts` is a `GET` endpoint that iterates every `Product`, skips any that already have a `ProductDataHistory` row created today (`isToday`), otherwise scrapes a new snapshot, updates the `Product` price, and creates a `Notification` if yesterday's price was higher than today's. This route is intended to be hit by an external scheduler (cron) — it is **not** auth-scoped and processes all users in one pass.

Note: `puppeteer` is a dependency but the active scraper uses Rainforest; Puppeteer code may be legacy/unused.

### UI structure

- `src/app/page.tsx` is the dashboard entry; major views live in `src/components/` (`Dashboard`, `Sidebar`, `LoginView`, `AddProductForm`, `LineChart`, etc.).
- `src/components/ui/` is shadcn/ui-generated; `components.json` configures shadcn. Re-running shadcn add will overwrite these.
- Image domain `m.media-amazon.com` is whitelisted in `next.config.ts` for `next/image`.

## Coding Principles

Adapted from [Karpathy coding principles](https://github.com/forrestchang/andrej-karpathy-skills). User-facing responses remain in Ukrainian (see "Communication").

### 1. Think Before Coding

Surface assumptions and uncertainties before editing. If a request has two valid readings (e.g. "add a notification" — `PRICE_DROP` or `TARGET_HIT`?), stop and ask rather than silently picking one. The same applies to the Prisma schema, the price-in-cents convention, and the `userEmail` tenant scope — clarify first if it isn't obvious from the code.

### 2. Simplicity First

Write the minimum code that solves the stated problem. No speculative abstractions, "future-proof" helpers, or feature flags. Check: would a senior engineer call this overcomplicated? In this project that means: don't add layers on top of server actions / `@/lib/db`, don't duplicate scraper logic, and don't build new UI components if `src/components/ui/` already has the right shadcn primitive.

### 3. Surgical Changes

Edit only what the request requires. Match the existing style (Tailwind v4, shadcn, server actions with `await auth()`); don't refactor neighboring files "while you're there." Every changed line must trace directly to the task. If you spot an unrelated issue, file it separately — don't mix it into the current PR.

### 4. Goal-Driven Execution

Restate the task as measurable success criteria before starting. For features from `PLAN.md`, sync with the phase checklist; for bugs, describe how to reproduce and verify. After changes: `bun run lint` and `bun run build` (which includes `prisma generate`) as the minimum gate, plus manual checks via `bun dev`, since there is no test runner.
