-- Minimal Supabase SQL for Emmaline auth + marketing opt-in
-- Run in Supabase SQL Editor before testing mobile signup/login.

create extension if not exists "uuid-ossp";

create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  username text unique not null,
  password_hash text not null,
  marketing_opt_in boolean default false,
  is_active boolean default true,
  privacy_tier text default 'tier1',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.users add column if not exists marketing_opt_in boolean default false;
alter table public.users add column if not exists username text;
alter table public.users add column if not exists password_hash text;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_users_updated_at on public.users;
create trigger update_users_updated_at
before update on public.users
for each row
execute function public.update_updated_at_column();

create unique index if not exists users_email_unique_idx on public.users (email);
create unique index if not exists users_username_unique_idx on public.users (username);
