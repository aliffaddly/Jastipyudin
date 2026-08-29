create table public.exchange_configs (
  id uuid primary key default gen_random_uuid(),
  thb_to_idr_rate numeric not null check (thb_to_idr_rate > 0),
  markup_percent numeric not null default 0 check (markup_percent >= 0),
  base_fee_per_item_idr numeric not null default 0 check (base_fee_per_item_idr >= 0),
  weight_rate_per_100g_idr numeric not null default 0 check (weight_rate_per_100g_idr >= 0),
  handling_fee_low_idr numeric not null default 10000,
  handling_fee_medium_idr numeric not null default 15000,
  handling_fee_high_idr numeric not null default 20000,
  low_item_price_threshold_idr numeric not null default 75000,
  medium_item_price_threshold_idr numeric not null default 300000,
  baggage_fee_tiers jsonb not null default '[{"minWeightGrams":0,"feeIDR":0},{"minWeightGrams":101,"feeIDR":5000},{"minWeightGrams":251,"feeIDR":15000},{"minWeightGrams":501,"feeIDR":35000},{"minWeightGrams":751,"feeIDR":60000},{"minWeightGrams":1001,"feeIDR":100000},{"minWeightGrams":1501,"feeIDR":150000}]'::jsonb,
  max_automatic_baggage_grams integer not null default 2000,
  is_active boolean not null default true,
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.exchange_configs enable row level security;

create policy "Anyone can read active exchange config"
on public.exchange_configs for select to anon, authenticated
using (is_active = true);

create policy "Admins can insert exchange config"
on public.exchange_configs for insert to authenticated
with check (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'));

create policy "Admins can update exchange config"
on public.exchange_configs for update to authenticated
using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'))
with check (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'));

insert into public.exchange_configs (thb_to_idr_rate, markup_percent, base_fee_per_item_idr, weight_rate_per_100g_idr)
select 455, 12, 20000, 0
where not exists (select 1 from public.exchange_configs);

create or replace function public.update_exchange_config(
  p_thb_to_idr_rate numeric,
  p_markup_percent numeric,
  p_base_fee_per_item_idr numeric,
  p_weight_rate_per_100g_idr numeric
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

  update public.exchange_configs set is_active = false where is_active = true;
  insert into public.exchange_configs (thb_to_idr_rate, markup_percent, base_fee_per_item_idr, weight_rate_per_100g_idr, updated_by)
  values (p_thb_to_idr_rate, p_markup_percent, p_base_fee_per_item_idr, p_weight_rate_per_100g_idr, auth.uid());
end;
$$;

grant execute on function public.update_exchange_config(numeric, numeric, numeric, numeric) to authenticated;
