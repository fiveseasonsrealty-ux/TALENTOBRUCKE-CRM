-- PREPARED ONLY. Requires an approved production rollout and preconfigured Vault secret.
-- The resulting job is installed inactive. This file sends no HTTP request.
begin;
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
do $$ begin
 if not exists(select 1 from vault.secrets where name='pei_production_scheduler_bearer') then
  raise exception 'Configure the approved cron credential in Vault before installing';
 end if;
end; $$;
select cron.schedule('pei-production-email-reminders','* * * * *',$cron$
 select net.http_post(
  url := 'https://ucinvaguveedajfzrifw.supabase.co/functions/v1/pei-production/reminders',
  headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||(select decrypted_secret from vault.decrypted_secrets where name='pei_production_scheduler_bearer')),
  body := '{}'::jsonb,
  timeout_milliseconds := 20000
 );
$cron$);
select cron.alter_job(jobid,active:=false) from cron.job where jobname='pei-production-email-reminders';
commit;
