create table if not exists public.orders (
  id text primary key,
  order_number text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_name text not null,
  customer_whatsapp text not null,
  customer_address text not null,
  customer_city text not null,
  subtotal_thb numeric not null default 0,
  subtotal_idr numeric not null default 0,
  jastip_fee_idr numeric not null default 0,
  weight_fee_idr numeric not null default 0,
  total_idr numeric not null default 0,
  payment_method text not null check (payment_method in ('QRIS', 'BCA', 'MANDIRI')),
  payment_status text not null default 'UNPAID' check (payment_status in ('UNPAID', 'VERIFYING', 'CONFIRMED', 'REJECTED')),
  order_status text not null default 'AWAITING_PAYMENT' check (order_status in ('AWAITING_PAYMENT', 'SHOPPING', 'PACKED_READY', 'ARRIVED_JKT', 'DELIVERED')),
  payment_proof_url text,
  tracking_number text,
  refund_amount_idr numeric not null default 0,
  tracking_steps jsonb not null default '[]'::jsonb,
  customer_confirmed_at timestamptz,
  delivery_proof_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id text primary key,
  order_id text not null references public.orders(id) on delete cascade,
  product_id text,
  name text not null,
  store_name text not null default '',
  price_thb numeric not null,
  weight_grams integer not null,
  ordered_quantity integer not null check (ordered_quantity > 0),
  purchased_quantity integer not null default 0 check (purchased_quantity >= 0),
  selected_variant text,
  notes text,
  image_url text,
  is_custom_request boolean not null default false,
  fulfillment_status text not null default 'PENDING' check (fulfillment_status in ('PENDING', 'PURCHASED', 'PARTIAL', 'FAILED', 'CANCELLED')),
  fulfillment_note text,
  shortage_resolution text default 'PENDING' check (shortage_resolution in ('PENDING', 'REFUND', 'REPLACE', 'CANCEL')),
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
check (payment_method in ('QRIS', 'BCA', 'MANDIRI'));

alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check
check (payment_status in ('UNPAID', 'VERIFYING', 'CONFIRMED', 'REJECTED'));

drop policy if exists "Customers can read own orders" on public.orders;
drop policy if exists "Customers can create own orders" on public.orders;
drop policy if exists "Admins can update orders" on public.orders;
drop policy if exists "Customers can read own order items" on public.order_items;
drop policy if exists "Customers can create own order items" on public.order_items;
drop policy if exists "Admins can update order items" on public.order_items;

create policy "Customers can read own orders"
on public.orders for select to authenticated
using (auth.uid() = user_id or exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'));

create policy "Customers can create own orders"
on public.orders for insert to authenticated
with check (auth.uid() = user_id);

create policy "Admins can update orders"
on public.orders for update to authenticated
using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'))
with check (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'));

create policy "Customers can read own order items"
on public.order_items for select to authenticated
using (exists (select 1 from public.orders where orders.id = order_items.order_id and (orders.user_id = auth.uid() or exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'))));

create policy "Customers can create own order items"
on public.order_items for insert to authenticated
with check (exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));

create policy "Admins can update order items"
on public.order_items for update to authenticated
using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'))
with check (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'));

create or replace function public.resolve_order_item_shortage(
  p_order_item_id text,
  p_resolution text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_order_id text;
begin
  if p_resolution not in ('REFUND', 'CANCEL') then
    raise exception 'Invalid shortage resolution';
  end if;

  select oi.order_id into target_order_id
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where oi.id = p_order_item_id
    and o.user_id = auth.uid()
    and oi.fulfillment_status in ('PARTIAL', 'FAILED', 'CANCELLED');

  if target_order_id is null then
    raise exception 'Order item not found or not owned by user';
  end if;

  update public.order_items
  set shortage_resolution = p_resolution
  where id = p_order_item_id;

  update public.orders o
  set refund_amount_idr = coalesce((
    select sum(
      (ec.raw_idr + round(ec.raw_idr * ec.markup_percent / 100.0)
      + case
          when ec.raw_idr < ec.low_item_price_threshold_idr then ec.handling_fee_low_idr
          when ec.raw_idr <= ec.medium_item_price_threshold_idr then ec.handling_fee_medium_idr
          else ec.handling_fee_high_idr
        end) * greatest(0, oi.ordered_quantity - oi.purchased_quantity)
      + coalesce((select max((tier->>'feeIDR')::numeric) from jsonb_array_elements(ec.baggage_fee_tiers) tier where (tier->>'minWeightGrams')::numeric <= oi.weight_grams), 0)
        * greatest(0, oi.ordered_quantity - oi.purchased_quantity)
    )
    from public.order_items oi
    cross join lateral (
      select *, round(oi.price_thb * thb_to_idr_rate) as raw_idr
      from public.exchange_configs
      where is_active = true
      order by updated_at desc
      limit 1
    ) ec
    where oi.order_id = o.id
      and oi.shortage_resolution in ('REFUND', 'CANCEL')
  ), 0)
  where o.id = target_order_id;
end;
$$;

grant execute on function public.resolve_order_item_shortage(text, text) to authenticated;
