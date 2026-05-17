create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  role text not null check (role in ('employee', 'manager', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text not null,
  thrust_area text not null,
  uom text not null,
  target text not null,
  weightage numeric(5,2) not null check (weightage > 0),
  status text not null check (status in ('draft', 'submitted', 'approved', 'locked')),
  approval_status text not null check (approval_status in ('not_submitted', 'pending', 'approved', 'rejected')),
  is_locked boolean not null default false,
  reviewed_by text,
  reviewed_at timestamptz,
  review_notes text,
  quarter text not null check (quarter in ('Q1', 'Q2', 'Q3', 'Q4')),
  measurement_type text not null check (measurement_type in ('MIN', 'MAX', 'ZERO', 'TIMELINE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  employee_id uuid not null references public.users(id) on delete cascade,
  actual_value text not null,
  status text not null check (status in ('not_started', 'on_track', 'completed')),
  quarter text not null check (quarter in ('Q1', 'Q2', 'Q3', 'Q4')),
  progress_percent integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (goal_id, quarter)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references public.goals(id) on delete set null,
  employee_id uuid references public.users(id) on delete set null,
  action text not null check (action in ('created', 'updated', 'deleted', 'submitted')),
  performed_by uuid references public.users(id) on delete set null,
  actor_role text not null check (actor_role in ('employee', 'manager', 'admin')),
  actor_label text not null,
  timestamp timestamptz not null default now(),
  changes jsonb not null default '[]'::jsonb
);

alter table public.users
  alter column id set default gen_random_uuid(),
  add column if not exists name text default 'Unknown',
  add column if not exists created_at timestamptz default now();

alter table public.goals
  alter column id set default gen_random_uuid(),
  add column if not exists user_id uuid default '11111111-1111-1111-1111-111111111111'::uuid,
  add column if not exists title text default '',
  add column if not exists description text default '',
  add column if not exists thrust_area text default '',
  add column if not exists uom text default '',
  add column if not exists target text default '',
  add column if not exists weightage numeric(5,2) default 10,
  add column if not exists status text default 'draft',
  add column if not exists approval_status text default 'not_submitted',
  add column if not exists is_locked boolean default false,
  add column if not exists reviewed_by text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists review_notes text,
  add column if not exists quarter text default 'Q2',
  add column if not exists measurement_type text default 'MIN',
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now(),
  add column if not exists submitted_at timestamptz;

alter table public.achievements
  alter column id set default gen_random_uuid(),
  add column if not exists goal_id uuid,
  add column if not exists employee_id uuid default '11111111-1111-1111-1111-111111111111'::uuid,
  add column if not exists actual_value text default '',
  add column if not exists status text default 'not_started',
  add column if not exists quarter text default 'Q2',
  add column if not exists progress_percent integer default 0,
  add column if not exists notes text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table public.audit_logs
  alter column id set default gen_random_uuid(),
  add column if not exists goal_id uuid,
  add column if not exists employee_id uuid,
  add column if not exists action text default 'created',
  add column if not exists performed_by uuid,
  add column if not exists actor_role text default 'employee',
  add column if not exists actor_label text default '',
  add column if not exists timestamp timestamptz default now(),
  add column if not exists changes jsonb default '[]'::jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'goals_user_id_fkey'
      and conrelid = 'public.goals'::regclass
  ) then
    alter table public.goals
      add constraint goals_user_id_fkey
      foreign key (user_id) references public.users(id) on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'achievements_goal_id_fkey'
      and conrelid = 'public.achievements'::regclass
  ) then
    alter table public.achievements
      add constraint achievements_goal_id_fkey
      foreign key (goal_id) references public.goals(id) on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'achievements_employee_id_fkey'
      and conrelid = 'public.achievements'::regclass
  ) then
    alter table public.achievements
      add constraint achievements_employee_id_fkey
      foreign key (employee_id) references public.users(id) on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'audit_logs_goal_id_fkey'
      and conrelid = 'public.audit_logs'::regclass
  ) then
    alter table public.audit_logs
      add constraint audit_logs_goal_id_fkey
      foreign key (goal_id) references public.goals(id) on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'audit_logs_employee_id_fkey'
      and conrelid = 'public.audit_logs'::regclass
  ) then
    alter table public.audit_logs
      add constraint audit_logs_employee_id_fkey
      foreign key (employee_id) references public.users(id) on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'audit_logs_performed_by_fkey'
      and conrelid = 'public.audit_logs'::regclass
  ) then
    alter table public.audit_logs
      add constraint audit_logs_performed_by_fkey
      foreign key (performed_by) references public.users(id) on delete set null;
  end if;
end $$;

create unique index if not exists users_email_uidx on public.users (email);
create unique index if not exists achievements_goal_quarter_uidx on public.achievements (goal_id, quarter);
create index if not exists goals_user_quarter_idx on public.goals (user_id, quarter);
create index if not exists goals_quarter_status_idx on public.goals (quarter, approval_status, status);
create index if not exists goals_updated_at_idx on public.goals (updated_at desc);
create index if not exists achievements_employee_quarter_idx on public.achievements (employee_id, quarter);
create index if not exists audit_logs_employee_timestamp_idx on public.audit_logs (employee_id, timestamp desc);
create index if not exists audit_logs_timestamp_idx on public.audit_logs (timestamp desc);

drop trigger if exists goals_set_updated_at on public.goals;
create trigger goals_set_updated_at
before update on public.goals
for each row execute function public.set_updated_at();

drop trigger if exists achievements_set_updated_at on public.achievements;
create trigger achievements_set_updated_at
before update on public.achievements
for each row execute function public.set_updated_at();

insert into public.users (id, name, email, role) values
  ('11111111-1111-1111-1111-111111111111', 'Employee', 'employee@demo.com', 'employee'),
  ('22222222-2222-2222-2222-222222222222', 'Manager', 'manager@demo.com', 'manager'),
  ('33333333-3333-3333-3333-333333333333', 'Admin', 'admin@demo.com', 'admin'),
  ('44444444-4444-4444-4444-444444444444', 'Ayesha Khan', 'ayesha@demo.com', 'employee')
on conflict (email) do update
set id = excluded.id,
    name = excluded.name,
    role = excluded.role;
