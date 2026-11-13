begin;
-- Additive migration; apply after 202610_crm_invitations.sql in an isolated database first.
alter table public.candidates
  add column if not exists professional_score integer,
  add column if not exists germany_readiness integer,
  add column if not exists horizon text,
  add column if not exists gaps jsonb not null default '[]',
  add column if not exists pei_version text,
  add column if not exists pei_breakdown jsonb,
  add column if not exists pei_eligible boolean,
  add column if not exists evaluation_reason text,
  add column if not exists evaluation_token uuid,
  add column if not exists email_consent boolean not null default false,
  add column if not exists whatsapp_consent boolean not null default false,
  add column if not exists contact_preferences_at timestamptz,
  add column if not exists replied_at timestamptz,
  add column if not exists opted_out_at timestamptz;
alter table public.activities
  add column if not exists result text,
  add column if not exists next_action text,
  add column if not exists follow_up_at timestamptz,
  add column if not exists follow_up_status text,
  add column if not exists responsible text,
  add column if not exists channel text;

create table if not exists public.candidate_evaluations (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id),
  created_at timestamptz not null default now(),
  version text not null, reason text not null,
  token uuid not null unique default gen_random_uuid(), snapshot jsonb not null
);
alter table public.candidate_evaluations enable row level security;
revoke all on public.candidate_evaluations from anon, authenticated, service_role;
grant select on public.candidate_evaluations to service_role;
-- Preserve the current legacy result before any recalculation. Earlier overwritten data is unrecoverable here.
insert into public.candidate_evaluations(candidate_id,version,reason,snapshot)
select c.id, coalesce(c.pei_version,'LEGACY'), 'MIGRATION_BASELINE', to_jsonb(c)
from public.candidates c where not exists
  (select 1 from public.candidate_evaluations e where e.candidate_id=c.id);
create or replace function public.archive_candidate_evaluation() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  if tg_op='INSERT' or new.evaluation_token is distinct from old.evaluation_token then
    insert into candidate_evaluations(candidate_id,version,reason,token,snapshot)
    values(new.id,coalesce(new.pei_version,'LEGACY'),coalesce(new.evaluation_reason,'FORM_SUBMITTED'),
      coalesce(new.evaluation_token,gen_random_uuid()),to_jsonb(new));
  end if;
  return new;
end; $$;
drop trigger if exists archive_candidate_evaluation on public.candidates;
create trigger archive_candidate_evaluation after insert or update on public.candidates
for each row execute function public.archive_candidate_evaluation();

create or replace function public.pei_contact_allowed(c public.candidates, channel_name text) returns boolean
language sql stable set search_path=public as $$
select coalesce(c.studies_completed is true and c.score>=50 and c.manual_status<>'No apto'
  and c.education in ('technical','technologist','engineering','masters')
  and c.profile in ('engineer','technician','technical_other') and c.specialty<>'nontechnical'
  and c.pei_version='PEI-1.0' and c.pei_eligible is true and c.consent is true and c.opted_out_at is null
  and case channel_name when 'email' then c.email_consent when 'whatsapp' then c.whatsapp_consent else false end,false);
$$;
create or replace function public.enqueue_candidate_invitation() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  -- Recalculation never queues contact; migrated candidates require explicit later review.
  if new.evaluation_reason='FORM_SUBMITTED' and public.pei_contact_allowed(new,'email')
    and new.replied_at is null and new.manual_status='Nuevo' and new.invitation_sent_at is null then
    insert into candidate_invitations(candidate_id) values(new.id) on conflict do nothing;
  end if;
  return new;
end; $$;
create or replace function public.claim_candidate_invitation(target_id uuid default null)
returns setof public.candidate_invitations
language plpgsql security definer set search_path=public as $$
declare picked uuid;
begin
  select q.candidate_id into picked from candidate_invitations q join candidates c on c.id=q.candidate_id
  where q.state='pending' and (target_id is null or c.id=target_id)
    and public.pei_contact_allowed(c,'email') and c.replied_at is null
    and c.evaluation_reason='FORM_SUBMITTED' and c.manual_status='Nuevo' and c.invitation_sent_at is null
  order by q.created_at for update of q skip locked limit 1;
  if picked is null then return; end if;
  return query update candidate_invitations q set state='sending',attempted_at=now(),recipient=c.email
    from candidates c where q.candidate_id=picked and c.id=picked returning q.*;
end; $$;

