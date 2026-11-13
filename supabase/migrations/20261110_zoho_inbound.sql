begin;
create table if not exists public.zoho_webhook_config (
 id text primary key,encrypted_secret text not null,created_at timestamptz not null default now()
);
alter table public.zoho_webhook_config enable row level security;
revoke all on public.zoho_webhook_config from public,anon,authenticated,service_role;
grant select,insert on public.zoho_webhook_config to service_role;
create table if not exists public.candidate_mail_events (
 event_key text primary key,candidate_id uuid references public.candidates(id),
 received_at timestamptz not null,processed_at timestamptz not null default now(),
 event_name text not null check(event_name in ('REPLIED','OPTED_OUT')),
 outcome text not null check(outcome in ('applied','unknown_sender','predates_initial_contact'))
);
alter table public.candidate_mail_events enable row level security;
revoke all on public.candidate_mail_events from public,anon,authenticated,service_role;
grant select on public.candidate_mail_events to service_role;
create or replace function public.record_zoho_mail_event(event_key text,sender_email text,event_name text,received_at timestamptz)
returns text language plpgsql security definer set search_path=public as $$
declare c candidates; disposition text;
begin
 if event_key is null or event_key!~'^[a-f0-9]{64}$' or event_name is null or event_name not in ('REPLIED','OPTED_OUT') or received_at is null then raise exception 'Evento no válido';end if;
 select * into c from candidates where email=lower(trim(sender_email)) for update;
 disposition=case when c.id is null then 'unknown_sender'
   when event_name='REPLIED' and (c.invitation_sent_at is null or received_at<c.invitation_sent_at-interval '1 minute') then 'predates_initial_contact'
   else 'applied' end;
 insert into candidate_mail_events(event_key,candidate_id,received_at,event_name,outcome)
 values(event_key,c.id,received_at,event_name,disposition) on conflict do nothing;
 if not found then return 'duplicate';end if;
 if disposition='applied' then perform record_candidate_contact_event(c.id,event_name);end if;
 return disposition;
end; $$;
revoke all on function public.record_zoho_mail_event(text,text,text,timestamptz) from public,anon,authenticated;
grant execute on function public.record_zoho_mail_event(text,text,text,timestamptz) to service_role;
commit;
