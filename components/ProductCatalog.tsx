'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { 
  ShoppingBag, 
  MapPin, 
  Sparkles, 
  Scale, 
  Plus, 
  Info,
  CheckCircle,
  Eye,
  Search,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { Product } from '@/types';

export const ProductCatalog: React.FC = () => {
  const { 
    products, 
    selectedCategory, 
    searchQuery, 
    setSearchQuery,
    calculatePriceBreakdown, 
    formatIDR, 
    formatTHB, 
    addToCart,
    setSelectedProduct,
    exchangeConfig
  } = useApp();

  // Filter products by category and search
  const filteredProducts = products.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch = 
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.thaiName && item.thaiName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="mb-12">
      {/* Search Box */}
      <div className="relative mb-4 max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari Gentle Woman, 4U2, GMMTV, Cha Tra Mue..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-full pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all placeholder:text-slate-400 shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
          >
            ×
          </button>
        )}
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Katalog Titipan Populer Bangkok
          </h2>
          <p className="text-xs text-slate-500">
            Harga THB resmi dikonversikan otomatis ke Rupiah lengkap dengan estimasi jastip fee.
          </p>
        </div>

        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          Menampilkan {filteredProducts.length} Produk
        </span>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm max-w-md mx-auto my-8">
          <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
            🔍
          </div>
          <h3 className="font-bold text-slate-800 text-base mb-1">Produk Tidak Ditemukan</h3>
          <p className="text-xs text-slate-500 mb-5 leading-relaxed">
            Tidak menemukan barang Bangkok yang kamu cari? Gunakan fitur "Titip Khusus" untuk memesan langsung ke shopper kami.
          </p>
        </div>
      ) : (
        /* Product Cards Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {filteredProducts.map((product) => {
            const breakdown = calculatePriceBreakdown(product.priceTHB, product.weightGrams);

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col group"
              >
                {/* Image & Badges */}
                <div 
                  className="relative aspect-square w-full bg-slate-100 overflow-hidden cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <img
                    src={product.images?.[0] || product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Popularity Badge */}
                  {product.popularBadge && (
                    <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-md text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-md border border-white/20 shadow">
                      {product.popularBadge}
                    </div>
                  )}

                  {/* Weight Badge */}
                  <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                    <Scale className="w-3 h-3 text-slate-400" />
                    <span>{product.weightGrams}g</span>
                  </div>

                  {/* Quick View Overlay on Desktop */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center">
                    <span className="bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                      <Eye className="w-3.5 h-3.5" />
                      Detail & Varian
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Store location tag */}
                    <div className="flex items-center space-x-1 text-slate-400 text-[11px] mb-1 font-medium">
                      <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                      <span className="truncate">{product.storeName}</span>
                    </div>

                    {/* Product Name */}
                    <h3 
                      onClick={() => setSelectedProduct(product)}
                      className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 mb-1 cursor-pointer group-hover:text-amber-700 transition-colors"
                      title={product.name}
                    >
                      {product.name}
                    </h3>

                    {/* Thai Name if any */}
                    {product.thaiName && (
                      <p className="text-[10px] text-slate-400 truncate mb-2 font-thai">
                        {product.thaiName}
                      </p>
                    )}
                  </div>

                  {/* Dual Price Box */}
                  <div className="pt-2 border-t border-slate-100 mt-2">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">Harga THB:</span>
                        <span className="text-xs font-bold text-slate-600">
                          {formatTHB(product.priceTHB)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-amber-700 font-bold block">Harga IDR:</span>
                        <span className="text-xs sm:text-sm font-black text-rose-600">
                          {formatIDR(breakdown.landedSingleItemIdr)}
                        </span>
                      </div>
                    </div>

                    {/* Quick action buttons */}
                    <div className="grid grid-cols-4 gap-1.5 mt-2">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="col-span-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl flex items-center justify-center py-2 transition-colors"
                        title="Lihat Detail & Varian"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          addToCart({
                            productId: product.id,
                            name: product.name,
                            storeName: product.storeName,
                            priceTHB: product.priceTHB,
                            quantity: 1,
                            weightGrams: product.weightGrams,
                            selectedVariant: product.variants ? product.variants[0] : undefined,
                            image: product.image,
                            isCustomRequest: false,
                          });
                        }}
                        className="col-span-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2 px-2 rounded-xl flex items-center justify-center gap-1 shadow-sm shadow-amber-500/20 active:scale-95 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Titip Ini</span>
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
      <br />
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 text-emerald-950">
            <div className="flex items-center space-x-2 mb-2 font-extrabold text-xs text-emerald-900">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Mau Tanya Admin?</span>
            </div>
            <p className="text-xs text-emerald-800/90 leading-relaxed mb-4">
              Hubungi via WhatsApp untuk pertanyaan seputar titipan Bangkok, status pesanan, atau request barang khusus.
            </p>
            <p className="text-xs text-emerald-800/90 leading-relaxed mb-4">
            </p>

            <a
              href="https://wa.me/6285952743914?text=Halo%20Admin%20Jastipyudin,%20mau%20tanya%20status%20titipan%20Bangkok"
              target="_blank"
              rel="noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 transition-all"
            >
              <span>Chat WhatsApp Admin Jastipyudin</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
    </div>
  );
};
