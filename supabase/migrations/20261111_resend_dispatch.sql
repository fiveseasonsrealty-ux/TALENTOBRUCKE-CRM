begin;
-- Provider labels only; preserves all sent history and test-only recipient restrictions.
create or replace function public.pei_scheduler_start(run_mode text,allowed_email text)
returns uuid language plpgsql security definer set search_path=public as $$
declare run_id uuid; due integer;
begin
 if run_mode is null or run_mode not in ('simulation','sending') or allowed_email is null
  or lower(allowed_email)<>'fiveseasonsrealty@gmail.com' then raise exception 'Invalid test configuration'; end if;
 -- A stalled external request is ambiguous. Require review instead of automatically resending.
 update candidate_reminders set state='review',dispatch_detail='Resultado incierto; verificar Resend antes de reintentar'
 where state='sending' and dispatched_at<now()-interval '10 minutes';
 select count(*) into due from candidate_reminders r join candidates c on c.id=r.candidate_id
 where r.state='prepared' and r.channel='email' and r.due_at<=now()
  and c.email=lower(allowed_email) and c.replied_at is null and public.pei_contact_allowed(c,'email');
 insert into pei_scheduler_runs(mode,due_count) values(run_mode,due) returning id into run_id;
 return run_id;
end; $$;
create or replace function public.finish_pei_reminder(target_candidate uuid,target_step integer,target_dispatch uuid,message_id text)
returns boolean language plpgsql security definer set search_path=public as $$
begin
 update candidate_reminders set state=case when message_id is not null then 'sent' else 'review' end,
 provider_message_id=message_id,
 dispatch_detail=case when message_id is null then 'Resultado incierto; verificar Resend antes de reintentar' else 'Aceptado por Resend' end
 where candidate_id=target_candidate and step=target_step and dispatch_id=target_dispatch and state='sending';
 return found;
end; $$;
commit;
