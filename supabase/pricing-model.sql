-- Tiered handling and per-cart-line baggage pricing.
alter table public.exchange_configs
  add column if not exists handling_fee_low_idr numeric not null default 10000,
  add column if not exists handling_fee_medium_idr numeric not null default 15000,
  add column if not exists handling_fee_high_idr numeric not null default 20000,
  add column if not exists low_item_price_threshold_idr numeric not null default 75000,
  add column if not exists medium_item_price_threshold_idr numeric not null default 300000,
  add column if not exists baggage_fee_tiers jsonb not null default '[{"minWeightGrams":0,"feeIDR":0},{"minWeightGrams":101,"feeIDR":5000},{"minWeightGrams":251,"feeIDR":15000},{"minWeightGrams":501,"feeIDR":35000},{"minWeightGrams":751,"feeIDR":60000},{"minWeightGrams":1001,"feeIDR":100000},{"minWeightGrams":1501,"feeIDR":150000}]'::jsonb,
  add column if not exists max_automatic_baggage_grams integer not null default 2000;

update public.exchange_configs
set handling_fee_high_idr = coalesce(nullif(handling_fee_high_idr, 0), base_fee_per_item_idr),
    baggage_fee_tiers = case when baggage_fee_tiers = '[]'::jsonb then '[{"minWeightGrams":0,"feeIDR":0},{"minWeightGrams":101,"feeIDR":5000},{"minWeightGrams":251,"feeIDR":15000},{"minWeightGrams":501,"feeIDR":35000},{"minWeightGrams":751,"feeIDR":60000},{"minWeightGrams":1001,"feeIDR":100000},{"minWeightGrams":1501,"feeIDR":150000}]'::jsonb else baggage_fee_tiers end;

drop function if exists public.update_exchange_config(numeric, numeric, numeric, numeric);
create or replace function public.update_exchange_config(
  p_thb_to_idr_rate numeric,
  p_markup_percent numeric,
  p_handling_fee_low_idr numeric,
  p_handling_fee_medium_idr numeric,
  p_handling_fee_high_idr numeric,
  p_low_item_price_threshold_idr numeric,
  p_medium_item_price_threshold_idr numeric,
  p_baggage_fee_tiers jsonb,
  p_max_automatic_baggage_grams integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN') then
    raise exception 'Only admin can update exchange config';
  end if;

  if jsonb_typeof(p_baggage_fee_tiers) <> 'array' then
    raise exception 'Baggage fee tiers must be a JSON array';
  end if;

  update public.exchange_configs set is_active = false where is_active = true;
  insert into public.exchange_configs (
    thb_to_idr_rate,
    markup_percent,
    base_fee_per_item_idr,
    weight_rate_per_100g_idr,
    handling_fee_low_idr,
    handling_fee_medium_idr,
    handling_fee_high_idr,
    low_item_price_threshold_idr,
    medium_item_price_threshold_idr,
    baggage_fee_tiers,
    max_automatic_baggage_grams,
    updated_by
  )
  values (
    p_thb_to_idr_rate,
    p_markup_percent,
    p_handling_fee_high_idr,
    0,
    p_handling_fee_low_idr,
    p_handling_fee_medium_idr,
    p_handling_fee_high_idr,
    p_low_item_price_threshold_idr,
    p_medium_item_price_threshold_idr,
    p_baggage_fee_tiers,
    p_max_automatic_baggage_grams,
    auth.uid()
  );
end;
$$;

grant execute on function public.update_exchange_config(numeric, numeric, numeric, numeric, numeric, numeric, numeric, jsonb, integer) to authenticated;
