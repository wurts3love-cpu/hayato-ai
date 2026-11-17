-- Optional next-stage schema. Do not run until Supabase project and access policies are configured.
create table if not exists public.knowledge (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  source_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  status text not null default 'pending' check (status in ('pending','in_progress','done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.knowledge enable row level security;
alter table public.tasks enable row level security;

create policy "Users manage own knowledge"
on public.knowledge for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage own tasks"
on public.tasks for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
