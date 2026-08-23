-- Simplified 5-stage shipping flow (personal luggage, no third-party courier)

-- Drop any existing check constraint on order_status regardless of its name,
-- since a stale constraint from an earlier migration can block the data update below.
do $$
declare
  con record;
begin
  for con in
    select conname from pg_constraint
    where conrelid = 'public.orders'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%order_status%'
  loop
    execute format('alter table public.orders drop constraint %I', con.conname);
  end loop;
end $$;

-- Migrate existing rows from the old 8-status flow into the new 5-status flow
update public.orders set order_status = 'SHOPPING' where order_status in ('PAID', 'IN_SHOPPING_QUEUE', 'PURCHASED');
update public.orders set order_status = 'PACKED_READY' where order_status = 'PACKED_BANGKOK';
update public.orders set order_status = 'ARRIVED_JKT' where order_status in ('AIR_CARGO_TO_JKT', 'ARRIVED_JKT_HUB', 'SHIPPED_DOMESTIC');

alter table public.orders alter column order_status set default 'AWAITING_PAYMENT';
alter table public.orders add constraint orders_order_status_check
check (order_status in ('AWAITING_PAYMENT', 'SHOPPING', 'PACKED_READY', 'ARRIVED_JKT', 'DELIVERED'));

alter table public.orders add column if not exists customer_confirmed_at timestamptz;
alter table public.orders add column if not exists delivery_proof_url text;

-- Packing proof photos uploaded by admin (folder-per-order)
insert into storage.buckets (id, name, public)
values ('packing-proofs', 'packing-proofs', false)
on conflict (id) do nothing;

drop policy if exists "Admins can upload packing proofs" on storage.objects;
create policy "Admins can upload packing proofs"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'packing-proofs'
  and exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN')
);

drop policy if exists "Owners and admins can read packing proofs" on storage.objects;
create policy "Owners and admins can read packing proofs"
on storage.objects for select to authenticated
using (
  bucket_id = 'packing-proofs'
  and (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN')
    or exists (
      select 1 from public.orders
      where orders.id = (storage.foldername(name))[1]
        and orders.user_id = auth.uid()
    )
  )
);

-- Delivery confirmation photos uploaded by customer (folder-per-user)
insert into storage.buckets (id, name, public)
values ('delivery-proofs', 'delivery-proofs', false)
on conflict (id) do nothing;

drop policy if exists "Customers can upload own delivery proofs" on storage.objects;
create policy "Customers can upload own delivery proofs"
on storage.objects for insert to authenticated
with check (bucket_id = 'delivery-proofs' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Customers and admins can read delivery proofs" on storage.objects;
create policy "Customers and admins can read delivery proofs"
on storage.objects for select to authenticated
using (
  bucket_id = 'delivery-proofs'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN')
  )
);
