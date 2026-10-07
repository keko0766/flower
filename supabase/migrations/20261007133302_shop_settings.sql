-- Shop settings editable from the admin panel (contacts, delivery prices, time slots).
-- Single row (id = 1). create_order() reads prices and slots from here, so the owner
-- changes them without a developer; the site shows the same values.

create table public.shop_settings (
  id int primary key default 1 check (id = 1),
  phone text not null,
  whatsapp_phone text,
  telegram text,
  instagram text,
  email text,
  hours text not null,
  delivery_price int not null check (delivery_price >= 0),
  free_delivery_from int not null check (free_delivery_from >= 0),
  gift_packaging_price int not null check (gift_packaging_price >= 0),
  ribbon_price int not null check (ribbon_price >= 0),
  slots text[] not null check (cardinality(slots) between 1 and 8)
);

alter table public.shop_settings enable row level security;
create policy "public read" on public.shop_settings for select using (true);
create policy "admin write" on public.shop_settings for all using (public.is_admin()) with check (public.is_admin());

-- Values the site had hardcoded until now.
insert into public.shop_settings
  (id, phone, whatsapp_phone, telegram, instagram, email, hours,
   delivery_price, free_delivery_from, gift_packaging_price, ribbon_price, slots)
values
  (1, '+7 (700) 739-23-50', '77007392350', 'https://t.me/akgul_flowers',
   'https://instagram.com/akgul.flowers', 'hello@akgul.kz', '08:00–22:00',
   2000, 30000, 1500, 500,
   array['09:00-12:00', '12:00-15:00', '15:00-18:00', '18:00-21:00']);

create or replace function public.create_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c_delivery_price int;
  c_free_from int;
  c_gift_price int;
  c_ribbon_price int;
  c_slots text[];

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
  -- Prices and delivery slots are edited by the owner in the admin panel.
  select delivery_price, free_delivery_from, gift_packaging_price, ribbon_price, slots
    into c_delivery_price, c_free_from, c_gift_price, c_ribbon_price, c_slots
    from public.shop_settings where id = 1;

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
