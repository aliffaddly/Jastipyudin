'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { 
  Sparkles, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ShoppingBag, 
  MessageSquare,
  Store,
  ExternalLink
} from 'lucide-react';

export const CustomRequestsView: React.FC = () => {
  const { 
    customRequests, 
    currentUser,
    setIsCustomModalOpen, 
    calculatePriceBreakdown, 
    formatIDR, 
    formatTHB,
    addToCart 
  } = useApp();

  const customerRequests = currentUser
    ? customRequests.filter((request) => request.userId === currentUser.id)
    : [];

  return (
    <div className="max-w-4xl mx-auto mb-16">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Custom Shopper Request
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Daftar Titip Request Khusus Kamu
          </h2>
          <p className="text-xs text-slate-500">
            Pantau status barang yang kamu request langsung ke shopper di Bangkok.
          </p>
        </div>

        <button
          onClick={() => setIsCustomModalOpen(true)}
          className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Request Baru</span>
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {customerRequests.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-3xl flex items-center justify-center mx-auto mb-4 text-3xl">
              ✍️
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">Belum Ada Request Khusus</h3>
            <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
              Ingin titip barang Bangkok yang tidak ada di katalog? Kirimkan foto dan budgetmu sekarang!
            </p>
            <button
              onClick={() => setIsCustomModalOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md"
            >
              Ajukan Request Sekarang
            </button>
          </div>
        ) : (
          customerRequests.map((req) => {
            const priceTHB = req.quotedPriceTHB || req.targetPriceTHB;
            const breakdown = calculatePriceBreakdown(priceTHB, req.estimatedWeightGrams);

            return (
              <div
                key={req.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-card-hover transition-all flex flex-col sm:flex-row gap-5 justify-between items-start sm:items-center"
              >
                {/* Photo & Info */}
                <div className="flex gap-4 items-center">
                  <img
                    src={req.imageUrl}
                    alt={req.itemName}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 bg-slate-100 border border-slate-200"
                  />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {req.id}
                      </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        req.status === 'APPROVED' || req.status === 'OFFER_SENT' || req.status === 'PUBLISHED' || req.status === 'PRIVATE_REQUEST' ? 'bg-emerald-100 text-emerald-800' :
                        req.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status === 'OFFER_SENT' ? '✓ Penawaran Siap Dicek' :
                         req.status === 'PUBLISHED' ? '✓ Tayang di Katalog' :
                         req.status === 'PRIVATE_REQUEST' ? '✓ Private Offer' :
                         req.status === 'APPROVED' ? '✓ Disetujui Shopper' :
                         req.status === 'REJECTED' ? '✗ Stok Habis' :
                         '⏳ Menunggu Cek Toko BKK'}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
                      {req.itemName}
                    </h4>

                    <p className="text-xs text-slate-500">
                      Target Toko: <span className="font-semibold text-slate-700">{req.brandOrStore}</span>
                    </p>

                    <p className="text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-lg">
                      Spesifikasi: {req.notes}
                    </p>

                    {req.adminNotes && (
                      <p className="text-xs text-amber-800 font-medium italic">
                        Catatan Shopper: {req.adminNotes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 sm:text-right shrink-0">
                  <div className="mb-2">
                    <span className="text-[10px] text-slate-400 font-semibold block">Target / Quoted Price:</span>
                    <span className="text-xs font-bold text-slate-700">{formatTHB(priceTHB)}</span>
                    <span className="text-sm sm:text-base font-black text-rose-600 block">
                      {formatIDR(breakdown.landedSingleItemIdr)}
                    </span>
                  </div>

                  {(req.status === 'APPROVED' || req.status === 'OFFER_SENT' || req.status === 'PRIVATE_REQUEST') && (
                    <button
                      onClick={() => {
                        addToCart({
                          customRequestId: req.id,
                          name: `[Custom] ${req.itemName}`,
                          storeName: req.brandOrStore,
                          priceTHB: priceTHB,
                          quantity: 1,
                          weightGrams: req.estimatedWeightGrams,
                          notes: req.notes,
                          image: req.imageUrl,
                          isCustomRequest: true,
                        });
                      }}
                      className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Masukkan Keranjang</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
