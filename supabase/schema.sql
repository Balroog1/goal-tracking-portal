create extension if not exists pgcrypto;

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
  measurement_type text not null check (measurement_type in ('MIN', 'MAX', 'ZERO', 'TIMELINE')),
  target text not null,
  weightage numeric(5,2) not null check (weightage > 0),
  status text not null check (status in ('draft', 'submitted', 'approved', 'locked')),
  approval_status text not null check (approval_status in ('not_submitted', 'pending', 'approved', 'rejected')),
  is_locked boolean not null default false,
  reviewed_by text,
  reviewed_at timestamptz,
  review_notes text,
  quarter text not null check (quarter in ('Q1', 'Q2', 'Q3', 'Q4')),
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
  goal_id uuid,
  employee_id uuid,
  action text not null check (action in ('created', 'updated', 'deleted', 'submitted')),
  performed_by uuid references public.users(id),
  actor_role text not null check (actor_role in ('employee', 'manager', 'admin')),
  actor_label text not null,
  timestamp timestamptz not null default now(),
  changes jsonb not null default '[]'::jsonb
);

create index if not exists goals_user_quarter_idx on public.goals (user_id, quarter);
create index if not exists goals_quarter_status_idx on public.goals (quarter, approval_status, status);
create index if not exists achievements_goal_quarter_idx on public.achievements (goal_id, quarter);
create index if not exists audit_logs_employee_timestamp_idx on public.audit_logs (employee_id, timestamp desc);
create index if not exists audit_logs_timestamp_idx on public.audit_logs (timestamp desc);

insert into public.users (id, name, email, role) values
  ('11111111-1111-1111-1111-111111111111', 'Employee', 'employee@demo.com', 'employee'),
  ('22222222-2222-2222-2222-222222222222', 'Manager', 'manager@demo.com', 'manager'),
  ('33333333-3333-3333-3333-333333333333', 'Admin', 'admin@demo.com', 'admin'),
  ('44444444-4444-4444-4444-444444444444', 'Ayesha Khan', 'ayesha@demo.com', 'employee')
on conflict (email) do update
set name = excluded.name,
    role = excluded.role;

