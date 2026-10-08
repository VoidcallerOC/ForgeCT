-- Forge-CT proposal system (MVP).
-- Run once in the Supabase SQL Editor after sql/inquiry-leads.sql.
-- Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY on the Vercel project.

create extension if not exists pgcrypto;

create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null
    check (status in (
      'DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'EXPIRED', 'DECLINED', 'ARCHIVED',
      'PAYMENT_PENDING', 'PAYMENT_RECEIVED', 'PAYMENT_FAILED'
    )),
  version integer not null default 1 check (version >= 1),
  business_name text not null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  website text,
  address text,
  hubspot_ref text,
  project_title text not null,
  scope_text text not null default '',
  timeline_text text not null default '',
  terms_text text not null default '',
  package_id text,
  line_items jsonb not null default '[]'::jsonb,
  subtotal_cents integer not null default 0 check (subtotal_cents >= 0),
  deposit_cents integer not null default 0 check (deposit_cents >= 0),
  currency text not null default 'usd',
  expires_at timestamptz,
  sent_at timestamptz,
  viewed_at timestamptz,
  accepted_at timestamptz,
  declined_at timestamptz,
  archived_at timestamptz,
  payment_pending_at timestamptz,
  payment_received_at timestamptz,
  payment_failed_at timestamptz,
  acceptance jsonb,
  snapshot jsonb,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  lead_id uuid,
  notes text
);

create index if not exists proposals_status_updated_at_idx
  on public.proposals (status, updated_at desc);

create index if not exists proposals_contact_email_idx
  on public.proposals (contact_email);

create table if not exists public.proposal_events (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals (id) on delete cascade,
  public_id text not null,
  created_at timestamptz not null default now(),
  event_type text not null,
  from_status text,
  to_status text,
  version integer,
  actor text not null default 'system',
  detail jsonb not null default '{}'::jsonb
);

create index if not exists proposal_events_proposal_id_created_at_idx
  on public.proposal_events (proposal_id, created_at desc);

alter table public.proposals enable row level security;
alter table public.proposal_events enable row level security;

