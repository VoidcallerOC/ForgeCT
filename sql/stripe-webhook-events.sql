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

-- Shared fixed-window rate limiting for public sensitive API endpoints.
create table if not exists public.api_rate_limits (
  bucket text not null,
  client_key text not null,
  window_start timestamptz not null,
  request_count integer not null,
  primary key (bucket, client_key, window_start)
);

create index if not exists api_rate_limits_window_start_idx
  on public.api_rate_limits (window_start);

alter table public.api_rate_limits enable row level security;

create or replace function public.increment_rate_limit(
  p_bucket text,
  p_client_key text,
  p_window_seconds integer,
  p_max_requests integer
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  current_window timestamptz;
  current_count integer;
begin
  if p_bucket is null or p_client_key is null or p_window_seconds <= 0 or p_max_requests <= 0 then
    raise exception 'Invalid rate limit arguments';
  end if;

  current_window := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  insert into public.api_rate_limits (bucket, client_key, window_start, request_count)
  values (p_bucket, p_client_key, current_window, 1)
  on conflict (bucket, client_key, window_start) do update
    set request_count = public.api_rate_limits.request_count + 1
  returning request_count into current_count;

  delete from public.api_rate_limits
  where window_start < current_window - make_interval(secs => p_window_seconds);

  return current_count;
end;
$$;

revoke all on function public.increment_rate_limit(text, text, integer, integer)
  from public, anon, authenticated;
