create table public.custom_requests (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_name text not null,
  user_phone text not null,
  item_name text not null,
  brand_or_store text not null default '',
  notes text not null default '',
  reference_url text,
  image_url text not null default '',
  target_price_thb numeric not null default 0,
  estimated_weight_grams integer not null default 100,
  status text not null default 'PENDING_REVIEW' check (status in ('PENDING_REVIEW', 'OFFER_SENT', 'PUBLISHED', 'PRIVATE_REQUEST', 'APPROVED', 'PURCHASED', 'REJECTED')),
  admin_notes text,
  quoted_price_thb numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.custom_requests enable row level security;

create policy "Customers can read own requests"
on public.custom_requests for select to authenticated
using (user_id = auth.uid() or exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'));

create policy "Customers can create own requests"
on public.custom_requests for insert to authenticated
with check (user_id = auth.uid());

create policy "Admins can update requests"
on public.custom_requests for update to authenticated
using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'))
with check (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'));
