create or replace function public.submit_order_payment(
  p_order_id text,
  p_amount_idr numeric,
  p_method text,
  p_proof_url text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_method not in ('QRIS', 'BCA', 'MANDIRI') then
    raise exception 'Invalid payment method';
  end if;

  if not exists (
    select 1 from public.orders
    where id = p_order_id and user_id = auth.uid()
      and payment_status in ('UNPAID', 'REJECTED')
  ) then
    raise exception 'Order not found or payment already submitted';
  end if;

  insert into public.payments (order_id, user_id, amount_idr, method, status, proof_url)
  values (p_order_id, auth.uid(), p_amount_idr, p_method, 'VERIFYING', p_proof_url);

  update public.orders
  set payment_status = 'VERIFYING', updated_at = now()
  where id = p_order_id and user_id = auth.uid();
end;
$$;

grant execute on function public.submit_order_payment(text, numeric, text, text) to authenticated;

create or replace function public.confirm_order_payment(
  p_order_id text,
  p_proof_url text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'ADMIN'
  ) then
    raise exception 'Only admin can confirm payments';
  end if;

  update public.payments
  set status = 'CONFIRMED',
      verified_by = auth.uid(),
      verified_at = now()
  where order_id = p_order_id
    and status = 'VERIFYING';

  if not found then
    raise exception 'No verifying payment found for this order';
  end if;

  update public.orders
  set payment_status = 'CONFIRMED',
      order_status = case when order_status = 'AWAITING_PAYMENT' then 'SHOPPING' else order_status end,
      updated_at = now()
  where id = p_order_id;
end;
$$;

grant execute on function public.confirm_order_payment(text, text) to authenticated;

alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check
check (payment_status in ('UNPAID', 'VERIFYING', 'CONFIRMED', 'REJECTED'));


insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

drop policy if exists "Customers can upload own payment proofs" on storage.objects;
create policy "Customers can upload own payment proofs"
on storage.objects for insert to authenticated
with check (bucket_id = 'payment-proofs' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Customers and admins can read payment proofs" on storage.objects;
create policy "Customers and admins can read payment proofs"
on storage.objects for select to authenticated
using (
  bucket_id = 'payment-proofs'
  and ((storage.foldername(name))[1] = auth.uid()::text
    or exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'))
);
