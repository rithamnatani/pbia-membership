create extension if not exists pgcrypto;

do $$
begin
  create type public.membership_plan_code as enum ('single', 'couple', 'family');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.membership_status as enum (
    'draft',
    'submitted',
    'active',
    'expired',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.payment_status as enum ('pending', 'paid', 'waived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.payment_method as enum ('zelle', 'check', 'cash', 'other', 'none');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.membership_plans (
  code public.membership_plan_code primary key,
  name text not null,
  max_additional_members integer not null,
  price_cents integer,
  is_active boolean not null default true,
  constraint membership_plans_price_cents_check check (price_cents is null or price_cents >= 0),
  constraint membership_plans_max_additional_members_check check (max_additional_members >= 0)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text not null unique,
  dob date,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  occupation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  primary_user_id uuid not null references public.profiles(id) on delete cascade,
  plan_code public.membership_plan_code not null references public.membership_plans(code),
  membership_year text not null,
  status public.membership_status not null default 'draft',
  payment_status public.payment_status not null default 'pending',
  payment_method public.payment_method not null default 'none',
  payment_reference text,
  submitted_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.household_members (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid not null references public.memberships(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  relationship_to_primary text not null,
  dob date,
  email text,
  phone text
);

create table if not exists public.payment_records (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid not null references public.memberships(id) on delete cascade,
  method public.payment_method not null,
  amount_cents integer,
  reference text not null,
  notes text,
  received_by text not null,
  received_at timestamptz not null default now(),
  constraint payment_records_amount_cents_check check (amount_cents is null or amount_cents >= 0)
);

create table if not exists public.officer_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'first_name', ''),
    nullif(new.raw_user_meta_data ->> 'last_name', '')
  )
  on conflict (id) do update
  set email = excluded.email;

  return new;
end;
$$;

create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set email = new.email
  where id = new.id;

  return new;
end;
$$;

create or replace function public.is_officer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.officer_accounts officer_accounts
    where officer_accounts.user_id = auth.uid()
  );
$$;

create or replace function public.enforce_household_member_limit()
returns trigger
language plpgsql
as $$
declare
  max_additional_members integer;
  household_member_count integer;
begin
  select mp.max_additional_members
  into max_additional_members
  from public.memberships m
  join public.membership_plans mp on mp.code = m.plan_code
  where m.id = new.membership_id;

  if max_additional_members is null then
    raise exception 'Membership plan not found for membership %', new.membership_id;
  end if;

  select count(*)
  into household_member_count
  from public.household_members
  where membership_id = new.membership_id;

  if tg_op = 'UPDATE' and new.membership_id = old.membership_id then
    household_member_count := household_member_count - 1;
  end if;

  if household_member_count >= max_additional_members then
    raise exception 'Membership % allows at most % additional household members',
      new.membership_id,
      max_additional_members;
  end if;

  return new;
end;
$$;

create or replace function public.enforce_membership_plan_limit()
returns trigger
language plpgsql
as $$
declare
  max_additional_members integer;
  household_member_count integer;
begin
  if new.plan_code is distinct from old.plan_code then
    select mp.max_additional_members
    into max_additional_members
    from public.membership_plans mp
    where mp.code = new.plan_code;

    if max_additional_members is null then
      raise exception 'Membership plan % not found', new.plan_code;
    end if;

    select count(*)
    into household_member_count
    from public.household_members
    where membership_id = new.id;

    if household_member_count > max_additional_members then
      raise exception 'Membership % already has % additional household members, which exceeds plan limit %',
        new.id,
        household_member_count,
        max_additional_members;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
after update of email on auth.users
for each row
execute function public.handle_user_email_change();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_memberships_updated_at on public.memberships;
create trigger set_memberships_updated_at
before update on public.memberships
for each row
execute function public.set_updated_at();

drop trigger if exists enforce_household_member_limit on public.household_members;
create trigger enforce_household_member_limit
before insert or update on public.household_members
for each row
execute function public.enforce_household_member_limit();

drop trigger if exists enforce_membership_plan_limit on public.memberships;
create trigger enforce_membership_plan_limit
before update of plan_code on public.memberships
for each row
execute function public.enforce_membership_plan_limit();

