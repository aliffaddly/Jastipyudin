'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Plane,
  Scale
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    removeFromCart, 
    updateCartQuantity, 
    clearCart,
    calculatePriceBreakdown, 
    calculateLinePrice,
    formatIDR, 
    formatTHB,
    setIsCheckoutOpen,
    exchangeConfig
  } = useApp();

  if (!isCartOpen) return null;

  // Calculate totals
  let totalRawTHB = 0;
  let totalRawIDR = 0;
  let totalJastipIDR = 0;
  let totalWeightFeeIDR = 0;
  let totalWeightGrams = 0;

  cart.forEach((item) => {
    const bd = calculateLinePrice(item);
    totalRawTHB += item.priceTHB * item.quantity;
    totalRawIDR += bd.totalRawIdr;
    totalJastipIDR += bd.totalMarkupIdr + bd.totalHandlingIdr;
    totalWeightFeeIDR += bd.baggageFeeIdr;
    totalWeightGrams += item.weightGrams * item.quantity;
  });

  const grandTotalIDR = totalRawIDR + totalJastipIDR + totalWeightFeeIDR;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-amber-500/10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Keranjang Titipan Bangkok
              </h2>
              <p className="text-[11px] text-slate-500">
                {cart.length} item • Total berat: ±{totalWeightGrams} gram
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold px-2 py-1"
              >
                Kosongkan
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
              aria-label="Tutup Keranjang"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-3xl flex items-center justify-center mx-auto mb-4 text-3xl">
                🛍️
              </div>
              <h3 className="font-bold text-slate-800 text-base mb-1">Keranjang Masih Kosong</h3>
              <p className="text-xs text-slate-500 mb-6 max-w-xs mx-auto">
                Yuk jelajahi katalog oleh-oleh Bangkok atau titip request khusus produk yang kamu inginkan!
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md"
              >
                Mulai Belanja Bangkok
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const breakdown = calculateLinePrice(item);
              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm hover:border-amber-300 transition-all flex gap-3"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover shrink-0 bg-slate-100"
                  />

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-[10px] text-amber-700 font-bold uppercase truncate">
                          {item.storeName}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 truncate leading-snug">
                        {item.name}
                      </h4>

                      {item.selectedVariant && (
                        <p className="text-[10px] text-slate-500 truncate">
                          Varian: <span className="font-semibold text-slate-700">{item.selectedVariant}</span>
                        </p>
                      )}

                      {item.notes && (
                        <p className="text-[10px] text-amber-800/80 italic truncate">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>

                    {/* Price & Stepper */}
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          {formatTHB(item.priceTHB)} / pcs
                        </span>
                        <span className="text-xs font-black text-rose-600">
                          {formatIDR(breakdown.landedSingleItemIdr * item.quantity)}
                        </span>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                        <button
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="w-6 h-6 rounded flex items-center justify-center hover:bg-white text-slate-700"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="w-6 h-6 rounded flex items-center justify-center hover:bg-white text-slate-700"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Checkout CTA */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50/80 space-y-3">
            {/* Itemized summary */}
            <div className="space-y-1.5 text-xs text-slate-600 bg-white p-3 rounded-2xl border border-slate-200/80">
              <div className="flex justify-between">
                <span>Subtotal Barang ({formatTHB(totalRawTHB)}):</span>
                <span className="font-semibold text-slate-800">{formatIDR(totalRawIDR)}</span>
              </div>
              <div className="flex justify-between">
                <span>Jasa Titip & Handling:</span>
                <span className="font-semibold text-slate-800">{formatIDR(totalJastipIDR)}</span>
              </div>
              <div className="flex justify-between">
                <span>Penyesuaian Kapasitas Bagasi (±{totalWeightGrams}g):</span>
                <span className="font-semibold text-slate-800">{formatIDR(totalWeightFeeIDR)}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-sm font-extrabold text-slate-900">
                <span>Total Belanja Sampai Jakarta:</span>
                <span className="text-base font-black text-rose-600">{formatIDR(grandTotalIDR)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
              className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-black py-3.5 px-4 rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <span>Lanjut ke Pembayaran & Pengiriman</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