create or replace function public.recalculate_candidate_pei(target_id uuid, expected_token uuid, result jsonb)
returns uuid language plpgsql security definer set search_path=public as $$
declare c candidates; next_token uuid:=gen_random_uuid();
begin
  select * into c from candidates where id=target_id for update;
  if not found then raise exception 'Candidato no encontrado'; end if;
  if c.evaluation_token is distinct from expected_token then raise exception 'La evaluación cambió; vuelve a cargar'; end if;
  if result->>'version'<>'PEI-1.0' or (result->>'score')::integer not between 0 and 100 then
    raise exception 'Resultado PEI no válido';
  end if;
  update candidates set pei_version=result->>'version',pei_breakdown=result->'breakdown',
    pei_eligible=(result->>'eligible')::boolean,score=(result->>'score')::integer,
    classification=result->>'classification',professional_score=(result->>'professionalScore')::integer,
    germany_readiness=(result->>'germanyReadiness')::integer,horizon=result->>'horizon',
    flags=result->'flags',gaps=result->'gaps',evaluation_reason='RECALCULATED',
    evaluation_token=next_token,updated_at=now() where id=target_id;
  -- Disable any old queued invitation; no email, consent or pipeline stage changes.
  update candidate_invitations set state='skipped',detail='Recalculado; requiere revisión de contacto'
    where candidate_id=target_id and state='pending';
  return next_token;
end; $$;

create table if not exists public.candidate_reminders (
  candidate_id uuid not null references public.candidates(id),
  step integer not null check(step between 1 and 3),
  channel text not null check(channel in ('email','whatsapp')),
  first_confirmed_at timestamptz not null,due_at timestamptz not null,
  state text not null default 'prepared' check(state in ('prepared','cancelled','sent')),
  cancelled_reason text,
  primary key(candidate_id,step)
);
alter table public.candidate_reminders enable row level security;
revoke all on public.candidate_reminders from anon,authenticated;
grant select on public.candidate_reminders to service_role;
-- No sender or scheduler: only prepare one sequence after the initial email is accepted.
create or replace function public.prepare_candidate_reminders() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  if new.invitation_sent_at is not null and old.invitation_sent_at is null and new.replied_at is null then
    insert into candidate_reminders(candidate_id,step,channel,first_confirmed_at,due_at)
    select new.id,s.step,s.channel,new.invitation_sent_at,new.invitation_sent_at+make_interval(hours=>s.hours)
    from (values(1,'whatsapp',24),(2,'email',48),(3,'whatsapp',72)) s(step,channel,hours)
    where public.pei_contact_allowed(new,s.channel) on conflict do nothing;
  end if;
  return new;
end; $$;
drop trigger if exists prepare_candidate_reminders on public.candidates;
create trigger prepare_candidate_reminders after update on public.candidates
for each row execute function public.prepare_candidate_reminders();
create or replace function public.cancel_candidate_contacts() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  if new.replied_at is not null or new.opted_out_at is not null or not public.pei_contact_allowed(new,'email') then
    update candidate_invitations set state='skipped',detail='Respuesta, baja o contacto no autorizado'
      where candidate_id=new.id and state='pending';
  end if;
  update candidate_reminders r set state='cancelled',cancelled_reason='Respuesta, baja o contacto no autorizado'
    where r.candidate_id=new.id and r.state='prepared' and
      (new.replied_at is not null or new.opted_out_at is not null or not public.pei_contact_allowed(new,r.channel));
  return new;
end; $$;
drop trigger if exists cancel_candidate_contacts on public.candidates;
create trigger cancel_candidate_contacts after update on public.candidates
for each row execute function public.cancel_candidate_contacts();
create or replace function public.record_candidate_contact_event(target_id uuid, event_name text)
returns void language plpgsql security definer set search_path=public as $$
declare c candidates;
begin
  if event_name not in ('REPLIED','OPTED_OUT') then raise exception 'Evento no válido'; end if;
  select * into c from candidates where id=target_id for update;
  if not found then raise exception 'Candidato no encontrado'; end if;
  if event_name='REPLIED' and c.replied_at is null then
    update candidates set replied_at=now(),updated_at=now() where id=target_id;
    insert into activities(candidate_id,activity_type,description) values(target_id,'REPLIED','Respuesta registrada; secuencia detenida');
  elsif event_name='OPTED_OUT' and c.opted_out_at is null then
    update candidates set opted_out_at=now(),email_consent=false,whatsapp_consent=false,updated_at=now() where id=target_id;
    insert into activities(candidate_id,activity_type,description) values(target_id,'OPTED_OUT','Baja registrada; comunicaciones bloqueadas');
  end if;
end; $$;
revoke all on function public.record_candidate_contact_event(uuid,text) from public,anon,authenticated;
grant execute on function public.record_candidate_contact_event(uuid,text) to service_role;
-- Remove inherited default PUBLIC execution on privileged functions.
revoke all on function public.archive_candidate_evaluation(),public.pei_contact_allowed(public.candidates,text),
 public.enqueue_candidate_invitation(),public.claim_candidate_invitation(uuid),
 public.recalculate_candidate_pei(uuid,uuid,jsonb),public.prepare_candidate_reminders(),public.cancel_candidate_contacts()
 from public,anon,authenticated;
grant execute on function public.recalculate_candidate_pei(uuid,uuid,jsonb),public.claim_candidate_invitation(uuid) to service_role;
commit;
