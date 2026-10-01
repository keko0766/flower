-- Three order statuses: new ("В списке"), sold ("Продано"), cancelled ("Отменён").

create type public.order_status_v2 as enum ('new', 'sold', 'cancelled');

alter table public.orders alter column status drop default;
alter table public.orders
  alter column status type public.order_status_v2
  using (case status::text
    when 'done' then 'sold'
    when 'cancelled' then 'cancelled'
    else 'new'
  end)::public.order_status_v2;
alter table public.orders alter column status set default 'new';

drop type public.order_status;
alter type public.order_status_v2 rename to order_status;
