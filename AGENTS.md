<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Competitive Goal Tracker

## Purpose

This is a small competitive goal-tracking app built with the Next.js App Router.
Users create accounts, join one or more shared goal lists, add personal goals to a list, and compare progress on a per-list leaderboard.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Prisma 6
- PostgreSQL via Neon (`DATABASE_URL`)
- NextAuth v5 beta with a credentials provider
- Tailwind CSS 4

## Project Layout

- `src/app/`
  - `page.tsx`: redirects to `/dashboard` for signed-in users, otherwise `/login`
  - `(auth)/login/page.tsx`: sign-in page
  - `(auth)/signup/page.tsx`: sign-up page
  - `dashboard/page.tsx`: shows a user's lists plus summary stats
  - `lists/new/page.tsx`: create a new list
  - `lists/join/[code]/page.tsx`: join a list by invite code
  - `lists/[id]/page.tsx`: list detail page with leaderboard and grouped goals
  - `api/auth/[...nextauth]/route.ts`: NextAuth route handlers
- `src/actions/`
  - `auth.ts`: signup/login server actions
  - `lists.ts`: create/join/leave list server actions
  - `goals.ts`: create goal, update status, delete goal
- `src/lib/`
  - `auth.ts`: NextAuth config plus exported `auth`, `signIn`, `signOut`, `handlers`
  - `auth-guard.ts`: `requireAuth()` helper that redirects unauthenticated users to `/login`
  - `prisma.ts`: shared Prisma client
- `prisma/schema.prisma`: schema for users, lists, memberships, goals, and updates

## Data Model

The Prisma schema currently defines:

- `User`
- `GoalList`
- `GoalListMember`
- `Goal`
- `GoalUpdate`

Notes:

- `GoalListMember` is the membership join table between users and lists.
- `Goal.status` is an enum: `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`.
- `Goal.completedAt` is set only when a goal is marked completed.
- `GoalUpdate` exists in the schema but is not surfaced in the UI yet.

## Auth Flow

- Auth uses NextAuth v5 with a credentials provider only.
- Passwords are hashed with `bcryptjs`.
- Sessions use the `jwt` strategy.
- The session callback adds `user.id` to `session.user`.
- The custom sign-in page is `/login`.

## Main User Flows

### Account creation

- `signup` validates name/email/password, rejects duplicate emails, hashes the password, creates the user, then signs them in and redirects to `/dashboard`.

### Login

- `login` calls `signIn("credentials", { redirect: false })` and redirects to `/dashboard` on success.

### Lists

- Users can belong to multiple lists.
- Creating a list also creates the creator's membership.
- Invite codes are generated with `crypto.randomBytes(4).toString("hex")`.
- Joining a list by code is idempotent for existing members.
- `leaveList()` exists as a server action, but there is no current UI that calls it.

### Goals

- Goals belong to both a user and a list.
- The list detail page lets any member add their own goals to that list.
- Only the goal owner can change status or delete a goal.
- Status cycles in this order:
  - `NOT_STARTED -> IN_PROGRESS`
  - `IN_PROGRESS -> COMPLETED`
  - `COMPLETED -> NOT_STARTED`

## Current UI Behavior

- Dashboard:
  - shows all lists the signed-in user belongs to
  - shows per-user summary counts from all of that user's goals
  - has an invite-code form that redirects to `/lists/join/[code]`
- List detail page:
  - checks membership server-side and returns `notFound()` for non-members
  - builds a leaderboard sorted by number of completed goals
  - shows all members' goals side by side, grouped by member
  - highlights the signed-in user in the leaderboard and member sections

## Setup

To run the app locally:

1. Create a Neon Postgres database and copy the connection string.
2. Set `DATABASE_URL` in `.env`.
3. Set `AUTH_SECRET` in `.env`.
   Example: `openssl rand -base64 32`
4. Run Prisma migrations:
   `npx prisma migrate dev --name init`
5. Start the app:
   `npm run dev`

## Important Notes For Agents

- The generated Prisma client is imported from `@/generated/prisma/client`.
- This repo is on Next.js 16. Check current local Next.js docs before making framework-level assumptions.
- `README.md` is still the default `create-next-app` template and does not describe the real project.
- Server actions are the mutation path for auth, lists, and goals. Keep that pattern unless intentionally refactoring.
- `GoalUpdate` is present in the schema but effectively unused; treat it as a reserved extension point rather than a finished feature.
- If you add membership-sensitive behavior, follow the existing pattern of server-side membership checks before exposing list data or mutations.
