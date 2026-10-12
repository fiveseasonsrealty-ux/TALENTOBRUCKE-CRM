begin;

-- Independent eligibility marker: retain the previous pipeline stage for audit.
alter table public.candidates add column if not exists invitation_sent_at timestamptz;
create table if not exists public.candidate_invitations (
  candidate_id uuid primary key references public.candidates(id),
  state text not null default 'pending' check (state in ('pending','sending','sent','review','skipped')),
  created_at timestamptz not null default now(),
  attempted_at timestamptz,
  sent_at timestamptz,
  provider_id text,
  detail text,
  recipient text
);
alter table public.candidate_invitations enable row level security;
revoke all on public.candidate_invitations from anon, authenticated;
grant all on public.candidate_invitations to service_role;

create or replace function public.enqueue_candidate_invitation() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.studies_completed is true and new.score > 50 and new.consent is true
     and new.manual_status = 'Nuevo' and new.invitation_sent_at is null then
    insert into candidate_invitations(candidate_id) values (new.id) on conflict do nothing;
  end if;
  return new;
end; $$;
drop trigger if exists candidate_invitation_queue on public.candidates;
create trigger candidate_invitation_queue after insert or update on public.candidates
for each row execute function public.enqueue_candidate_invitation();

-- Existing Contactado and other stages are deliberately excluded.
insert into public.candidate_invitations(candidate_id)
select id from public.candidates
where studies_completed is true and score > 50 and consent is true
and manual_status = 'Nuevo' and invitation_sent_at is null
on conflict do nothing;

-- One atomic claim per candidate prevents concurrent requests from sending twice.
create or replace function public.claim_candidate_invitation(target_id uuid default null)
returns setof public.candidate_invitations
language plpgsql security definer set search_path = public as $$
declare picked uuid;
begin
  select q.candidate_id into picked from candidate_invitations q
  join candidates c on c.id=q.candidate_id
  where q.state='pending' and (target_id is null or q.candidate_id=target_id)
    and c.studies_completed is true and c.score > 50 and c.consent is true
    and c.manual_status='Nuevo' and c.invitation_sent_at is null
  order by q.created_at for update of q skip locked limit 1;
  if picked is null then return; end if;
  return query update candidate_invitations q set state='sending', attempted_at=now(),
    recipient=c.email from candidates c where q.candidate_id=picked and c.id=picked returning q.*;
end; $$;

-- The sent marker, pipeline change and history entry commit together.
create or replace function public.complete_candidate_invitation(target_id uuid, message_id text)
returns void language plpgsql security definer set search_path = public as $$
begin
  update candidate_invitations set state='sent', sent_at=now(), provider_id=message_id, detail=null
  where candidate_id=target_id and state='sending';
  if not found then return; end if;
  update candidates set invitation_sent_at=now(), updated_at=now(),
    manual_status=case when manual_status='Nuevo' then 'Contactado' else manual_status end
  where id=target_id;
  insert into activities(candidate_id, activity_type, description)
  values(target_id, 'EMAIL', 'Invitación a videoconferencia aceptada por el proveedor. Responder a info@talentobruecke.com. ID: ' || message_id);
end; $$;

revoke all on function public.enqueue_candidate_invitation() from public, anon, authenticated;
revoke all on function public.claim_candidate_invitation(uuid) from public, anon, authenticated;
revoke all on function public.complete_candidate_invitation(uuid,text) from public, anon, authenticated;
grant execute on function public.claim_candidate_invitation(uuid) to service_role;
grant execute on function public.complete_candidate_invitation(uuid,text) to service_role;
commit;
