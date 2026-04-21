# GEMINI.md - Competitive Goal Tracker

## Project Overview
A web-based platform for tracking and competing on personal and group goals. Built with modern web technologies, it allows users to create goal lists, invite members via invite codes, and track progress with updates.

### Core Technologies
- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (via Prisma ORM)
- **Authentication:** NextAuth.js (v5 Beta)
- **Styling:** Tailwind CSS v4
- **State Management:** React Server Actions and `revalidatePath` for data mutations.

### Architecture
- `src/app/`: Next.js pages, layouts, and API routes.
- `src/actions/`: Server Actions for database mutations (goals, lists, auth).
- `src/components/`: Reusable React components (UI/UX).
- `src/lib/`: Shared utilities, Prisma client, and authentication guards.
- `src/types/`: Custom TypeScript interfaces and types.
- `prisma/`: Database schema and migration configuration.

## Building and Running

### Prerequisites
- Node.js (v20+)
- PostgreSQL database (Neon Database recommended)

### Setup
1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Environment Variables:**
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"
    NEXTAUTH_SECRET="your-secret-key"
    NEXTAUTH_URL="http://localhost:3000"
    ```
3.  **Database Migration:**
    ```bash
    npx prisma db push
    ```

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production
```bash
npm run build
npm run start
```

## Development Conventions

### Data Access & Mutations
- **Prisma Client:** Always import the shared Prisma instance from `@/lib/prisma`.
- **Server Actions:** Use Server Actions (`"use server"`) for all data mutations. Place them in `src/actions/`.
- **Cache Invalidation:** Use `revalidatePath` or `revalidateTag` in server actions to ensure the UI updates after mutations.
- **Authentication:** Use the `requireAuth()` helper from `@/lib/auth-guard` in server actions to enforce user sessions.

### UI & Styling
- **Tailwind CSS:** Use Tailwind CSS for all styling. Favor utility classes over custom CSS.
- **Client Components:** Use `"use client"` only when necessary (e.g., for hooks like `useFormStatus`, `useState`, or event listeners).
- **Forms:** Prefer native `<form>` elements with Server Actions. Use the `FormButton` component to handle loading states via `useFormStatus`.

## Maintenance & Automation

The Gemini CLI agent is responsible for handling all database maintenance and deployment tasks. This includes:

- **Database Schema Sync:** Running `npx prisma db push` whenever the schema changes.
- **Client Generation:** Ensuring `npx prisma generate` is run after schema updates.
- **Environment Management:** Generating and rotating `AUTH_SECRET` values.

### Current Setup Status
- **AUTH_SECRET:** A secure key has been generated and set in `.env`.
- **Database Status:** Pending a valid `DATABASE_URL` in `.env` to perform the initial `db push`.

Whenever the `schema.prisma` is modified, the agent will automatically attempt to sync the changes with the live host.