with inserted_goals as (
  insert into public.goals (
    id,
    user_id,
    title,
    description,
    thrust_area,
    uom,
    measurement_type,
    target,
    weightage,
    status,
    approval_status,
    is_locked,
    reviewed_by,
    reviewed_at,
    review_notes,
    quarter,
    created_at,
    updated_at,
    submitted_at
  ) values
    (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      '11111111-1111-1111-1111-111111111111',
      'Increase Sales Revenue',
      'Improve quarterly sales by expanding enterprise client acquisition.',
      'Revenue Growth',
      'INR',
      'MIN',
      '1000000',
      30,
      'locked',
      'approved',
      true,
      'Manager',
      now() - interval '9 days',
      'Approved for the quarter.',
      'Q2',
      now() - interval '16 days',
      now() - interval '8 days',
      now() - interval '8 days'
    ),
    (
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      '11111111-1111-1111-1111-111111111111',
      'Improve Customer Satisfaction',
      'Increase support response quality and reduce repeated escalations.',
      'Customer Experience',
      'Percent',
      'MAX',
      '95',
      25,
      'locked',
      'approved',
      true,
      'Manager',
      now() - interval '9 days',
      'Approved for the quarter.',
      'Q2',
      now() - interval '16 days',
      now() - interval '8 days',
      now() - interval '8 days'
    ),
    (
      'cccccccc-cccc-cccc-cccc-cccccccccccc',
      '11111111-1111-1111-1111-111111111111',
      'Process Improvement',
      'Reduce manual work by automating recurring reporting steps.',
      'Operational Excellence',
      'Tasks',
      'ZERO',
      '12',
      20,
      'locked',
      'approved',
      true,
      'Manager',
      now() - interval '9 days',
      'Approved for the quarter.',
      'Q2',
      now() - interval '16 days',
      now() - interval '8 days',
      now() - interval '8 days'
    ),
    (
      'dddddddd-dddd-dddd-dddd-dddddddddddd',
      '11111111-1111-1111-1111-111111111111',
      'Leadership Development',
      'Complete manager-led mentoring sessions and share team learnings.',
      'Capability Building',
      'Sessions',
      'TIMELINE',
      '2026-06-30',
      25,
      'locked',
      'approved',
      true,
      'Manager',
      now() - interval '9 days',
      'Approved for the quarter.',
      'Q2',
      now() - interval '16 days',
      now() - interval '8 days',
      now() - interval '8 days'
    ),
    (
      'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
      '44444444-4444-4444-4444-444444444444',
      'Reduce Operating Cost',
      'Lower quarterly cost through procurement optimization.',
      'Finance',
      'INR',
      'MIN',
      '500000',
      60,
      'submitted',
      'pending',
      false,
      null,
      null,
      null,
      'Q2',
      now() - interval '5 days',
      now() - interval '4 days',
      now() - interval '4 days'
    ),
    (
      'ffffffff-ffff-ffff-ffff-ffffffffffff',
      '44444444-4444-4444-4444-444444444444',
      'Improve Delivery Time',
      'Reduce average delivery delays across the shipping process.',
      'Operations',
      'Days',
      'MAX',
      '3',
      40,
      'submitted',
      'pending',
      false,
      null,
      null,
      null,
      'Q2',
      now() - interval '5 days',
      now() - interval '4 days',
      now() - interval '4 days'
    )
  on conflict (id) do nothing
  returning id
)
insert into public.achievements (
  id,
  goal_id,
  employee_id,
  actual_value,
  status,
  quarter,
  progress_percent,
  notes,
  created_at,
  updated_at
) values
  (
    '11111111-aaaa-aaaa-aaaa-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    '820000',
    'on_track',
    'Q2',
    82,
    'Strong quarter-to-date results.',
    now() - interval '2 days',
    now() - interval '2 days'
  ),
  (
    '11111111-bbbb-bbbb-bbbb-111111111111',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    '63',
    'on_track',
    'Q2',
    63,
    'Trending in the right direction.',
    now() - interval '2 days',
    now() - interval '2 days'
  ),
  (
    '11111111-cccc-cccc-cccc-111111111111',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '11111111-1111-1111-1111-111111111111',
    '0',
    'completed',
    'Q2',
    100,
    'Automation delivered successfully.',
    now() - interval '2 days',
    now() - interval '2 days'
  ),
  (
    '11111111-dddd-dddd-dddd-111111111111',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '11111111-1111-1111-1111-111111111111',
    '2026-06-28',
    'completed',
    'Q2',
    100,
    'Milestone completed before target.',
    now() - interval '2 days',
    now() - interval '2 days'
  )
on conflict (goal_id, quarter) do update
set actual_value = excluded.actual_value,
    status = excluded.status,
    progress_percent = excluded.progress_percent,
    notes = excluded.notes,
    updated_at = excluded.updated_at;

insert into public.audit_logs (
  id,
  goal_id,
  employee_id,
  action,
  performed_by,
  actor_role,
  actor_label,
  timestamp,
  changes
) values
  (
    'aaaa1111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'created',
    '22222222-2222-2222-2222-222222222222',
    'manager',
    'Manager',
    now() - interval '8 days',
    '[]'::jsonb
  ),
  (
    'bbbb1111-1111-1111-1111-111111111111',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    'updated',
    '22222222-2222-2222-2222-222222222222',
    'manager',
    'Manager',
    now() - interval '8 days',
    '[]'::jsonb
  ),
  (
    'cccc1111-1111-1111-1111-111111111111',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '11111111-1111-1111-1111-111111111111',
    'created',
    '11111111-1111-1111-1111-111111111111',
    'employee',
    'Employee',
    now() - interval '2 days',
    '[]'::jsonb
  ),
  (
    'dddd1111-1111-1111-1111-111111111111',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    '44444444-4444-4444-4444-444444444444',
    'submitted',
    '44444444-4444-4444-4444-444444444444',
    'employee',
    'Ayesha Khan',
    now() - interval '4 days',
    '[]'::jsonb
  )
on conflict (id) do nothing;
