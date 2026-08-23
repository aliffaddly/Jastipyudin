-- Public image buckets for product catalog photos and custom-request reference photos.
-- Public (not signed) because these images are meant to be visible in the storefront/catalog.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'product-images'
  and exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN')
);

drop policy if exists "Anyone can view product images" on storage.objects;
create policy "Anyone can view product images"
on storage.objects for select to public
using (bucket_id = 'product-images');

insert into storage.buckets (id, name, public)
values ('request-images', 'request-images', true)
on conflict (id) do nothing;

drop policy if exists "Customers can upload own request images" on storage.objects;
create policy "Customers can upload own request images"
on storage.objects for insert to authenticated
with check (bucket_id = 'request-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Anyone can view request images" on storage.objects;
create policy "Anyone can view request images"
on storage.objects for select to public
using (bucket_id = 'request-images');
