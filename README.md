<div align="center">

# 🛒 AmzPulse

### Track Amazon prices. Catch the drops. Never overpay again.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#-license)

</div>

---

## 📖 About

**AmzPulse** is a sleek, modern Amazon price-tracking dashboard. Paste any Amazon product URL and AmzPulse watches it for you — recording daily snapshots, charting historical trends, and pinging you the moment a price drops.

Built for **deal hunters, smart shoppers, and anyone tired of refreshing Amazon tabs**, AmzPulse turns price tracking into a clean, data-driven experience.

---

## ✨ Key Features

- 🔎 **One-click product tracking** — paste an Amazon URL, AmzPulse handles the rest
- 📉 **Daily price history** — append-only snapshots power beautiful trend charts
- 🔔 **Price-drop notifications** — get alerted when a tracked product goes on sale
- 📊 **Interactive charts** — visualize price movement over time with smooth line graphs
- 🔐 **Secure Google sign-in** — NextAuth v5 with per-user data isolation
- 🌗 **Polished light & dark themes** — carefully tuned for both modes
- 📱 **Fully responsive** — built mobile-first, looks great on every screen
- 🎞️ **Motion-rich UI** — subtle animations that feel premium, not noisy
- ⚡ **Built on the latest stack** — Next.js 15 App Router + React 19 + Turbopack
- 🤖 **Automated refreshes** — a secured cron endpoint keeps every product fresh daily

---

## 🛠️ Tech Stack

| Layer            | Technology                                    |
| ---------------- | --------------------------------------------- |
| **Framework**    | Next.js 15 (App Router, Turbopack)            |
| **UI**           | React 19, Tailwind CSS v4, shadcn/ui (Radix)  |
| **Language**     | TypeScript 5                                  |
| **Database**     | PostgreSQL + Prisma 6 ORM                     |
| **Auth**         | NextAuth v5 (Google OAuth)                    |
| **Data Source**  | Real-Time Amazon Data API (RapidAPI)          |
| **Testing**      | Vitest                                        |
| **Package Mgr**  | Bun                                           |

---

## 📸 Screenshots

> _Screenshots coming soon._

<div align="center">

| Dashboard | Product Detail | Dark Mode |
| :-------: | :------------: | :-------: |
| _(placeholder)_ | _(placeholder)_ | _(placeholder)_ |

</div>

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 20+
- A PostgreSQL database (local or hosted — e.g. Neon, Supabase, Railway)
- A [RapidAPI](https://rapidapi.com/) key for the **Real-Time Amazon Data** API
- Google OAuth credentials (from [Google Cloud Console](https://console.cloud.google.com/))

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/your-username/amzpulse.git
cd amzpulse

# 2. Install dependencies
bun install

# 3. Set up environment variables
cp .env.example .env.local
# then edit .env.local with your credentials (see table below)

# 4. Push the Prisma schema to your database
bun run db:push

# 5. Start the dev server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) — you're live.

### Build for production

```bash
bun run build
bun start
```

---

## 🔐 Environment Variables

Create a `.env.local` file at the project root with the following values:

| Variable               | Required | Description                                                                                       |
| ---------------------- | :------: | ------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`         |    ✅    | PostgreSQL connection string used by Prisma                                                       |
| `RAPIDAPI_KEY`         |    ✅    | RapidAPI key for the **Real-Time Amazon Data** endpoint                                           |
| `AUTH_GOOGLE_ID`       |    ✅    | Google OAuth client ID (NextAuth provider)                                                        |
| `AUTH_GOOGLE_SECRET`   |    ✅    | Google OAuth client secret                                                                        |
| `AUTH_SECRET`          |    ✅    | NextAuth session encryption secret (generate with `openssl rand -base64 32`)                      |
| `CRON_SECRET`          |    ✅    | Shared bearer token required by `GET /api/products/refresh` — used by your external scheduler     |

---

## 🔁 Scheduled Refresh

AmzPulse exposes a cron-friendly endpoint that re-scrapes every tracked product, appends a new daily history snapshot, and creates a notification when a price drops:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://your-domain.com/api/products/refresh
```

Wire this up with [Vercel Cron](https://vercel.com/docs/cron-jobs), GitHub Actions, or any external scheduler running once per day.

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ☕ and a dash of impatience for Amazon's price tags.

</div>
