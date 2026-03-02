-- ============================================================
-- SHIFTSYNC — Run this in Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================

create extension if not exists "uuid-ossp";

-- PROFILES (extends auth.users)
create table if not exists profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  name        text not null,
  email       text not null,
  phone       text,
  section     text,
  roles       text[] default '{}',
  role_level  text not null default 'employee',
  status      text not null default 'active',
  created_at  timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user() returns trigger as $$
begin
  insert into profiles (id, name, email, phone, section, roles, role_level)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'section',
    coalesce(array(select jsonb_array_elements_text(new.raw_user_meta_data->'roles')), '{}'),
    coalesce(new.raw_user_meta_data->>'role_level', 'employee')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- AVAILABILITY
create table if not exists availability (
  id           uuid default uuid_generate_v4() primary key,
  employee_id  uuid references profiles(id) on delete cascade unique,
  standing_days text[] default '{}',
  updated_at   timestamptz default now()
);

-- TIME OFF REQUESTS
create table if not exists time_off_requests (
  id           uuid default uuid_generate_v4() primary key,
  employee_id  uuid references profiles(id) on delete cascade,
  dates        text not null,
  reason       text,
  type         text default 'time-off',
  status       text default 'pending',
  created_at   timestamptz default now()
);

-- SCHEDULES (one row per week)
create table if not exists schedules (
  id          uuid default uuid_generate_v4() primary key,
  week_start  date not null unique,
  shifts      jsonb default '{}',
  status      text default 'draft',
  updated_at  timestamptz default now()
);

-- SHIFT REQUIREMENTS
create table if not exists shift_requirements (
  id           int primary key default 1,
  requirements jsonb default '{}',
  updated_at   timestamptz default now()
);
insert into shift_requirements (id) values (1) on conflict do nothing;

-- SHIFT TEMPLATES
create table if not exists shift_templates (
  id             uuid default uuid_generate_v4() primary key,
  name           text not null,
  days           text[] default '{}',
  shift_block_id text,
  start_time     text,
  end_time       text,
  role_counts    jsonb default '{}',
  created_at     timestamptz default now()
);

-- RESTAURANT SETTINGS
create table if not exists restaurant_settings (
  id           int primary key default 1,
  open_days    jsonb default '{"Monday":true,"Tuesday":true,"Wednesday":true,"Thursday":true,"Friday":true,"Saturday":true,"Sunday":true}',
  shift_blocks jsonb default '[{"id":"lunch","name":"Lunch","start":"11:00","end":"15:00","color":"#F59E0B"},{"id":"dinner","name":"Dinner","start":"16:00","end":"23:59","color":"#818CF8"}]',
  foh_roles    text[] default array['Server','Bartender','Runner','Host'],
  boh_roles    text[] default array['Dishwasher','Cook','Sushi Chef','Prep'],
  updated_at   timestamptz default now()
);
insert into restaurant_settings (id) values (1) on conflict do nothing;

-- CHANNELS
create table if not exists channels (
  id         uuid default uuid_generate_v4() primary key,
  name       text not null,
  type       text default 'group',
  created_at timestamptz default now()
);
insert into channels (name, type) values
  ('All Staff','group'),('FOH','group'),('BOH','group')
on conflict do nothing;

-- MESSAGES
create table if not exists messages (
  id         uuid default uuid_generate_v4() primary key,
  channel_id uuid references channels(id) on delete cascade,
  sender_id  uuid references profiles(id) on delete set null,
  text       text not null,
  type       text default 'message',
  created_at timestamptz default now()
);

-- ROW LEVEL SECURITY
alter table profiles            enable row level security;
alter table availability        enable row level security;
alter table time_off_requests   enable row level security;
alter table schedules           enable row level security;
alter table shift_requirements  enable row level security;
alter table shift_templates     enable row level security;
alter table restaurant_settings enable row level security;
alter table channels            enable row level security;
alter table messages            enable row level security;

create or replace function get_my_role() returns text as $$
  select role_level from profiles where id = auth.uid();
$$ language sql security definer;

-- Profiles
create policy "profiles_read"   on profiles for select using (true);
create policy "profiles_write"  on profiles for update using (auth.uid()=id or get_my_role() in ('owner','manager'));
create policy "profiles_insert" on profiles for insert with check (get_my_role() in ('owner','manager'));
create policy "profiles_delete" on profiles for delete using (get_my_role()='owner');

-- Availability
create policy "avail_read"   on availability for select using (get_my_role() in ('owner','manager') or employee_id=auth.uid());
create policy "avail_write"  on availability for insert with check (employee_id=auth.uid());
create policy "avail_update" on availability for update using (employee_id=auth.uid());

-- Time off
create policy "tor_read"   on time_off_requests for select using (get_my_role() in ('owner','manager') or employee_id=auth.uid());
create policy "tor_insert" on time_off_requests for insert with check (employee_id=auth.uid());
create policy "tor_update" on time_off_requests for update using (get_my_role() in ('owner','manager'));

-- Schedules
create policy "sched_read"   on schedules for select using (status='published' or get_my_role() in ('owner','manager'));
create policy "sched_write"  on schedules for insert with check (get_my_role() in ('owner','manager'));
create policy "sched_update" on schedules for update using (get_my_role() in ('owner','manager'));

-- Shift requirements
create policy "req_read"   on shift_requirements for select using (true);
create policy "req_update" on shift_requirements for update using (get_my_role() in ('owner','manager'));
create policy "req_insert" on shift_requirements for insert with check (get_my_role() in ('owner','manager'));

-- Templates
create policy "tmpl_read"   on shift_templates for select using (true);
create policy "tmpl_write"  on shift_templates for insert with check (get_my_role() in ('owner','manager'));
create policy "tmpl_update" on shift_templates for update using (get_my_role() in ('owner','manager'));
create policy "tmpl_delete" on shift_templates for delete using (get_my_role() in ('owner','manager'));

-- Settings
create policy "settings_read"  on restaurant_settings for select using (true);
create policy "settings_write" on restaurant_settings for update using (get_my_role()='owner');

-- Chat
create policy "ch_read"   on channels for select using (auth.uid() is not null);
create policy "ch_write"  on channels for insert with check (get_my_role() in ('owner','manager'));
create policy "msg_read"  on messages for select using (auth.uid() is not null);
create policy "msg_write" on messages for insert with check (auth.uid() is not null);

-- Realtime
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table schedules;
