create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  order_item_id text not null references public.order_items(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_idr numeric not null check (amount_idr > 0),
  reason text not null default 'ITEM_NOT_AVAILABLE',
  status text not null default 'PENDING' check (status in ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  payment_reference text,
  admin_note text,
  processed_by uuid references auth.users(id),
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_item_id)
);

alter table public.refunds enable row level security;

drop policy if exists "Customers can read own refunds" on public.refunds;
drop policy if exists "Admins can read all refunds" on public.refunds;
drop policy if exists "Admins can update refunds" on public.refunds;

create policy "Customers can read own refunds"
on public.refunds for select to authenticated
using (user_id = auth.uid());

create policy "Admins can read all refunds"
on public.refunds for select to authenticated
using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'));

create policy "Admins can update refunds"
on public.refunds for update to authenticated
using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'))
with check (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'));

create or replace function public.create_order_item_refund(p_order_item_id text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_order_id text;
  target_user_id uuid;
  refund_id uuid;
  refund_amount numeric;
begin
  select oi.order_id, o.user_id,
    (ec.raw_idr + round(ec.raw_idr * ec.markup_percent / 100.0)
      + case
          when ec.raw_idr < ec.low_item_price_threshold_idr then ec.handling_fee_low_idr
          when ec.raw_idr <= ec.medium_item_price_threshold_idr then ec.handling_fee_medium_idr
          else ec.handling_fee_high_idr
        end) * greatest(0, oi.ordered_quantity - oi.purchased_quantity)
      + coalesce((select max((tier->>'feeIDR')::numeric) from jsonb_array_elements(ec.baggage_fee_tiers) tier where (tier->>'minWeightGrams')::numeric <= oi.weight_grams), 0)
        * greatest(0, oi.ordered_quantity - oi.purchased_quantity)
  into target_order_id, target_user_id, refund_amount
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  cross join lateral (
    select *, round(oi.price_thb * thb_to_idr_rate) as raw_idr
    from public.exchange_configs
    where is_active = true
    order by updated_at desc
    limit 1
  ) ec
  where oi.id = p_order_item_id
    and (o.user_id = auth.uid() or exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'))
    and oi.fulfillment_status in ('PARTIAL', 'FAILED', 'CANCELLED')
    and greatest(0, oi.ordered_quantity - oi.purchased_quantity) > 0;

  if target_order_id is null then
    raise exception 'Order item not found or not eligible for refund';
  end if;

  insert into public.refunds (order_id, order_item_id, user_id, amount_idr)
  values (target_order_id, p_order_item_id, target_user_id, refund_amount)
  on conflict (order_item_id) do update
  set amount_idr = excluded.amount_idr,
      updated_at = now()
  returning id into refund_id;

  update public.orders
  set refund_amount_idr = coalesce((select sum(amount_idr) from public.refunds where order_id = target_order_id and status <> 'FAILED'), 0)
  where id = target_order_id;

  return refund_id;
end;
$$;

update public.refunds refund
set amount_idr = calculation.amount_idr,
    updated_at = now()
from (
  select oi.id as order_item_id,
    (ec.raw_idr + round(ec.raw_idr * ec.markup_percent / 100.0)
      + case
          when ec.raw_idr < ec.low_item_price_threshold_idr then ec.handling_fee_low_idr
          when ec.raw_idr <= ec.medium_item_price_threshold_idr then ec.handling_fee_medium_idr
          else ec.handling_fee_high_idr
        end
      + coalesce((
          select max((tier->>'feeIDR')::numeric)
          from jsonb_array_elements(ec.baggage_fee_tiers) tier
          where (tier->>'minWeightGrams')::numeric <= oi.weight_grams
        ), 0)
    ) * greatest(0, oi.ordered_quantity - oi.purchased_quantity) as amount_idr
  from public.order_items oi
  cross join lateral (
    select *, round(oi.price_thb * thb_to_idr_rate) as raw_idr
    from public.exchange_configs
    where is_active = true
    order by updated_at desc
    limit 1
  ) ec
) calculation
where refund.order_item_id = calculation.order_item_id
  and refund.status in ('PENDING', 'PROCESSING');

grant execute on function public.create_order_item_refund(text) to authenticated;
