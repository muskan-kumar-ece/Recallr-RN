-- Recallr initial schema. Review before applying.
create extension if not exists pg_trgm;

-- helper: keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nudge_days int not null default 30 check (nudge_days between 7 and 365),
  default_reminder_time time not null default '09:00',
  snooze_minutes int not null default 60 check (snooze_minutes in (15,30,60,180)),
  reminders_enabled boolean not null default true,
  nudges_enabled boolean not null default true,
  daily_brief_enabled boolean not null default true,
  daily_brief_time time not null default '08:30',
  quiet_hours_enabled boolean not null default true,
  quiet_start time not null default '22:00',
  quiet_end time not null default '07:00',
  ai_use_notes boolean not null default true,
  timezone text not null default 'Asia/Kolkata',
  onboarding_done boolean not null default false,
  updated_at timestamptz not null default now()
);

-- plan and usage: written by service role only
create table public.entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free','pro')),
  source text,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.usage_counters (
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('scan','ai_question')),
  period_key text not null,            -- 'YYYY-MM' for scan, 'YYYY-MM-DD' for ai_question (user timezone)
  count int not null default 0,
  primary key (user_id, kind, period_key)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 30),
  icon text not null default 'users',
  color text not null default '#E8641B',
  created_at timestamptz not null default now()
);
create unique index categories_user_name_uq on public.categories (user_id, lower(name));

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) >= 1),
  role text,
  company text,
  phone text,
  email text,
  address text,
  photo_path text,
  card_image_path text,
  met_where text,
  met_date date,
  tags text[] not null default '{}',
  links jsonb not null default '[]',
  ai_summary text,
  ai_summary_updated_at timestamptz,
  last_contacted_at timestamptz,
  source text not null default 'manual' check (source in ('manual','scan','import','qr','ai')),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  phone_key text generated always as (right(regexp_replace(coalesce(phone,''), '\D', '', 'g'), 10)) stored,
  email_key text generated always as (lower(trim(coalesce(email,'')))) stored
);
create index contacts_user_idx on public.contacts (user_id) where deleted_at is null;
create index contacts_phone_key_idx on public.contacts (user_id, phone_key) where deleted_at is null and phone_key <> '';
create index contacts_email_key_idx on public.contacts (user_id, email_key) where deleted_at is null and email_key <> '';
create index contacts_name_trgm on public.contacts using gin (name gin_trgm_ops);
create index contacts_company_trgm on public.contacts using gin (company gin_trgm_ops);

create table public.contact_categories (
  contact_id uuid not null references public.contacts(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (contact_id, category_id)
);
create index contact_categories_category_idx on public.contact_categories (category_id);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete cascade,
  title text,
  body text,
  remind_at timestamptz,
  repeat text not null default 'none' check (repeat in ('none','daily','weekly','monthly')),
  done_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (title is not null or body is not null)
);
create index notes_user_remind_idx on public.notes (user_id, remind_at) where deleted_at is null and done_at is null;
create index notes_contact_idx on public.notes (contact_id) where deleted_at is null;
create index notes_title_trgm on public.notes using gin (title gin_trgm_ops);
create index notes_body_trgm on public.notes using gin (body gin_trgm_ops);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete cascade,
  note_id uuid references public.notes(id) on delete cascade,
  storage_path text not null,
  name text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now(),
  check (contact_id is not null or note_id is not null)
);

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Business',
  slug text not null unique,
  name text,
  role text,
  company text,
  tagline text,
  phone text,
  email text,
  website text,
  address text,
  about text,
  accent_color text not null default '#E8641B',
  photo_path text,
  logo_path text,
  socials jsonb not null default '[]',
  visibility jsonb not null default '{"phone":true,"email":true,"address":false,"socials":true}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  created_at timestamptz not null default now()
);
create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','tool')),
  content jsonb not null,
  created_at timestamptz not null default now()
);
create index ai_messages_conv_idx on public.ai_messages (conversation_id, created_at);

create table public.ai_pending_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid references public.ai_conversations(id) on delete cascade,
  kind text not null,
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','expired')),
  result jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '1 hour')
);

-- updated_at triggers
create trigger t_profiles_u before update on public.profiles for each row execute function public.set_updated_at();
create trigger t_user_settings_u before update on public.user_settings for each row execute function public.set_updated_at();
create trigger t_contacts_u before update on public.contacts for each row execute function public.set_updated_at();
create trigger t_notes_u before update on public.notes for each row execute function public.set_updated_at();
create trigger t_cards_u before update on public.cards for each row execute function public.set_updated_at();

-- new user bootstrap
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, phone, email) values (new.id, new.phone, new.email);
  insert into public.user_settings (user_id) values (new.id);
  insert into public.entitlements (user_id, plan) values (new.id, 'free');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- row level security
alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.entitlements enable row level security;
alter table public.usage_counters enable row level security;
alter table public.categories enable row level security;
alter table public.contacts enable row level security;
alter table public.contact_categories enable row level security;
alter table public.notes enable row level security;
alter table public.documents enable row level security;
alter table public.cards enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_pending_actions enable row level security;

-- owner full access
create policy own_profiles on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy own_settings on public.user_settings for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_categories on public.categories for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_contacts on public.contacts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_contact_categories on public.contact_categories for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_notes on public.notes for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_documents on public.documents for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_cards on public.cards for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_conversations on public.ai_conversations for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- read only for the owner (writes happen in Edge Functions with the service role)
create policy read_entitlements on public.entitlements for select using (user_id = auth.uid());
create policy read_usage on public.usage_counters for select using (user_id = auth.uid());
create policy read_ai_messages on public.ai_messages for select using (user_id = auth.uid());
create policy read_pending on public.ai_pending_actions for select using (user_id = auth.uid());

-- public card lookup: only visible fields, only active cards
create or replace function public.get_public_card(p_slug text)
returns jsonb language sql security definer set search_path = public as $$
  select jsonb_build_object(
    'slug', c.slug, 'label', c.label, 'name', c.name, 'role', c.role, 'company', c.company,
    'tagline', c.tagline, 'about', c.about, 'accent_color', c.accent_color, 'website', c.website,
    'phone',   case when (c.visibility->>'phone')::boolean   then c.phone   end,
    'email',   case when (c.visibility->>'email')::boolean   then c.email   end,
    'address', case when (c.visibility->>'address')::boolean then c.address end,
    'socials', case when (c.visibility->>'socials')::boolean then c.socials else '[]'::jsonb end,
    'photo_path', c.photo_path, 'logo_path', c.logo_path)
  from public.cards c where c.slug = p_slug and c.is_active
$$;
grant execute on function public.get_public_card(text) to anon, authenticated;

-- storage buckets and policies
insert into storage.buckets (id, name, public) values ('contact-files','contact-files', false) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('card-assets','card-assets', true) on conflict do nothing;

create policy "contact-files owner" on storage.objects for all
  using (bucket_id = 'contact-files' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'contact-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "card-assets read" on storage.objects for select using (bucket_id = 'card-assets');
create policy "card-assets owner write" on storage.objects for insert
  with check (bucket_id = 'card-assets' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "card-assets owner update" on storage.objects for update
  using (bucket_id = 'card-assets' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "card-assets owner delete" on storage.objects for delete
  using (bucket_id = 'card-assets' and (storage.foldername(name))[1] = auth.uid()::text);
