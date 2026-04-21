create or replace function public.submit_membership_application(
  p_profile jsonb,
  p_plan_code public.membership_plan_code,
  p_membership_year text,
  p_payment_method public.payment_method,
  p_payment_reference text default null,
  p_household_members jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_membership_id uuid;
  v_max_additional_members integer;
  v_household_count integer;
  v_household_member jsonb;
  v_email text;
begin
  if v_user_id is null then
    raise exception 'You must be authenticated to submit membership.';
  end if;

  if jsonb_typeof(coalesce(p_household_members, '[]'::jsonb)) <> 'array' then
    raise exception 'Household members must be provided as an array.';
  end if;

  select membership_plans.max_additional_members
  into v_max_additional_members
  from public.membership_plans membership_plans
  where membership_plans.code = p_plan_code
    and membership_plans.is_active = true;

  if v_max_additional_members is null then
    raise exception 'Selected membership plan is not active.';
  end if;

  v_household_count := jsonb_array_length(coalesce(p_household_members, '[]'::jsonb));

  if p_plan_code = 'single' and v_household_count <> 0 then
    raise exception 'Single memberships cannot include additional members.';
  end if;

  if p_plan_code = 'couple' and v_household_count <> 1 then
    raise exception 'Couple memberships require exactly one additional member.';
  end if;

  if p_plan_code = 'family' and v_household_count > 6 then
    raise exception 'Family memberships allow at most six additional members.';
  end if;

  if v_household_count > v_max_additional_members then
    raise exception 'This membership plan allows only % additional members.', v_max_additional_members;
  end if;

  v_email := nullif(trim(coalesce(p_profile ->> 'email', '')), '');
  if v_email is null then
    raise exception 'Primary member email is required.';
  end if;

  insert into public.profiles (
    id,
    first_name,
    last_name,
    email,
    dob,
    phone,
    address_line1,
    address_line2,
    city,
    state,
    postal_code,
    occupation
  )
  values (
    v_user_id,
    nullif(trim(coalesce(p_profile ->> 'first_name', '')), ''),
    nullif(trim(coalesce(p_profile ->> 'last_name', '')), ''),
    v_email,
    nullif(trim(coalesce(p_profile ->> 'dob', '')), '')::date,
    nullif(trim(coalesce(p_profile ->> 'phone', '')), ''),
    nullif(trim(coalesce(p_profile ->> 'address_line1', '')), ''),
    nullif(trim(coalesce(p_profile ->> 'address_line2', '')), ''),
    nullif(trim(coalesce(p_profile ->> 'city', '')), ''),
    nullif(trim(coalesce(p_profile ->> 'state', '')), ''),
    nullif(trim(coalesce(p_profile ->> 'postal_code', '')), ''),
    nullif(trim(coalesce(p_profile ->> 'occupation', '')), '')
  )
  on conflict (id) do update
  set
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    email = excluded.email,
    dob = excluded.dob,
    phone = excluded.phone,
    address_line1 = excluded.address_line1,
    address_line2 = excluded.address_line2,
    city = excluded.city,
    state = excluded.state,
    postal_code = excluded.postal_code,
    occupation = excluded.occupation;

  insert into public.memberships (
    primary_user_id,
    plan_code,
    membership_year,
    status,
    payment_status,
    payment_method,
    payment_reference,
    submitted_at
  )
  values (
    v_user_id,
    p_plan_code,
    p_membership_year,
    'submitted',
    'pending',
    p_payment_method,
    nullif(trim(coalesce(p_payment_reference, '')), ''),
    now()
  )
  returning id into v_membership_id;

  for v_household_member in
    select value
    from jsonb_array_elements(coalesce(p_household_members, '[]'::jsonb))
  loop
    if nullif(trim(coalesce(v_household_member ->> 'first_name', '')), '') is null
      or nullif(trim(coalesce(v_household_member ->> 'last_name', '')), '') is null
      or nullif(trim(coalesce(v_household_member ->> 'relationship_to_primary', '')), '') is null then
      raise exception 'Each additional household member requires first name, last name, and relationship.';
    end if;

    insert into public.household_members (
      membership_id,
      first_name,
      last_name,
      relationship_to_primary,
      dob,
      email,
      phone
    )
    values (
      v_membership_id,
      nullif(trim(coalesce(v_household_member ->> 'first_name', '')), ''),
      nullif(trim(coalesce(v_household_member ->> 'last_name', '')), ''),
      nullif(trim(coalesce(v_household_member ->> 'relationship_to_primary', '')), ''),
      nullif(trim(coalesce(v_household_member ->> 'dob', '')), '')::date,
      nullif(trim(coalesce(v_household_member ->> 'email', '')), ''),
      nullif(trim(coalesce(v_household_member ->> 'phone', '')), '')
    );
  end loop;

  return v_membership_id;
end;
$$;

create or replace function public.admin_record_payment(
  p_membership_id uuid,
  p_reference text default null,
  p_notes text default null,
  p_mark_active boolean default false
)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_received_by text;
  v_membership public.memberships%rowtype;
  v_reference text;
begin
  if v_user_id is null then
    raise exception 'You must be authenticated to perform this action.';
  end if;

  if not public.is_officer() then
    raise exception 'Only officers can record payments.';
  end if;

  select *
  into v_membership
  from public.memberships memberships
  where memberships.id = p_membership_id;

  if not found then
    raise exception 'Membership % was not found.', p_membership_id;
  end if;

  select
    coalesce(
      nullif(trim(concat_ws(' ', profiles.first_name, profiles.last_name)), ''),
      nullif(trim(profiles.email), ''),
      'officer'
    )
  into v_received_by
  from public.profiles profiles
  where profiles.id = v_user_id;

  v_reference :=
    coalesce(
      nullif(trim(coalesce(p_reference, '')), ''),
      nullif(trim(coalesce(v_membership.payment_reference, '')), ''),
      p_membership_id::text
    );

  insert into public.payment_records (
    membership_id,
    method,
    amount_cents,
    reference,
    notes,
    received_by,
    received_at
  )
  values (
    p_membership_id,
    v_membership.payment_method,
    null,
    v_reference,
    coalesce(p_notes, 'Manual payment recorded during admin review.'),
    coalesce(v_received_by, 'officer'),
    now()
  );

  update public.memberships memberships
  set
    payment_status = 'paid',
    status = case when p_mark_active then 'active' else memberships.status end,
    approved_at = case when p_mark_active then coalesce(memberships.approved_at, now()) else memberships.approved_at end
  where memberships.id = p_membership_id;
end;
$$;

grant execute on function public.submit_membership_application(
  jsonb,
  public.membership_plan_code,
  text,
  public.payment_method,
  text,
  jsonb
) to authenticated;

grant execute on function public.admin_record_payment(
  uuid,
  text,
  text,
  boolean
) to authenticated;