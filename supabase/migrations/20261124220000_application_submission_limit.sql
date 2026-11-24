begin;

set local lock_timeout = '3s';
set local statement_timeout = '15s';

create function public.normalize_application_phone(value text)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select case
    when digits = '' then null
    when char_length(digits) = 9 then '+998' || digits
    else '+' || ltrim(digits, '0')
  end
  from (select regexp_replace(value, '[^0-9]', '', 'g') as digits) as normalized;
$$;

create table public.application_phone_cooldowns (
  phone text primary key,
  next_submission_at timestamptz not null
);

alter table public.application_phone_cooldowns enable row level security;
revoke all on public.application_phone_cooldowns from public, anon, authenticated, service_role;

-- Keep inserts from slipping between the historical check and trigger creation.
lock table public.applications in share row exclusive mode;

insert into public.application_phone_cooldowns (phone, next_submission_at)
select phone, max(created_at) + interval '4 hours'
from (
  select public.normalize_application_phone(phone) as phone, created_at
  from public.applications
  where created_at > statement_timestamp() - interval '4 hours'
    and created_at <= statement_timestamp()
) as recent_applications
where phone ~ '^[+][0-9]{9,15}$'
group by phone;

create function public.enforce_application_phone_cooldown()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_phone text := public.normalize_application_phone(new.phone);
  retry_after_seconds integer;
begin
  if normalized_phone is null or normalized_phone !~ '^[+][0-9]{9,15}$' then
    return new;
  end if;

  -- The unique phone key serializes concurrent submissions for the same number.
  insert into public.application_phone_cooldowns as cooldown (phone, next_submission_at)
  values (normalized_phone, clock_timestamp() + interval '4 hours')
  on conflict (phone) do update
    set next_submission_at = clock_timestamp() + interval '4 hours'
    where cooldown.next_submission_at <= clock_timestamp();

  if not found then
    select greatest(1, ceil(extract(epoch from next_submission_at - clock_timestamp()))::integer)
    into retry_after_seconds
    from public.application_phone_cooldowns
    where phone = normalized_phone;

    raise sqlstate 'PT429'
      using message = 'application_phone_cooldown', detail = retry_after_seconds::text;
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_application_phone_cooldown() from public, anon, authenticated, service_role;

create trigger trg_applications_phone_cooldown
  after insert on public.applications
  for each row execute function public.enforce_application_phone_cooldown();

commit;
