create extension if not exists pgcrypto;

create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  first_name text,
  last_name text,
  country text,
  age_range text,
  profile text,
  specialty text,
  education text,
  studies_completed boolean,
  experience_years text,
  sector text,
  employment_status text,
  experience_summary text,
  german_level text,
  english_level text,
  learn_german text,
  germany_interest text,
  mobility text,

  email text not null unique,
  phone text,
  consent boolean not null default false,
  consented_at timestamptz,

  score integer not null default 0 check (score >= 0 and score <= 100),
  classification text not null default 'LOW_PRIORITY',
  flags jsonb not null default '[]'::jsonb,
  manual_status text not null default 'Nuevo',
  notes text,

  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  campaign_id text,
  adset_id text,
  ad_id text,
  landing_page text,

  first_touch_source text,
  first_touch_campaign text,
  last_touch_source text,
  last_touch_campaign text
);

create index if not exists idx_candidates_score on public.candidates(score desc);
create index if not exists idx_candidates_classification on public.candidates(classification);
create index if not exists idx_candidates_created on public.candidates(created_at desc);
create index if not exists idx_candidates_campaign on public.candidates(utm_campaign);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  created_at timestamptz not null default now(),
  activity_type text not null,
  description text
);

alter table public.candidates enable row level security;
alter table public.activities enable row level security;

-- El navegador NO accede directamente a estas tablas.
-- La aplicación las utiliza únicamente desde el servidor mediante la service role key.
