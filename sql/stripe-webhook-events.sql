-- Durable Stripe webhook replay protection for Supabase/Postgres.
-- Run once in the Supabase SQL Editor.

create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  status text not null check (status in ('processing', 'processed')),
  claimed_at timestamptz not null default now(),
  processed_at timestamptz,
  expires_at timestamptz not null
);

create index if not exists stripe_webhook_events_expires_at_idx
  on public.stripe_webhook_events (expires_at);

alter table public.stripe_webhook_events enable row level security;

create or replace function public.claim_stripe_webhook_event(
  p_event_id text,
  p_lease_seconds integer,
  p_retention_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed boolean;
begin
  delete from public.stripe_webhook_events
  where expires_at <= now();

  insert into public.stripe_webhook_events
    (event_id, status, claimed_at, expires_at)
  values
    (p_event_id, 'processing', now(), now() + make_interval(secs => p_lease_seconds))
  on conflict (event_id) do update
    set status = 'processing',
        claimed_at = now(),
        processed_at = null,
        expires_at = now() + make_interval(secs => p_lease_seconds)
    where public.stripe_webhook_events.status = 'processing'
      and public.stripe_webhook_events.expires_at <= now()
  returning true into claimed;

  return coalesce(claimed, false);
end;
$$;

create or replace function public.mark_stripe_webhook_event_processed(
  p_event_id text,
  p_retention_seconds integer
)
returns void
language sql
security definer
set search_path = public
as $$
  update public.stripe_webhook_events
  set status = 'processed',
      processed_at = now(),
      expires_at = now() + make_interval(secs => p_retention_seconds)
  where event_id = p_event_id;
$$;

create or replace function public.release_stripe_webhook_event(p_event_id text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.stripe_webhook_events
  where event_id = p_event_id and status = 'processing';
$$;

revoke all on function public.claim_stripe_webhook_event(text, integer, integer) from public, anon, authenticated;
revoke all on function public.mark_stripe_webhook_event_processed(text, integer) from public, anon, authenticated;
revoke all on function public.release_stripe_webhook_event(text) from public, anon, authenticated;
