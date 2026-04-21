# AGENTS.md

Guidance for coding agents working in this repository.

## Project Purpose
PBIA Membership Portal MVP for Palm Beach Indian Association:
- Google-authenticated member onboarding and renewals
- Manual payment workflows (Zelle, check, cash)
- Officer review and activation

## Core Stack
- Next.js App Router (TypeScript)
- Tailwind + shadcn/ui
- Supabase Auth + Postgres
- `@supabase/ssr` (required)

## Non-Negotiables
1. Do not use deprecated Supabase auth helper packages.
2. Keep RLS enabled and correct for all membership/member data.
3. Never make membership/member tables publicly readable or writable.
4. Keep manual payment support first-class.
5. Do not add Stripe yet.
6. Do not add event-management logic yet (placeholder routes/pages only).

## Auth and Access Pattern
- Server client: `lib/supabase/server.ts`
- Browser client: `lib/supabase/client.ts`
- Request/session guard: `proxy.ts` + `utils/supabase/middleware.ts`
- Officer access gate: `public.officer_accounts` + `public.is_officer()`
- Admin route: `/admin` (officers only)

## Database and Migrations
- Schema migrations live in `supabase/migrations`.
- Keep changes forward-only with new migration files.
- Existing core tables:
  - `profiles`
  - `membership_plans`
  - `memberships`
  - `household_members`
  - `payment_records`
  - `officer_accounts`
- RPCs used by app:
  - `submit_membership_application`
  - `admin_record_payment`

## Type Safety
- DB typings are in `database.types.ts`.
- After schema changes, regenerate and commit:

```bash
supabase gen types typescript --linked > database.types.ts
```

- Keep `createServerClient` and `createBrowserClient` generic with `Database`.

## Product Rules to Preserve
- Plan rules:
  - single => 0 additional household members
  - couple => exactly 1 additional household member
  - family => up to 6 additional household members
- Membership submit state:
  - `status = submitted`
  - `payment_status = pending`
- Payment methods in MVP:
  - `zelle`, `check`, `cash`

## UI and UX Expectations
- Mobile-friendly and accessible forms.
- Community/nonprofit tone, not SaaS startup tone.
- Keep PBIA branding assets in use:
  - Logo asset: `public/pbia-oneline.svg`
- Payment guidance page:
  - `/payment-instructions`
  - Optional QR image via `NEXT_PUBLIC_ZELLE_QR_PATH` or `public/zelle-qr.png`

## Suggested Change Workflow
1. Read related page/component and migration history first.
2. Prefer minimal patches over broad refactors.
3. Preserve existing route protection and RLS assumptions.
4. Run lint after edits:
   - `npm run lint`
5. If DB schema changes, verify app queries still align and update `database.types.ts`.

## Common Pitfalls
- Accidentally introducing public access policies on protected tables.
- Mixing old auth helper patterns with `@supabase/ssr`.
- Breaking renewal flow by hardcoding membership year logic.
- Adding payments complexity before manual flow is stable.
