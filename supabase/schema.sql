-- SUPABASE SCHEMA FOR SIGNA

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. TABLES

-- Tenants (Practices)
create table tenants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  status text not null default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Profiles (Users linked to Tenants)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  tenant_id uuid references tenants(id) on delete cascade,
  role text not null default 'user', -- 'user' or 'admin'
  name text,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Patients
create table patients (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references tenants(id) on delete cascade not null,
  name text not null,
  phone text,
  email text,
  price decimal(10,2) default 0,
  frequency text default 'Semanal',
  active boolean default true,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Appointments
create table appointments (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references tenants(id) on delete cascade not null,
  patient_id uuid references patients(id) on delete cascade not null,
  starts_at timestamp with time zone not null,
  duration integer default 50, -- in minutes
  amount decimal(10,2) default 0,
  modality text not null default 'Presencial', -- 'Presencial' or 'Online'
  status text not null default 'scheduled', -- 'scheduled', 'completed', 'cancelled'
  note text,
  recurrence_group_id uuid default null,
  is_recurring boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Payments
create table payments (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references tenants(id) on delete cascade not null,
  patient_id uuid references patients(id) on delete cascade not null,
  appointment_id uuid references appointments(id) on delete set null,
  amount decimal(10,2) not null,
  method text default 'PIX',
  status text not null default 'pending', -- 'pending', 'paid', 'overdue'
  paid_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- AI Logs
create table ai_logs (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references tenants(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  category text not null,
  estimated_tokens integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. ENABLE RLS
alter table tenants enable row level security;
alter table profiles enable row level security;
alter table patients enable row level security;
alter table appointments enable row level security;
alter table payments enable row level security;
alter table ai_logs enable row level security;

-- 4. RLS POLICIES

-- Helper function to get the current user's tenant_id
create or replace function get_current_tenant_id()
returns uuid as $$
  select tenant_id from profiles where id = auth.uid();
$$ language sql stable;

-- Profiles Policies
create policy "Users can view their own profile" on profiles for select using (auth.uid() = id);
create policy "Admins can view all profiles" on profiles for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Multi-tenant Data Policies (Isolation by tenant_id)
create policy "Tenant isolation for patients" on patients for all using (tenant_id = get_current_tenant_id());
create policy "Tenant isolation for appointments" on appointments for all using (tenant_id = get_current_tenant_id());
create policy "Tenant isolation for payments" on payments for all using (tenant_id = get_current_tenant_id());
create policy "Tenant isolation for ai_logs" on ai_logs for all using (tenant_id = get_current_tenant_id());

-- 5. TRIGGERS

-- Automatically create a profile when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
