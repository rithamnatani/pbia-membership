create index if not exists idx_profiles_email_lower
  on public.profiles (lower(email));

create index if not exists idx_memberships_primary_user_id
  on public.memberships (primary_user_id);

create index if not exists idx_memberships_membership_year
  on public.memberships (membership_year);

create index if not exists idx_memberships_status
  on public.memberships (status);

create index if not exists idx_memberships_payment_status
  on public.memberships (payment_status);

create index if not exists idx_memberships_submitted_at
  on public.memberships (submitted_at desc);

create index if not exists idx_household_members_membership_id
  on public.household_members (membership_id);

create index if not exists idx_payment_records_membership_id
  on public.payment_records (membership_id);

create index if not exists idx_payment_records_received_at
  on public.payment_records (received_at desc);
