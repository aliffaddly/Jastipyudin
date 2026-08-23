create table if not exists public.shopping_trips (
  id text primary key,
  title text not null,
  destination text not null default '',
  start_date text not null default '',
  end_date text not null default '',
  order_close_date text not null default '',
  flight_date text not null default '',
  delivery_date text not null default '',
  status text not null default 'PLANNING' check (status in ('PLANNING', 'LIVE_SHOPPING', 'PACKING', 'SHIPPED', 'COMPLETED')),
  quota_percent integer not null default 0 check (quota_percent between 0 and 100),
  current_shopper_location text not null default '',
  announcement text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.shopping_trips enable row level security;

create policy "Anyone can read shopping trips"
on public.shopping_trips for select to anon, authenticated using (true);

drop policy if exists "Admins can insert shopping trips" on public.shopping_trips;
drop policy if exists "Admins can update shopping trips" on public.shopping_trips;

create policy "Admins can insert shopping trips"
on public.shopping_trips for insert to authenticated
with check (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'));

create policy "Admins can update shopping trips"
on public.shopping_trips for update to authenticated
using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'))
with check (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'));

insert into public.shopping_trips (id, title, destination, start_date, end_date, order_close_date, flight_date, delivery_date, status, quota_percent, current_shopper_location, announcement)
values ('trip-bkk-jul-2026', 'Bangkok Shopping Spree: Siam, Pratunam & Chatuchak', 'Bangkok, Thailand (BKK - CGK)', '3 Oct 2026', '7 Oct 2026', '3 Oct 2026, 23:59 WIB', '7 Oct 2026', '7 Oct 2026', 'LIVE_SHOPPING', 82, 'Siam Square One & CentralWorld', 'Shopper sedang belanja di Siam & Pratunam! Orderan ditutup besok malam pukul 23:59 WIB agar sempat dipacking rapi.')
on conflict (id) do nothing;
