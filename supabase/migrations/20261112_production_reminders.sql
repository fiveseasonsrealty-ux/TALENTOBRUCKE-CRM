begin;
-- Run only after the PEI, email-only, inbound, dispatch and Resend migrations.
-- This file installs no cron job, sends no mail and changes no candidate.
create or replace function public.pei_production_scheduler_start()
returns uuid language plpgsql security definer set search_path=public as $$
declare run_id uuid; due integer;
begin
 update candidate_reminders set state='review',dispatch_detail='Resultado incierto; verificar Resend antes de reintentar'
 where state='sending' and dispatched_at<now()-interval '10 minutes';
 select count(*) into due from candidate_reminders r join candidates c on c.id=r.candidate_id
 where r.state='prepared' and r.channel='email' and r.due_at<=now()
 and c.invitation_sent_at is not null and c.replied_at is null and public.pei_contact_allowed(c,'email');
 insert into pei_scheduler_runs(mode,due_count) values('sending',due) returning id into run_id;
 return run_id;
end; $$;

create or replace function public.claim_pei_production_reminder()
returns table(candidate_id uuid,step integer,dispatch_id uuid,recipient text)
language plpgsql security definer set search_path=public as $$
declare target candidates; pending candidate_reminders;
begin
 -- Lock the candidate first, matching reply/opt-out operations and avoiding duplicate claims.
 select c.* into target from candidates c
 where c.invitation_sent_at is not null and c.replied_at is null and public.pei_contact_allowed(c,'email')
 and exists(select 1 from candidate_reminders r where r.candidate_id=c.id and r.state='prepared' and r.channel='email' and r.due_at<=now())
 and not exists(select 1 from candidate_reminders r where r.candidate_id=c.id and r.state in ('sending','review'))
 and not exists(select 1 from candidate_reminders r where r.candidate_id=c.id and r.state='sent' and r.dispatched_at>now()-interval '24 hours')
 order by (select min(r.due_at) from candidate_reminders r where r.candidate_id=c.id and r.state='prepared'),c.id
 for update of c skip locked limit 1;
 if not found then return;end if;
 select r.* into pending from candidate_reminders r where r.candidate_id=target.id and r.channel='email' and r.state='prepared' and r.due_at<=now()
 order by r.step for update skip locked limit 1;
 if not found then return;end if;
 return query update candidate_reminders r set state='sending',dispatch_id=gen_random_uuid(),dispatched_at=now()
 where r.candidate_id=pending.candidate_id and r.step=pending.step and r.state='prepared'
 returning r.candidate_id,r.step,r.dispatch_id,target.email;
end; $$;
revoke all on function public.pei_production_scheduler_start(),public.claim_pei_production_reminder() from public,anon,authenticated;
grant execute on function public.pei_production_scheduler_start(),public.claim_pei_production_reminder() to service_role;
commit;
