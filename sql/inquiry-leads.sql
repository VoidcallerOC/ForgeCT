-- Durable inquiry / audit / booking lead queue for Supabase/Postgres.
-- Run once in the Supabase SQL Editor after sql/stripe-webhook-events.sql.
-- Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY on the Vercel project (already used for rate limits).

create extension if not exists pgcrypto;

create table if not exists public.inquiry_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null
    check (status in ('received', 'notified', 'notify_failed', 'replied', 'closed')),
  source text not null
    check (source in ('inquiry', 'audit', 'booking', 'unknown')),
  name text not null,
  email text not null,
  company text,
  site_url text,
  message text,
  provider_message_id text,
  sla_due_at timestamptz
);

create index if not exists inquiry_leads_status_created_at_idx
  on public.inquiry_leads (status, created_at desc);

create index if not exists inquiry_leads_sla_due_at_idx
  on public.inquiry_leads (sla_due_at)
  where sla_due_at is not null and status in ('received', 'notified');

alter table public.inquiry_leads enable row level security;

create or replace function public.insert_inquiry_lead(
  p_source text,
  p_name text,
  p_email text,
  p_company text,
  p_site_url text,
  p_message text,
  p_sla_hours integer
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
  due_at timestamptz;
begin
  if p_source is null or p_name is null or p_email is null then
    raise exception 'Invalid inquiry lead arguments';
  end if;

  if p_sla_hours is not null and p_sla_hours > 0 then
    due_at := now() + make_interval(hours => p_sla_hours);
  end if;

  insert into public.inquiry_leads
    (status, source, name, email, company, site_url, message, sla_due_at)
  values
    (
      'received',
      p_source,
      left(p_name, 100),
      left(p_email, 254),
      nullif(left(coalesce(p_company, ''), 120), ''),
      nullif(left(coalesce(p_site_url, ''), 500), ''),
      nullif(left(coalesce(p_message, ''), 4000), ''),
      due_at
    )
  returning id into new_id;

  return new_id;
end;
$$;

create or replace function public.update_inquiry_lead_delivery(
  p_lead_id uuid,
  p_status text,
  p_provider_message_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_lead_id is null then
    raise exception 'Inquiry lead id is required';
  end if;
  if p_status is null or p_status not in ('notified', 'notify_failed') then
    raise exception 'Invalid delivery status';
  end if;

  update public.inquiry_leads
  set status = p_status,
      provider_message_id = nullif(left(coalesce(p_provider_message_id, ''), 200), ''),
      updated_at = now()
  where id = p_lead_id
    and status in ('received', 'notified', 'notify_failed');
end;
$$;

revoke all on function public.insert_inquiry_lead(text, text, text, text, text, text, integer)
  from public, anon, authenticated;
revoke all on function public.update_inquiry_lead_delivery(uuid, text, text)
  from public, anon, authenticated;

grant execute on function public.insert_inquiry_lead(text, text, text, text, text, text, integer)
  to service_role;
grant execute on function public.update_inquiry_lead_delivery(uuid, text, text)
  to service_role;
