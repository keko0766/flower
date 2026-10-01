-- Checkout: blocked delivery dates + server-side order creation.

create table public.blocked_dates (
  day date primary key,
  note text
);

alter table public.blocked_dates enable row level security;
create policy "public read" on public.blocked_dates for select using (true);
create policy "admin write" on public.blocked_dates for all using (public.is_admin()) with check (public.is_admin());

insert into public.blocked_dates (day, note) values
  ('2026-12-31', 'Новый год'),
  ('2027-01-01', 'Новый год'),
  ('2027-03-21', 'Наурыз');

-- Prices mirrored in src/lib/site.ts for display only; this function is the source of truth.
create or replace function public.create_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c_delivery_price constant int := 2000;
  c_free_from constant int := 30000;
  c_gift_price constant int := 1500;
  c_ribbon_price constant int := 500;
  c_slots constant text[] := array['09:00-12:00', '12:00-15:00', '15:00-18:00', '18:00-21:00'];

  v_method text := payload ->> 'delivery_method';
  v_date date := (payload ->> 'delivery_date')::date;
  v_packaging text := coalesce(payload ->> 'packaging', 'standard');
  v_ribbon boolean := coalesce((payload ->> 'ribbon')::boolean, false);
  v_card boolean := coalesce((payload ->> 'card_enabled')::boolean, false);
  v_items_total int := 0;
  v_packaging_price int;
  v_delivery_price int;
  v_order public.orders;
  v_item jsonb;
  v_bouquet public.bouquets;
  v_qty int;
  v_lines jsonb := '[]';
begin
  -- Required fields
  if coalesce(trim(payload ->> 'customer_name'), '') = ''
     or coalesce(trim(payload ->> 'customer_phone'), '') = ''
     or coalesce(payload ->> 'customer_email', '') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
     or coalesce(trim(payload ->> 'recipient_name'), '') = ''
     or coalesce(trim(payload ->> 'recipient_phone'), '') = '' then
    raise exception 'invalid_contacts';
  end if;
  if coalesce((payload ->> 'consent')::boolean, false) is not true then
    raise exception 'no_consent';
  end if;
  if v_method not in ('delivery', 'pickup') then
    raise exception 'invalid_method';
  end if;
  if v_method = 'delivery' and coalesce(trim(payload ->> 'address'), '') = '' then
    raise exception 'invalid_address';
  end if;
  if v_date is null
     or v_date < (now() at time zone 'Asia/Almaty')::date + 1
     or v_date > (now() at time zone 'Asia/Almaty')::date + 60
     or exists (select 1 from public.blocked_dates where day = v_date) then
    raise exception 'invalid_date';
  end if;
  if not (payload ->> 'delivery_slot' = any (c_slots)) then
    raise exception 'invalid_slot';
  end if;
  if v_packaging not in ('standard', 'gift') then
    raise exception 'invalid_packaging';
  end if;
  if payload ->> 'payment_method' not in ('cash', 'online') then
    raise exception 'invalid_payment';
  end if;
  if jsonb_typeof(payload -> 'items') <> 'array' or jsonb_array_length(payload -> 'items') = 0 then
    raise exception 'empty_cart';
  end if;

  -- Price items from the catalog, never from the client
  for v_item in select * from jsonb_array_elements(payload -> 'items') loop
    v_qty := (v_item ->> 'qty')::int;
    select * into v_bouquet from public.bouquets
      where id = (v_item ->> 'id')::uuid and is_active;
    if not found or v_qty is null or v_qty < 1 or v_qty > 99 then
      raise exception 'invalid_item';
    end if;
    v_items_total := v_items_total + v_bouquet.price * v_qty;
    v_lines := v_lines || jsonb_build_object(
      'id', v_bouquet.id,
      'name', case when payload ->> 'locale' = 'kk' then v_bouquet.name_kk else v_bouquet.name_ru end,
      'price', v_bouquet.price,
      'qty', v_qty);
  end loop;

  v_packaging_price := (case when v_packaging = 'gift' then c_gift_price else 0 end)
                     + (case when v_ribbon then c_ribbon_price else 0 end);
  v_delivery_price := case
    when v_method = 'pickup' or v_items_total >= c_free_from then 0
    else c_delivery_price end;

  insert into public.orders (
    locale, customer_name, customer_phone, customer_email,
    recipient_name, recipient_phone, delivery_method,
    address, apartment, floor, entrance_code,
    delivery_date, delivery_slot,
    card_enabled, card_text, card_from, card_to,
    packaging, ribbon, payment_method, comment,
    items_total, packaging_price, delivery_price, total
  ) values (
    case when payload ->> 'locale' = 'kk' then 'kk' else 'ru' end,
    left(trim(payload ->> 'customer_name'), 100),
    left(trim(payload ->> 'customer_phone'), 30),
    left(trim(payload ->> 'customer_email'), 200),
    left(trim(payload ->> 'recipient_name'), 100),
    left(trim(payload ->> 'recipient_phone'), 30),
    v_method,
    case when v_method = 'delivery' then left(trim(payload ->> 'address'), 300) end,
    case when v_method = 'delivery' then left(nullif(trim(payload ->> 'apartment'), ''), 20) end,
    case when v_method = 'delivery' then left(nullif(trim(payload ->> 'floor'), ''), 10) end,
    case when v_method = 'delivery' then left(nullif(trim(payload ->> 'entrance_code'), ''), 20) end,
    v_date,
    payload ->> 'delivery_slot',
    v_card,
    case when v_card then left(nullif(trim(payload ->> 'card_text'), ''), 200) end,
    case when v_card then left(nullif(trim(payload ->> 'card_from'), ''), 100) end,
    case when v_card then left(nullif(trim(payload ->> 'card_to'), ''), 100) end,
    v_packaging, v_ribbon,
    payload ->> 'payment_method',
    left(nullif(trim(payload ->> 'comment'), ''), 500),
    v_items_total, v_packaging_price, v_delivery_price,
    v_items_total + v_packaging_price + v_delivery_price
  ) returning * into v_order;

  insert into public.order_items (order_id, bouquet_id, name, price, quantity)
  select v_order.id, (l ->> 'id')::uuid, l ->> 'name', (l ->> 'price')::int, (l ->> 'qty')::int
  from jsonb_array_elements(v_lines) l;

  return jsonb_build_object('id', v_order.id, 'number', v_order.number);
end;
$$;

-- Public summary for the thank-you page; the order uuid acts as the access key.
create or replace function public.get_order_summary(order_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'number', o.number,
    'status', o.status,
    'total', o.total,
    'items_total', o.items_total,
    'packaging_price', o.packaging_price,
    'delivery_price', o.delivery_price,
    'delivery_method', o.delivery_method,
    'delivery_date', o.delivery_date,
    'delivery_slot', o.delivery_slot,
    'address', o.address,
    'recipient_name', o.recipient_name,
    'customer_email', o.customer_email,
    'payment_method', o.payment_method,
    'card_enabled', o.card_enabled,
    'items', (select jsonb_agg(jsonb_build_object('name', i.name, 'price', i.price, 'qty', i.quantity) order by i.id)
              from public.order_items i where i.order_id = o.id)
  )
  from public.orders o
  where o.id = order_id
    and o.created_at > now() - interval '30 days'
$$;

revoke all on function public.create_order(jsonb) from public;
revoke all on function public.get_order_summary(uuid) from public;
grant execute on function public.create_order(jsonb) to anon, authenticated;
grant execute on function public.get_order_summary(uuid) to anon, authenticated;
