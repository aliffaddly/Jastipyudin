-- Add a gallery while keeping image_url as the backwards-compatible cover image.
alter table public.products
  add column if not exists image_urls jsonb not null default '[]'::jsonb;

update public.products
set image_urls = jsonb_build_array(image_url)
where image_urls = '[]'::jsonb and image_url <> '';