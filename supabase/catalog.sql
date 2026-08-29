create table public.stores (
  id text primary key,
  name text not null,
  thai_name text,
  area text not null default '',
  description text not null default '',
  category text not null default '',
  badge_color text not null default 'bg-amber-600',
  image_url text not null default ''
);

create table public.products (
  id text primary key,
  name text not null,
  thai_name text,
  brand text not null default '',
  category text not null,
  store_id text not null references public.stores(id),
  store_name text not null default '',
  price_thb numeric not null check (price_thb > 0),
  weight_grams integer not null check (weight_grams > 0),
  image_url text not null default '',
  image_urls jsonb not null default '[]'::jsonb,
  description text not null default '',
  variants jsonb not null default '[]'::jsonb,
  popular_badge text,
  is_pre_order boolean not null default false,
  stock_status text not null default 'AVAILABLE' check (stock_status in ('AVAILABLE', 'LIMITED', 'SOLD_OUT')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.stores enable row level security;
alter table public.products enable row level security;

create policy "Anyone can read stores"
on public.stores for select to anon, authenticated using (true);

create policy "Anyone can read products"
on public.products for select to anon, authenticated using (true);

create policy "Admins can insert stores"
on public.stores for insert to authenticated
with check (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'));

create policy "Admins can update stores"
on public.stores for update to authenticated
using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'))
with check (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'));

create policy "Admins can delete stores"
on public.stores for delete to authenticated
using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'));

create policy "Admins can insert products"
on public.products for insert to authenticated
with check (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'));

create policy "Admins can update products"
on public.products for update to authenticated
using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'))
with check (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'));

create policy "Admins can delete products"
on public.products for delete to authenticated
using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'));

insert into public.stores (id, name, thai_name, area, description, category, badge_color, image_url) values
('eveandboy-siam', 'Eveandboy (Siam Square One)', 'อีฟแอนด์บอย สยามสแควร์วัน', 'Siam & Ratchaprasong', 'Surga kosmetik dan skincare terbesar di Bangkok.', 'Beauty & Skincare', 'bg-pink-500', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80'),
('gentle-woman-siam', 'Gentle Woman Flagship Store', 'เจนเทิล วูแมน สยามสแควร์', 'Siam & Ratchaprasong', 'Brand fashion viral Thailand dengan tas dan aksesori estetik.', 'Fashion & Bags', 'bg-amber-600', 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'),
('gmmtv-shop', 'GMMTV Shop (CentralWorld)', 'จีเอ็มเอ็มทีวี ช็อป เซ็นทรัลเวิลด์', 'Siam & Ratchaprasong', 'Official merchandise aktor dan artis serial GMMTV Thailand.', 'Thai Pop & Merch', 'bg-blue-600', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'),
('pratunam-market', 'Pratunam Fashion Market', 'ตลาดประตูน้ำ กรุงเทพฯ', 'Pratunam', 'Pusat grosir pakaian Bangkok terbesar.', 'Fashion & Bags', 'bg-emerald-600', 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80'),
('chatuchak-market', 'Chatuchak Weekend Market', 'ตลาดนัดจตุจักร', 'Chatuchak', 'Pasar akhir pekan legendaris dengan ribuan toko kerajinan lokal.', 'Lifestyle & Handicraft', 'bg-purple-600', 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80'),
('big-c-rajdamri', 'Big C Supercenter (Rajdamri)', 'บิ๊กซี ราชดำริ', 'Siam & Ratchaprasong', 'Pusat oleh-oleh camilan khas Thailand.', 'Snacks & Food', 'bg-red-600', 'https://images.unsplash.com/photo-1578916171728-466eac8d58?auto=format&fit=crop&w=800&q=80'),
('seven-eleven-thai', '7-Eleven Thailand', 'เซเว่น อีเลฟเว่น ไทยแลนด์', 'All Bangkok Outlets', 'Convenience store dengan snack dan skincare viral.', '7-Eleven Specials', 'bg-green-600', 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=80')
on conflict (id) do nothing;

insert into public.products (id, name, thai_name, brand, category, store_id, store_name, price_thb, weight_grams, image_url, description, variants, popular_badge, is_pre_order, stock_status) values
('prod-gw-tote', 'Gentle Woman Canvas Tote Bag (Original)', 'กระเป๋าผ้า เจนเทิล วูแมน', 'Gentle Woman', 'FASHION', 'gentle-woman-siam', 'Gentle Woman Flagship Siam', 490, 280, 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80', 'Tas kanvas viral dengan print logo ikonik Gentle Woman Bangkok.', '["Off-White Logo Hitam", "All Black Logo Putih", "Mini Dumpling Canvas"]', 'Best Seller Bangkok', false, 'AVAILABLE'),
('prod-4u2-jelly', '4U2 Jelly Tint Lip Stain (Viral Velvet Formula)', 'โฟร์ยูทู เจลลี่ ทิ้นท์', '4U2 Cosmetics', 'BEAUTY', 'eveandboy-siam', 'Eveandboy Siam Square One', 179, 40, 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80', 'Liptint tekstur jelly lembut yang tahan lama.', '["01 Gummy Bear", "03 Little Joy", "05 Baby Smile", "08 Love Like This"]', 'Viral TikTok Thailand', false, 'AVAILABLE'),
('prod-mistine-mascara', 'Mistine Super Model Miracle Lash Mascara 4D', 'มิสทิน ซุปเปอร์ โมเดล มาสคาร่า', 'Mistine Thailand', 'BEAUTY', 'eveandboy-siam', 'Eveandboy Siam Square One', 159, 50, 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80', 'Mascara waterproof dengan serat pemanjang bulu mata.', '["Standard Jet Black"]', 'Must Have Makeup', false, 'AVAILABLE'),
('prod-chatramue-tea', 'Cha Tra Mue Original Thai Tea Leaf Red Bag 400g', 'ชาตรามือ ชาไทยแท้ ถุงสีแดง', 'Cha Tra Mue (Number One Brand)', 'SNACKS', 'big-c-rajdamri', 'Big C Supercenter Rajdamri', 135, 450, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80', 'Daun teh asli Thailand dengan aroma khas Thai Tea.', '["Red Bag (Thai Tea Original)", "Green Bag (Thai Green Tea 200g)", "Gold Bag (Special Extra Aroma)"]', 'No. 1 Thai Tea', false, 'AVAILABLE'),
('prod-lays-truffle', 'Lay''s Thailand Exclusive Truffle & Salted Egg Flavors', 'เลย์ รสทรัฟเฟิล และ ไข่เค็ม', 'Lay''s Thailand', 'SNACKS', 'big-c-rajdamri', 'Big C Supercenter Rajdamri', 48, 100, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80', 'Keripik kentang edisi khusus Thailand.', '["Truffle Flavor (75g)", "Salted Egg Spicy (75g)", "Thai Boat Noodle (75g)"]', 'Snack Terfavorit', false, 'AVAILABLE'),
('prod-gmmtv-photocard', 'GMMTV Official Acrylic Standee & Exclusive Photocard Pack', 'สแตนดี้และโฟโต้การ์ด จีเอ็มเอ็มทีวี', 'GMMTV Official Store', 'THAI_POP', 'gmmtv-shop', 'GMMTV Shop CentralWorld', 450, 120, 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80', 'Merchandise resmi GMMTV Bangkok edisi terbaru.', '["Gemini-Fourth Set", "Off-Gun Set", "Tay-New Set", "Win Metawin Official"]', 'Exclusive Pop Merch', false, 'AVAILABLE'),
('prod-poysian-inhaler', 'Poy-Sian Mark II Herbal Inhaler & Oil (Pack of 6)', 'ยาดมตราโป๊ยเซียน มาร์ค ทู', 'Poy-Sian Thailand', 'SEVEN_ELEVEN', 'seven-eleven-thai', '7-Eleven Thailand', 140, 150, 'https://images.unsplash.com/photo-1608248597358-1e428e833446?auto=format&fit=crop&w=800&q=80', 'Inhaler herbal nomor satu di Thailand.', '["1 Strip (Isi 6 Pcs)"]', 'Oleh-oleh Wajib', false, 'AVAILABLE'),
('prod-pratunam-linen', 'Bangkok Premium Linen Oversized Resort Shirt', 'เสื้อเชิ้ตผ้าลินิน ประตูน้ำ', 'Pratunam Design Studio', 'FASHION', 'pratunam-market', 'Pratunam Fashion Market', 250, 220, 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80', 'Kemeja linen adem potongan oversized khas Pratunam.', '["Sage Green (All Size)", "Cream Sand (All Size)", "Sky Blue (All Size)", "Terracotta (All Size)"]', 'Bangkok Summer Style', false, 'AVAILABLE'),
('prod-smooto-tomato', 'Smooto Tomato Collagen White Serum (Box isi 6 Sachet)', 'สมูทโตะ เซรั่มมะเขือเทศ', 'Smooto Japan/Thailand', 'SEVEN_ELEVEN', 'seven-eleven-thai', '7-Eleven Thailand', 234, 180, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80', 'Serum sachet tomat viral di 7-Eleven Bangkok.', '["1 Box (Isi 6 Sachet)"]', '7-Eleven Top Viral', false, 'AVAILABLE')
on conflict (id) do nothing;
