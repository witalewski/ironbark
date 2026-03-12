# IRONBARK

A mobile-first exercise tracking web application built with Next.js.

## Features

- **Authentication** — Magic link sign-in via email (Resend)
- **Exercises** — Create and manage exercises with tracking types (sets, reps, weight, time)
- **Workouts** — Build workouts by selecting and ordering exercises
- **Workout Tracker** — Log sets in real-time with per-exercise timers (work / rest / EMOM)
- **History** — Review completed sessions with exercise logs

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) — black/white monochrome aesthetic with Space Mono font
- [Prisma v5](https://www.prisma.io/) — PostgreSQL ORM
- [next-auth@beta](https://authjs.dev/) — passwordless magic-link authentication
- [Resend](https://resend.com/) — email delivery

## Local Development Setup

### 1. Prerequisites

- Node.js 18+
- A PostgreSQL database (local or cloud — [Neon](https://neon.tech) has a generous free tier)
- A [Resend](https://resend.com) account for sending magic-link emails

### 2. Clone & install

```bash
git clone https://github.com/witalewski/ironbark.git
cd ironbark
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in all four values:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgresql://user:pass@localhost:5432/ironbark` |
| `AUTH_SECRET` | Random secret for NextAuth — generate with `openssl rand -base64 32` |
| `AUTH_RESEND_KEY` | Resend API key — get from [resend.com/api-keys](https://resend.com/api-keys) |
| `EMAIL_FROM` | Verified sender address in Resend (use `onboarding@resend.dev` for testing) |

> **Quickest path for email:** in Resend you can send to your own address from `onboarding@resend.dev`
> without verifying a domain. Set `EMAIL_FROM=onboarding@resend.dev`.

### 4. Set up the database

```bash
npx prisma migrate dev --name init
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment (Vercel)

1. Add the four environment variables above in your Vercel project settings.
2. Set `Build Command` to `prisma generate && next build` (already in `vercel.json`).
3. After first deploy run `npx prisma migrate deploy` against your production database.

Vercel Postgres, Neon, and Supabase all work out of the box — just paste the `DATABASE_URL`.

