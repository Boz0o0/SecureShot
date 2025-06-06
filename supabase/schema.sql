-- extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- sessions table
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null check (char_length(code) = 6),
  photographer_id uuid references auth.users(id) on delete cascade,
  price numeric not null,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone not null
);

-- photos table
create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  storage_path text not null,
  is_watermarked boolean default true
);

-- purchases table
create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  buyer_email text not null,
  paid_at timestamp with time zone default now(),
  paypal_txn_id text unique not null
);