create or replace function public.proposal_insert(
  p_public_id text,
  p_business_name text,
  p_contact_name text,
  p_contact_email text,
  p_contact_phone text,
  p_website text,
  p_address text,
  p_hubspot_ref text,
  p_project_title text,
  p_scope_text text,
  p_timeline_text text,
  p_terms_text text,
  p_package_id text,
  p_line_items jsonb,
  p_subtotal_cents integer,
  p_deposit_cents integer,
  p_currency text,
  p_expires_at timestamptz,
  p_lead_id uuid,
  p_notes text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.proposals%rowtype;
begin
  if p_public_id is null or p_business_name is null or p_contact_name is null
     or p_contact_email is null or p_project_title is null then
    raise exception 'Invalid proposal insert arguments';
  end if;

  insert into public.proposals (
    public_id, status, version,
    business_name, contact_name, contact_email, contact_phone,
    website, address, hubspot_ref,
    project_title, scope_text, timeline_text, terms_text, package_id,
    line_items, subtotal_cents, deposit_cents, currency,
    expires_at, lead_id, notes
  ) values (
    left(p_public_id, 64),
    'DRAFT',
    1,
    left(p_business_name, 200),
    left(p_contact_name, 120),
    left(p_contact_email, 254),
    nullif(left(coalesce(p_contact_phone, ''), 40), ''),
    nullif(left(coalesce(p_website, ''), 500), ''),
    nullif(left(coalesce(p_address, ''), 500), ''),
    nullif(left(coalesce(p_hubspot_ref, ''), 120), ''),
    left(p_project_title, 200),
    left(coalesce(p_scope_text, ''), 20000),
    left(coalesce(p_timeline_text, ''), 4000),
    left(coalesce(p_terms_text, ''), 20000),
    nullif(left(coalesce(p_package_id, ''), 80), ''),
    coalesce(p_line_items, '[]'::jsonb),
    greatest(coalesce(p_subtotal_cents, 0), 0),
    greatest(coalesce(p_deposit_cents, 0), 0),
    coalesce(nullif(p_currency, ''), 'usd'),
    p_expires_at,
    p_lead_id,
    nullif(left(coalesce(p_notes, ''), 4000), '')
  )
  returning * into row;

  insert into public.proposal_events
    (proposal_id, public_id, event_type, to_status, version, actor, detail)
  values
    (row.id, row.public_id, 'created', 'DRAFT', 1, 'admin', '{}'::jsonb);

  return to_jsonb(row);
end;
$$;

create or replace function public.proposal_get_by_public_id(p_public_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.proposals%rowtype;
begin
  select * into row from public.proposals where public_id = p_public_id;
  if not found then
    return null;
  end if;
  return to_jsonb(row);
end;
$$;

create or replace function public.proposal_list(p_include_archived boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return coalesce(
    (
      select jsonb_agg(to_jsonb(p) order by p.updated_at desc)
      from public.proposals p
      where p_include_archived or p.status <> 'ARCHIVED'
    ),
    '[]'::jsonb
  );
end;
$$;

create or replace function public.proposal_update_draft(
  p_public_id text,
  p_business_name text,
  p_contact_name text,
  p_contact_email text,
  p_contact_phone text,
  p_website text,
  p_address text,
  p_hubspot_ref text,
  p_project_title text,
  p_scope_text text,
  p_timeline_text text,
  p_terms_text text,
  p_package_id text,
  p_line_items jsonb,
  p_subtotal_cents integer,
  p_deposit_cents integer,
  p_currency text,
  p_expires_at timestamptz,
  p_notes text,
  p_bump_version boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.proposals%rowtype;
  next_version integer;
begin
  select * into row from public.proposals where public_id = p_public_id for update;
  if not found then
    raise exception 'Proposal not found';
  end if;
  if row.status not in ('DRAFT', 'SENT', 'VIEWED') then
    raise exception 'Proposal is not editable in status %', row.status;
  end if;

  next_version := row.version;
  if p_bump_version and row.status in ('SENT', 'VIEWED') then
    next_version := row.version + 1;
  end if;

  update public.proposals set
    business_name = left(p_business_name, 200),
    contact_name = left(p_contact_name, 120),
    contact_email = left(p_contact_email, 254),
    contact_phone = nullif(left(coalesce(p_contact_phone, ''), 40), ''),
    website = nullif(left(coalesce(p_website, ''), 500), ''),
    address = nullif(left(coalesce(p_address, ''), 500), ''),
    hubspot_ref = nullif(left(coalesce(p_hubspot_ref, ''), 120), ''),
    project_title = left(p_project_title, 200),
    scope_text = left(coalesce(p_scope_text, ''), 20000),
    timeline_text = left(coalesce(p_timeline_text, ''), 4000),
    terms_text = left(coalesce(p_terms_text, ''), 20000),
    package_id = nullif(left(coalesce(p_package_id, ''), 80), ''),
    line_items = coalesce(p_line_items, '[]'::jsonb),
    subtotal_cents = greatest(coalesce(p_subtotal_cents, 0), 0),
    deposit_cents = greatest(coalesce(p_deposit_cents, 0), 0),
    currency = coalesce(nullif(p_currency, ''), 'usd'),
    expires_at = p_expires_at,
    notes = nullif(left(coalesce(p_notes, ''), 4000), ''),
    version = next_version,
    status = case when p_bump_version and row.status in ('SENT', 'VIEWED') then 'DRAFT' else row.status end,
    snapshot = case when p_bump_version and row.status in ('SENT', 'VIEWED') then null else row.snapshot end,
    sent_at = case when p_bump_version and row.status in ('SENT', 'VIEWED') then null else row.sent_at end,
    viewed_at = case when p_bump_version and row.status in ('SENT', 'VIEWED') then null else row.viewed_at end,
    updated_at = now()
  where id = row.id
  returning * into row;

  insert into public.proposal_events
    (proposal_id, public_id, event_type, from_status, to_status, version, actor, detail)
  values
    (
      row.id,
      row.public_id,
      case when p_bump_version then 'version_bumped' else 'updated' end,
      null,
      row.status,
      row.version,
      'admin',
      jsonb_build_object('bump', coalesce(p_bump_version, false))
    );

  return to_jsonb(row);
end;
$$;

create or replace function public.proposal_transition(
  p_public_id text,
  p_from_statuses text[],
  p_to_status text,
  p_event_type text,
  p_actor text,
  p_detail jsonb,
  p_snapshot jsonb,
  p_acceptance jsonb,
  p_stripe_checkout_session_id text,
  p_stripe_payment_intent_id text,
  p_timestamp_field text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.proposals%rowtype;
  from_status text;
begin
  select * into row from public.proposals where public_id = p_public_id for update;
  if not found then
    raise exception 'Proposal not found';
  end if;

  from_status := row.status;
  if not (from_status = any (p_from_statuses)) then
    raise exception 'Invalid transition from % to %', from_status, p_to_status;
  end if;

  update public.proposals set
    status = p_to_status,
    snapshot = coalesce(p_snapshot, snapshot),
    acceptance = coalesce(p_acceptance, acceptance),
    stripe_checkout_session_id = coalesce(p_stripe_checkout_session_id, stripe_checkout_session_id),
    stripe_payment_intent_id = coalesce(p_stripe_payment_intent_id, stripe_payment_intent_id),
    sent_at = case when p_timestamp_field = 'sent_at' then now() else sent_at end,
    viewed_at = case when p_timestamp_field = 'viewed_at' then coalesce(viewed_at, now()) else viewed_at end,
    accepted_at = case when p_timestamp_field = 'accepted_at' then now() else accepted_at end,
    declined_at = case when p_timestamp_field = 'declined_at' then now() else declined_at end,
    archived_at = case when p_timestamp_field = 'archived_at' then now() else archived_at end,
    payment_pending_at = case when p_timestamp_field = 'payment_pending_at' then now() else payment_pending_at end,
    payment_received_at = case when p_timestamp_field = 'payment_received_at' then now() else payment_received_at end,
    payment_failed_at = case when p_timestamp_field = 'payment_failed_at' then now() else payment_failed_at end,
    updated_at = now()
  where id = row.id
  returning * into row;

  insert into public.proposal_events
    (proposal_id, public_id, event_type, from_status, to_status, version, actor, detail)
  values
    (
      row.id,
      row.public_id,
      p_event_type,
      from_status,
      p_to_status,
      row.version,
      coalesce(nullif(p_actor, ''), 'system'),
      coalesce(p_detail, '{}'::jsonb)
    );

  return to_jsonb(row);
end;
$$;

create or replace function public.proposal_list_events(p_public_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return coalesce(
    (
      select jsonb_agg(to_jsonb(e) order by e.created_at asc)
      from public.proposal_events e
      where e.public_id = p_public_id
    ),
    '[]'::jsonb
  );
end;
$$;

revoke all on function public.proposal_insert(text, text, text, text, text, text, text, text, text, text, text, text, text, jsonb, integer, integer, text, timestamptz, uuid, text)
  from public, anon, authenticated;
revoke all on function public.proposal_get_by_public_id(text)
  from public, anon, authenticated;
revoke all on function public.proposal_list(boolean)
  from public, anon, authenticated;
revoke all on function public.proposal_update_draft(text, text, text, text, text, text, text, text, text, text, text, text, text, jsonb, integer, integer, text, timestamptz, text, boolean)
  from public, anon, authenticated;
revoke all on function public.proposal_transition(text, text[], text, text, text, jsonb, jsonb, jsonb, text, text, text)
  from public, anon, authenticated;
revoke all on function public.proposal_list_events(text)
  from public, anon, authenticated;

grant execute on function public.proposal_insert(text, text, text, text, text, text, text, text, text, text, text, text, text, jsonb, integer, integer, text, timestamptz, uuid, text)
  to service_role;
grant execute on function public.proposal_get_by_public_id(text)
  to service_role;
grant execute on function public.proposal_list(boolean)
  to service_role;
grant execute on function public.proposal_update_draft(text, text, text, text, text, text, text, text, text, text, text, text, text, jsonb, integer, integer, text, timestamptz, text, boolean)
  to service_role;
grant execute on function public.proposal_transition(text, text[], text, text, text, jsonb, jsonb, jsonb, text, text, text)
  to service_role;
grant execute on function public.proposal_list_events(text)
  to service_role;
