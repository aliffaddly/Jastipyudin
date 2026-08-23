'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { MapPin, ArrowRight, Sparkles, Store, ShoppingBag } from 'lucide-react';

export const BangkokStoresView: React.FC = () => {
  const { stores, products, setSelectedProduct, addToCart, calculatePriceBreakdown, formatIDR, formatTHB } = useApp();

  return (
    <div className="mb-16">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
          <Store className="w-3.5 h-3.5" />
          <span>Destinasi Belanja Bangkok</span>
        </div>
        <h2 className="text-xl sm:text-3xl font-black text-slate-900">
          Mall & Pasar Grosir Bangkok yang Kami Kunjungi
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
          Shopper Jastipyudin berbelanja langsung di toko resmi & pasar grosir terkemuka di Bangkok untuk menjamin keaslian 100% dan harga termurah.
        </p>
      </div>

      <div className="space-y-8">
        {stores.map((store) => {
          const storeProducts = products.filter((p) => p.storeId === store.id || p.storeName.includes(store.name.split(' ')[0]));

          return (
            <div
              key={store.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Store Header Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="relative aspect-[16/9] md:aspect-auto md:h-full bg-slate-100">
                  <img
                    src={store.image}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded uppercase">
                      {store.category}
                    </span>
                    <h3 className="text-base font-extrabold mt-1">{store.name}</h3>
                    <p className="text-[10px] text-amber-200 font-mono">{store.thaiName}</p>
                  </div>
                </div>

                <div className="md:col-span-2 p-5 sm:p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-amber-800 font-bold mb-1.5">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      <span>Area: {store.area}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                      {store.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 mb-2">
                      Produk Populer di {store.name.split(' ')[0]}:
                    </h4>

                    {storeProducts.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {storeProducts.slice(0, 3).map((prod) => {
                          const bd = calculatePriceBreakdown(prod.priceTHB, prod.weightGrams);
                          return (
                            <div
                              key={prod.id}
                              onClick={() => setSelectedProduct(prod)}
                              className="bg-slate-50 hover:bg-amber-50/50 p-2 rounded-xl border border-slate-200 cursor-pointer transition-colors flex gap-2 items-center"
                            >
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-10 h-10 rounded-lg object-cover bg-white shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-[11px] font-bold text-slate-900 truncate">{prod.name}</p>
                                <p className="text-[10px] font-extrabold text-rose-600">{formatIDR(bd.landedSingleItemIdr)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">
                        Bisa dititip melalui form Request Khusus.
                      </p>
                    )}
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
