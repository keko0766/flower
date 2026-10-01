-- Ақ Гүл: catalog + orders schema

-- Admin check: set app_metadata.role = 'admin' on the owner's auth user.
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
$$;

-- Lookups --------------------------------------------------------------

create table public.occasions (
  slug text primary key,
  name_ru text not null,
  name_kk text not null,
  sort int not null default 0
);

create table public.colors (
  slug text primary key,
  name_ru text not null,
  name_kk text not null,
  hex text not null,
  sort int not null default 0
);

-- Bouquets -------------------------------------------------------------

create type public.bouquet_size as enum ('S', 'M', 'L', 'XL');

create table public.bouquets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ru text not null,
  name_kk text not null,
  short_ru text not null,
  short_kk text not null,
  description_ru text not null,
  description_kk text not null,
  composition_ru text not null,
  composition_kk text not null,
  price int not null check (price > 0),
  old_price int check (old_price is null or old_price > price),
  size public.bouquet_size not null default 'M',
  height_cm int,
  diameter_cm int,
  images text[] not null default '{}',
  popularity int not null default 0,
  rating numeric(2, 1) check (rating between 0 and 5),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index bouquets_active_price_idx on public.bouquets (is_active, price);

create table public.bouquet_occasions (
  bouquet_id uuid references public.bouquets on delete cascade,
  occasion_slug text references public.occasions on update cascade on delete cascade,
  primary key (bouquet_id, occasion_slug)
);

create table public.bouquet_colors (
  bouquet_id uuid references public.bouquets on delete cascade,
  color_slug text references public.colors on update cascade on delete cascade,
  primary key (bouquet_id, color_slug)
);

-- Orders ---------------------------------------------------------------
-- Created only through the create_order() function (checkout stage),
-- so prices are always computed on the server.

create type public.order_status as enum ('new', 'preparing', 'delivering', 'done', 'cancelled');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  number serial unique,
  status public.order_status not null default 'new',
  locale text not null default 'ru',

  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,

  recipient_name text not null,
  recipient_phone text not null,
  delivery_method text not null check (delivery_method in ('delivery', 'pickup')),
  address text,
  apartment text,
  floor text,
  entrance_code text,
  delivery_date date not null,
  delivery_slot text not null,

  card_enabled boolean not null default false,
  card_text text,
  card_from text,
  card_to text,

  packaging text not null default 'standard',
  ribbon boolean not null default false,
  payment_method text not null check (payment_method in ('cash', 'online')),
  comment text,

  items_total int not null,
  packaging_price int not null default 0,
  delivery_price int not null default 0,
  total int not null,
  created_at timestamptz not null default now()
);

create table public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders on delete cascade,
  bouquet_id uuid references public.bouquets on delete set null,
  name text not null,
  price int not null,
  quantity int not null check (quantity > 0)
);

-- Row Level Security ----------------------------------------------------

alter table public.occasions enable row level security;
alter table public.colors enable row level security;
alter table public.bouquets enable row level security;
alter table public.bouquet_occasions enable row level security;
alter table public.bouquet_colors enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "public read" on public.occasions for select using (true);
create policy "public read" on public.colors for select using (true);
create policy "public read" on public.bouquets for select using (is_active or public.is_admin());
create policy "public read" on public.bouquet_occasions for select using (true);
create policy "public read" on public.bouquet_colors for select using (true);

create policy "admin write" on public.occasions for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write" on public.colors for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write" on public.bouquets for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write" on public.bouquet_occasions for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write" on public.bouquet_colors for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all" on public.orders for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all" on public.order_items for all using (public.is_admin()) with check (public.is_admin());

-- Storage: public bucket for bouquet photos ------------------------------

insert into storage.buckets (id, name, public)
values ('bouquets', 'bouquets', true)
on conflict (id) do nothing;

create policy "bouquet photos admin write" on storage.objects
  for all to authenticated
  using (bucket_id = 'bouquets' and public.is_admin())
  with check (bucket_id = 'bouquets' and public.is_admin());