alter table public.membership_plans enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.household_members enable row level security;
alter table public.payment_records enable row level security;
alter table public.officer_accounts enable row level security;

drop policy if exists "Public can read active membership plans" on public.membership_plans;
create policy "Public can read active membership plans"
on public.membership_plans
for select
using (is_active);

drop policy if exists "Officers can view officer accounts" on public.officer_accounts;
create policy "Officers can view officer accounts"
on public.officer_accounts
for select
using (user_id = auth.uid() or public.is_officer());

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
using (id = auth.uid() or public.is_officer());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Officers can update profiles" on public.profiles;
create policy "Officers can update profiles"
on public.profiles
for update
using (public.is_officer())
with check (public.is_officer());

drop policy if exists "Users can read own memberships" on public.memberships;
create policy "Users can read own memberships"
on public.memberships
for select
using (primary_user_id = auth.uid() or public.is_officer());

drop policy if exists "Users can create own memberships" on public.memberships;
create policy "Users can create own memberships"
on public.memberships
for insert
with check (primary_user_id = auth.uid());

drop policy if exists "Officers can insert memberships" on public.memberships;
create policy "Officers can insert memberships"
on public.memberships
for insert
with check (public.is_officer());

drop policy if exists "Users can update own memberships" on public.memberships;
create policy "Users can update own memberships"
on public.memberships
for update
using (primary_user_id = auth.uid())
with check (primary_user_id = auth.uid());

drop policy if exists "Officers can update memberships" on public.memberships;
create policy "Officers can update memberships"
on public.memberships
for update
using (public.is_officer())
with check (public.is_officer());

drop policy if exists "Users can read own household members" on public.household_members;
create policy "Users can read own household members"
on public.household_members
for select
using (
  exists (
    select 1
    from public.memberships memberships
    where memberships.id = household_members.membership_id
      and (memberships.primary_user_id = auth.uid() or public.is_officer())
  )
);

drop policy if exists "Users can create own household members" on public.household_members;
create policy "Users can create own household members"
on public.household_members
for insert
with check (
  exists (
    select 1
    from public.memberships memberships
    where memberships.id = household_members.membership_id
      and (memberships.primary_user_id = auth.uid() or public.is_officer())
  )
);

drop policy if exists "Users can update own household members" on public.household_members;
create policy "Users can update own household members"
on public.household_members
for update
using (
  exists (
    select 1
    from public.memberships memberships
    where memberships.id = household_members.membership_id
      and memberships.primary_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.memberships memberships
    where memberships.id = household_members.membership_id
      and (memberships.primary_user_id = auth.uid() or public.is_officer())
  )
);

drop policy if exists "Users can delete own household members" on public.household_members;
create policy "Users can delete own household members"
on public.household_members
for delete
using (
  exists (
    select 1
    from public.memberships memberships
    where memberships.id = household_members.membership_id
      and (memberships.primary_user_id = auth.uid() or public.is_officer())
  )
);

drop policy if exists "Officers can manage household members" on public.household_members;
create policy "Officers can manage household members"
on public.household_members
for all
using (public.is_officer())
with check (public.is_officer());

drop policy if exists "Users can read own payment records" on public.payment_records;
create policy "Users can read own payment records"
on public.payment_records
for select
using (
  exists (
    select 1
    from public.memberships memberships
    where memberships.id = payment_records.membership_id
      and (memberships.primary_user_id = auth.uid() or public.is_officer())
  )
);

drop policy if exists "Officers can manage payment records" on public.payment_records;
create policy "Officers can manage payment records"
on public.payment_records
for all
using (public.is_officer())
with check (public.is_officer());

insert into public.membership_plans (code, name, max_additional_members, price_cents, is_active)
values
  ('single', 'Single', 0, null, true),
  ('couple', 'Couple', 1, null, true),
  ('family', 'Family', 6, null, true)
on conflict (code) do update
set
  name = excluded.name,
  max_additional_members = excluded.max_additional_members,
  price_cents = excluded.price_cents,
  is_active = excluded.is_active;