begin;
alter table public.candidate_reminders
 add column if not exists dispatch_id uuid,
 add column if not exists dispatched_at timestamptz,
 add column if not exists provider_message_id text,
 add column if not exists dispatch_detail text;
alter table public.candidate_reminders drop constraint if exists candidate_reminders_state_check;
alter table public.candidate_reminders add constraint candidate_reminders_state_check
 check(state in ('prepared','cancelled','sending','sent','review'));

create table if not exists public.pei_scheduler_runs (
 id uuid primary key default gen_random_uuid(),
 started_at timestamptz not null default now(),
 finished_at timestamptz,
 mode text not null check(mode in ('simulation','sending')),
 due_count integer not null default 0,
 accepted_count integer not null default 0,
 status text not null default 'started'
);
alter table public.pei_scheduler_runs enable row level security;
revoke all on public.pei_scheduler_runs from public,anon,authenticated,service_role;
grant select on public.pei_scheduler_runs to service_role;

create or replace function public.pei_scheduler_start(run_mode text,allowed_email text)
returns uuid language plpgsql security definer set search_path=public as $$
declare run_id uuid; due integer;
begin
 if run_mode is null or run_mode not in ('simulation','sending') or allowed_email is null
  or lower(allowed_email)<>'fiveseasonsrealty@gmail.com' then raise exception 'Invalid test configuration'; end if;
 -- A stalled external request is ambiguous. Require review instead of automatically resending.
 update candidate_reminders set state='review',dispatch_detail='Resultado incierto; verificar Zoho antes de reintentar'
 where state='sending' and dispatched_at<now()-interval '10 minutes';
 select count(*) into due from candidate_reminders r join candidates c on c.id=r.candidate_id
 where r.state='prepared' and r.channel='email' and r.due_at<=now()
  and c.email=lower(allowed_email) and c.replied_at is null and public.pei_contact_allowed(c,'email');
 insert into pei_scheduler_runs(mode,due_count) values(run_mode,due) returning id into run_id;
 return run_id;
end; $$;

create or replace function public.claim_pei_reminder(allowed_email text)
returns table(candidate_id uuid,step integer,dispatch_id uuid)
language plpgsql security definer set search_path=public as $$
declare target candidates; pending candidate_reminders;
begin
 if allowed_email is null or lower(allowed_email)<>'fiveseasonsrealty@gmail.com' then raise exception 'Test recipient required';end if;
 select c.* into target from candidates c
 where c.email=lower(allowed_email) and c.replied_at is null and public.pei_contact_allowed(c,'email')
 for update skip locked;
 if not found then return;end if;
 -- Dispatch at most one reminder per candidate in a run. A backlog must not send several messages together.
 select r.* into pending from candidate_reminders r where r.candidate_id=target.id
 and r.state='prepared' and r.channel='email' and r.due_at<=now()
 and not exists(select 1 from candidate_reminders active where active.candidate_id=target.id and active.state in ('sending','review'))
 and not exists(select 1 from candidate_reminders recent where recent.candidate_id=target.id and recent.state='sent' and recent.dispatched_at>now()-interval '24 hours')
 order by r.step for update skip locked limit 1;
 if not found then return;end if;
 return query update candidate_reminders r set state='sending',dispatch_id=gen_random_uuid(),dispatched_at=now()
 where r.candidate_id=pending.candidate_id and r.step=pending.step and r.state='prepared'
 returning r.candidate_id,r.step,r.dispatch_id;
end; $$;

create or replace function public.finish_pei_reminder(target_candidate uuid,target_step integer,target_dispatch uuid,message_id text)
returns boolean language plpgsql security definer set search_path=public as $$
begin
 update candidate_reminders set state=case when message_id is not null then 'sent' else 'review' end,
 provider_message_id=message_id,
 dispatch_detail=case when message_id is null then 'Resultado incierto; verificar Zoho antes de reintentar' else 'Aceptado por Zoho' end
 where candidate_id=target_candidate and step=target_step and dispatch_id=target_dispatch and state='sending';
 return found;
end; $$;

create or replace function public.pei_scheduler_finish(target_run uuid,accepted integer,run_status text)
returns void language plpgsql security definer set search_path=public as $$
begin
 if accepted is null or accepted<0 or run_status not in ('completed','review','not_configured') then raise exception 'Invalid result';end if;
 update pei_scheduler_runs set finished_at=now(),accepted_count=accepted,status=run_status where id=target_run and finished_at is null;
end; $$;
revoke all on function public.pei_scheduler_start(text,text),public.claim_pei_reminder(text),
 public.finish_pei_reminder(uuid,integer,uuid,text),public.pei_scheduler_finish(uuid,integer,text)
 from public,anon,authenticated;
grant execute on function public.pei_scheduler_start(text,text),public.claim_pei_reminder(text),
 public.finish_pei_reminder(uuid,integer,uuid,text),public.pei_scheduler_finish(uuid,integer,text)
 to service_role;
commit;
