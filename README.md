# PBIA Membership Portal MVP

Production-focused MVP for Palm Beach Indian Association membership management.

## Mission
To promote Indian cultural activities in South Florida and Palm Beach County.

## Programs
PBIA celebrates Indian culture through programs such as India Day, a day-long celebration of music, food, and dance from across the Indian subcontinent shared with residents of Palm Beach and neighboring counties.

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui components
- Supabase Auth with Google OAuth
- Supabase Postgres + Row Level Security (RLS)
- @supabase/ssr (no deprecated auth helpers)
- Vercel deployment

## MVP Features
- Google sign-in and auth callback handling
- Member profile capture:
  - first_name, last_name, email, dob, phone, address, occupation optional
- Membership plans:
  - single, couple, family
- Dynamic household collection:
  - single: 0 additional members
  - couple: exactly 1 additional member
  - family: up to 6 additional members
- Membership application by year (for example 2026-27)
- Manual payment methods:
  - zelle, check, cash
- Submission status flow:
  - submit => status=submitted, payment_status=pending
- Dedicated payment instructions page with optional Zelle QR image support
- Member dashboard:
  - profile, membership history, detail view, renewal flow
- Basic admin dashboard:
  - review submissions
  - mark payment received
  - activate membership
- Event placeholder route (no event management logic yet)

## Security and RLS
- Membership/member tables are not publicly readable or writable.
- RLS is enabled for all membership-related tables.
- Users can only access their own profile/memberships/household/payment records.
- Officer actions are gated through `public.officer_accounts` + `public.is_officer()`.
- Privileged payment status transitions are implemented through SQL RPC functions.

## Database Schema
Defined in migrations under `supabase/migrations`.

Core tables:
- `profiles`
- `membership_plans`
- `memberships`
- `household_members`
- `payment_records`
- `officer_accounts`

Seed data:
- `membership_plans` is seeded in migration with `single`, `couple`, `family`.

## Local Setup
1. Install dependencies:
   - `npm install`
2. Copy env file:
   - `cp .env.example .env.local`
3. Fill required env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Optional env var:
   - `NEXT_PUBLIC_ZELLE_QR_PATH=/zelle-qr.png`
5. Run dev server:
   - `npm run dev`

## Supabase Setup
1. Link or initialize your Supabase project with Supabase CLI.
2. Apply migrations in order from `supabase/migrations`.
3. Enable Google provider in Supabase Auth settings.
4. Set auth redirect URL:
   - `https://<your-domain>/auth/callback`
5. Add at least one officer account by inserting a user id into `public.officer_accounts`.

## Database Type Generation
After schema updates, regenerate and commit types:

```bash
supabase gen types typescript --linked > database.types.ts
```

If you use a local Supabase instance, replace with your preferred CLI target.

## Routes
Public:
- `/`
- `/membership`
- `/login`
- `/payment-instructions`
- `/events`

Protected:
- `/dashboard`
- `/dashboard/profile`
- `/dashboard/membership`
- `/dashboard/membership/new`
- `/dashboard/membership/renew`
- `/dashboard/membership/[id]`
- `/admin` (officers only)

## Deployment (Vercel)
1. Push repository to GitHub.
2. Import project in Vercel.
3. Configure env vars in Vercel project settings.
4. Ensure Supabase Auth redirect URLs include Vercel production domain.
5. Deploy.

## Current Non-Goals
- Stripe integration (schema is prepared to support later expansion)
- Event management workflows beyond placeholder routes
