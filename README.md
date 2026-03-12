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
- [Tailwind CSS](https://tailwindcss.com/) — black/white monochrome aesthetic with system monospace font
- [Prisma v5](https://www.prisma.io/) — PostgreSQL ORM
- [next-auth@beta](https://authjs.dev/) — authentication
- [Resend](https://resend.com/) — email delivery

## Getting Started

1. Copy `.env.example` to `.env` and fill in values
2. Run `npx prisma migrate dev` to set up the database
3. Run `npm run dev` to start the development server

## Deployment

See `vercel.json` for Vercel deployment configuration.
