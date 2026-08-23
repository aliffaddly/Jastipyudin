-- Customer delivery confirmation must run as a SECURITY DEFINER RPC because
-- the `orders` table only allows admins to UPDATE via RLS policy.
create or replace function public.confirm_order_delivery(
  p_order_id text,
  p_proof_url text,
  p_tracking_steps jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.orders
    where id = p_order_id
      and user_id = auth.uid()
      and order_status = 'ARRIVED_JKT'
  ) then
    raise exception 'Order not found, not owned by you, or not yet arrived in Jakarta';
  end if;

  update public.orders
  set order_status = 'DELIVERED',
      customer_confirmed_at = now(),
      delivery_proof_url = p_proof_url,
      tracking_steps = p_tracking_steps,
      updated_at = now()
  where id = p_order_id;
end;
$$;

grant execute on function public.confirm_order_delivery(text, text, jsonb) to authenticated;
