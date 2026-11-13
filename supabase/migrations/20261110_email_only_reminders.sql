begin;
-- Preserve already sent/cancelled history; move only pending preparation to email.
update public.candidate_reminders r
set channel=case when public.pei_contact_allowed(c,'email') and c.replied_at is null then 'email' else r.channel end,
    state=case when public.pei_contact_allowed(c,'email') and c.replied_at is null then 'prepared' else 'cancelled' end,
    cancelled_reason=case when public.pei_contact_allowed(c,'email') and c.replied_at is null then null else 'Estrategia solo email: sin autorización o secuencia detenida' end
from public.candidates c where c.id=r.candidate_id and r.state='prepared';
create or replace function public.prepare_candidate_reminders() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  if new.invitation_sent_at is not null and old.invitation_sent_at is null
     and new.replied_at is null and public.pei_contact_allowed(new,'email') then
    insert into candidate_reminders(candidate_id,step,channel,first_confirmed_at,due_at)
    select new.id,s.step,'email',new.invitation_sent_at,new.invitation_sent_at+make_interval(hours=>s.hours)
    from (values(1,24),(2,48),(3,72)) s(step,hours) on conflict do nothing;
  end if;
  return new;
end; $$;
do $$ begin
 if not exists(select 1 from pg_constraint where conname='candidate_reminders_prepared_email_only'
   and conrelid='public.candidate_reminders'::regclass) then
  alter table public.candidate_reminders add constraint candidate_reminders_prepared_email_only
   check(state<>'prepared' or channel='email');
 end if;
end; $$;
revoke all on function public.prepare_candidate_reminders() from public,anon,authenticated;
commit;
