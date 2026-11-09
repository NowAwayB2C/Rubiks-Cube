create table public.sessions (
  id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  started_at timestamptz not null,
  stopped_at timestamptz not null,
  timer_duration_ms bigint not null check (timer_duration_ms >= 0),
  stopwatch_duration_ms bigint not null check (stopwatch_duration_ms >= 0),
  total_duration_ms bigint not null check (total_duration_ms >= 0),
  completed_countdown boolean not null default true,
  created_at timestamptz not null default now(),
  constraint sessions_pkey primary key (user_id, id)
);

create index sessions_user_created_at_idx
  on public.sessions (user_id, created_at desc);

alter table public.sessions enable row level security;

revoke all on table public.sessions from anon, public;
grant select, insert, delete on table public.sessions to authenticated;

create policy "Users can read their own sessions"
  on public.sessions for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own sessions"
  on public.sessions for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own sessions"
  on public.sessions for delete to authenticated
  using ((select auth.uid()) = user_id);

alter publication supabase_realtime add table public.sessions;
