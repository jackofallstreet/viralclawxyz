-- Run this in Supabase Dashboard → SQL Editor

create table if not exists signals (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  chain text,
  type text,
  summary text,
  conviction int,
  window text,
  chains text[],
  social_lag_hours int,
  status text default 'new'
);

create table if not exists briefs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  signal_id uuid,
  type text not null,
  status text default 'pending',
  conviction int,
  window text,
  content text,
  signal_summary text,
  chains text[]
);

create table if not exists settings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  output_type text default 'both',
  focus_area text,
  min_conviction int default 7,
  ecosystems text[] default array['ETH','SOL','BASE','ARB'],
  creator_voice text
);

-- Disable RLS so anon key can read/write (enable + add policies when you add auth)
alter table signals disable row level security;
alter table briefs disable row level security;
alter table settings disable row level security;
