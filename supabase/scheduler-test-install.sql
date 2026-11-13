-- Install only in the approved test project. Scheduler runs every minute in simulation by default.
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
do $$
declare existing_secret uuid;
begin
 select id into existing_secret from vault.secrets where name='pei_test_scheduler_url';
 if existing_secret is null then
  perform vault.create_secret('__PRIVATE_SCHEDULER_URL__','pei_test_scheduler_url','PEI test scheduler endpoint');
 else
  perform vault.update_secret(existing_secret,'__PRIVATE_SCHEDULER_URL__','pei_test_scheduler_url','PEI test scheduler endpoint');
 end if;
end; $$;
select cron.schedule('pei-test-email-reminders','* * * * *',$cron$
 select net.http_post(
  url := (select decrypted_secret from vault.decrypted_secrets where name='pei_test_scheduler_url'),
  body := '{}'::jsonb,
  timeout_milliseconds := 20000
 );
$cron$);
select jobname,schedule,active from cron.job where jobname='pei-test-email-reminders';
