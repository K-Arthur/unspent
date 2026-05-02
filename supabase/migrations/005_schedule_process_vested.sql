-- Run vested-item processing automatically instead of relying on manual calls.
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'process-vested-items';

SELECT cron.schedule(
  'process-vested-items',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://vkegzbpdvjlnpiyyshio.supabase.co/functions/v1/process-vested',
    body := '{}'::jsonb,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (
        SELECT decrypted_secret
        FROM vault.decrypted_secrets
        WHERE name = 'process_vested_secret'
        LIMIT 1
      )
    ),
    timeout_milliseconds := 10000
  );
  $$
);
