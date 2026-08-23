create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_idr numeric not null check (amount_idr > 0),
  method text not null check (method in ('QRIS', 'BCA', 'MANDIRI')),
  status text not null default 'VERIFYING' check (status in ('VERIFYING', 'CONFIRMED', 'REJECTED')),
  proof_url text,
  verified_by uuid references auth.users(id),
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy "Customers can read own payments"
on public.payments for select to authenticated
using (user_id = auth.uid() or exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'));

create policy "Customers can submit own payments"
on public.payments for insert to authenticated
with check (user_id = auth.uid());

create policy "Admins can update payments"
on public.payments for update to authenticated
using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'))
with check (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'));
