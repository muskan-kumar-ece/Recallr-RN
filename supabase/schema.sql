-- RECALLR DATABASE SCHEMA (Supabase Postgres with RLS)

-- 1. Profiles (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  headline text,
  company text,
  bio text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text default 'folder',
  color text default '#E8641B',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Contacts
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  headline text,
  company text,
  phone text,
  email text,
  linkedin text,
  met_at text,
  met_date date default current_date,
  bio text,
  avatar_url text,
  last_contacted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Contact Categories (Many-to-Many)
create table if not exists public.contact_categories (
  contact_id uuid not null references public.contacts(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (contact_id, category_id)
);

-- 5. Notes & Reminders
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  title text,
  content text not null,
  remind_at timestamptz,
  repeat text check (repeat in ('none', 'daily', 'weekly', 'monthly', 'quarterly')),
  done boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. Documents & Card Scans
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  title text not null,
  file_url text not null,
  file_type text,
  file_size integer,
  created_at timestamptz default now()
);

-- 7. Digital Business Cards (Public Web Page recallr.app/c/slug)
create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text unique not null,
  fields jsonb not null default '{}'::jsonb,
  visibility text default 'public' check (visibility in ('public', 'private', 'unlisted')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_categories_user on public.categories(user_id);
create index if not exists idx_contacts_user on public.contacts(user_id);
create index if not exists idx_notes_user on public.notes(user_id);
create index if not exists idx_notes_contact on public.notes(contact_id);
create index if not exists idx_cards_slug on public.cards(slug);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.contacts enable row level security;
alter table public.contact_categories enable row level security;
alter table public.notes enable row level security;
alter table public.documents enable row level security;
alter table public.cards enable row level security;

-- Profiles Policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Categories Policies
create policy "Users can manage own categories" on public.categories
  for all using (auth.uid() = user_id);

-- Contacts Policies
create policy "Users can manage own contacts" on public.contacts
  for all using (auth.uid() = user_id);

-- Contact Categories Policies
create policy "Users can manage own contact categories" on public.contact_categories
  for all using (
    exists (
      select 1 from public.contacts
      where contacts.id = contact_categories.contact_id
      and contacts.user_id = auth.uid()
    )
  );

-- Notes Policies
create policy "Users can manage own notes" on public.notes
  for all using (auth.uid() = user_id);

-- Documents Policies
create policy "Users can manage own documents" on public.documents
  for all using (auth.uid() = user_id);

-- Cards Policies
create policy "Users can manage own cards" on public.cards
  for all using (auth.uid() = user_id);
create policy "Public can view active public cards" on public.cards
  for select using (visibility = 'public' and is_active = true);
