'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Plane, 
  Package, 
  FileText, 
  Check, 
  ChevronRight, 
  ExternalLink,
  ShoppingBag,
  MessageCircle,
  Camera
} from 'lucide-react';

export const OrderTrackingView: React.FC = () => {
  const { 
    orders, 
    currentUser,
    currentActiveOrderId, 
    setCurrentActiveOrderId, 
    formatIDR, 
    formatTHB,
    calculateLinePrice,
    resolveOrderItemShortage,
    refunds,
    setBuyerTab,
    setIsCustomModalOpen,
    confirmOrderReceived,
    proofSignedUrls
  } = useApp();

  const [deliveryProofFile, setDeliveryProofFile] = React.useState<File | null>(null);
  const [isConfirmingDelivery, setIsConfirmingDelivery] = React.useState(false);

  const customerOrders = currentUser
    ? orders.filter((order) => order.userId === currentUser.id)
    : [];
  const activeOrder = customerOrders.find((order) => order.id === currentActiveOrderId) || customerOrders[0];
  const unavailableItems = activeOrder?.items.filter((item) => item.fulfillmentStatus === 'FAILED' || item.fulfillmentStatus === 'CANCELLED') || [];
  const availableItems = activeOrder?.items.filter((item) => item.fulfillmentStatus !== 'FAILED' && item.fulfillmentStatus !== 'CANCELLED') || [];
  const shortageItems = activeOrder?.items.filter((item) => item.fulfillmentStatus === 'PARTIAL') || [];
  const refundItems = activeOrder?.items.filter((item) => {
    return item.fulfillmentStatus === 'FAILED'
      || item.fulfillmentStatus === 'CANCELLED'
      || (item.fulfillmentStatus === 'PARTIAL' && (item.shortageResolution === 'REFUND' || item.shortageResolution === 'CANCEL'));
  }) || [];
  const getMissingQuantity = (item: typeof activeOrder.items[number]) => {
    const orderedQuantity = item.orderedQuantity ?? item.quantity;
    const purchasedQuantity = item.purchasedQuantity ?? 0;
    return Math.max(0, orderedQuantity - purchasedQuantity);
  };
  const refundTotal = refundItems.reduce((total, item) => {
    return total + calculateLinePrice({
      priceTHB: item.priceTHB,
      weightGrams: item.weightGrams,
      quantity: getMissingQuantity(item),
    }).totalIdr;
  }, 0);

  const confirmShortageResolution = (itemName: string, resolution: 'REFUND' | 'CANCEL') => {
    const action = resolution === 'REFUND' ? 'memproses refund' : 'membatalkan bagian item yang kurang';
    return window.confirm(`Yakin ingin ${action} untuk ${itemName}? Pilihan ini tidak dapat diubah.`);
  };

  if (!activeOrder) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-sm max-w-md mx-auto my-8">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-3xl flex items-center justify-center mx-auto mb-4 text-3xl">
          📦
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Belum Ada Riwayat Titipan</h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Kamu belum memiliki pesanan aktif. Yuk pilih barang di katalog Bangkok atau titip request khusus!
        </p>
        <button
          onClick={() => setBuyerTab('home')}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md"
        >
          Lihat Katalog Bangkok
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mb-16">
      
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Live Order Tracker
            </span>
            <span className="text-xs text-slate-500">Update Real-time</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Lacak Status Titipan Bangkok
          </h2>
        </div>

        {/* Order Selector dropdown if multiple */}
        {customerOrders.length > 1 && (
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Pilih Pesanan:</span>
            <select
              value={activeOrder.id}
              onChange={(e) => setCurrentActiveOrderId(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              {customerOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} ({o.items.length} item - {formatIDR(o.totalIDR)})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Timeline & Live Status */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Status Hero Card */}
          <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-rose-800 text-white rounded-3xl p-6 shadow-xl border border-amber-400/20 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 text-8xl font-black select-none pointer-events-none">
              TRIP
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center space-x-2">
                <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-lg">
                  {activeOrder.orderNumber}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${
                  activeOrder.paymentStatus === 'CONFIRMED'
                    ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30'
                    : 'bg-amber-400/20 text-amber-200 border-amber-400/30'
                }`}>
                  {activeOrder.paymentStatus === 'CONFIRMED'
                    ? '✓ Pembayaran Terkonfirmasi'
                    : activeOrder.paymentStatus === 'VERIFYING'
                      ? '⏳ Menunggu Verifikasi Pembayaran'
                      : '⚠ Menunggu Pembayaran'}
                </span>
              </div>
              <span className="text-xs text-amber-200 font-medium">
                {activeOrder.createdAt ? new Date(activeOrder.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : 'Hari ini'}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black mb-1">
              {activeOrder.status === 'AWAITING_PAYMENT'
                ? '⚠️ Menunggu Pembayaran Dikonfirmasi'
                : activeOrder.status === 'SHOPPING'
                ? '🛍️ Barang Sedang Dibelikan di Toko Bangkok'
                : activeOrder.status === 'PACKED_READY'
                ? '📦 Sudah Dipacking & Siap Dibawa Pulang'
                : activeOrder.status === 'ARRIVED_JKT'
                ? '🏠 Barang Sudah Tiba di Jakarta'
                : '✅ Pesanan Selesai Diterima'}
            </h3>

            <p className="text-xs text-amber-100/90 leading-relaxed max-w-lg mb-4">
              Penerima: <span className="font-bold text-white">{activeOrder.customerName}</span> ({activeOrder.customerWhatsapp}) 
              — {activeOrder.customerCity}
            </p>

          </div>

          {/* Detailed Timeline Steps */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h4 className="text-sm font-extrabold text-slate-900 mb-5 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Perjalanan Titipan dari Bangkok ke Rumahmu</span>
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {activeOrder.trackingSteps.map((step, index) => {
                return (
                  <div key={index} className="relative group">
                    {/* Node Dot */}
                    <div
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        step.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                          : step.current
                          ? 'bg-amber-500 border-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                          : 'bg-white border-slate-300 text-transparent'
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>

                    {/* Content Box */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-0.5">
                        <span className={`text-xs font-extrabold ${step.completed || step.current ? 'text-slate-900' : 'text-slate-400'}`}>
                          {step.title}
                        </span>
                        {step.timestamp && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {step.timestamp}
                          </span>
                        )}
                      </div>

                      <p className={`text-xs ${step.completed || step.current ? 'text-slate-600' : 'text-slate-400'}`}>
                        {step.description}
                      </p>

                      <div className="flex items-center gap-1 text-[11px] text-amber-800 font-medium mt-1">
                        <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>{step.location}</span>
                      </div>

                      {/* Photo Proof if Available */}
                      {step.photoProofUrl && (
                        <div className="mt-3 p-3 bg-amber-50/60 rounded-2xl border border-amber-200 inline-block">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900 mb-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{step.status === 'DELIVERED' ? 'Foto Konfirmasi Barang Diterima:' : 'Foto Bukti Packing:'}</span>
                          </div>
                          <img
                            src={proofSignedUrls[step.photoProofUrl] || step.photoProofUrl}
                            alt="Bukti foto"
                            className="w-36 h-28 object-cover rounded-xl border border-amber-300 shadow-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Delivery Confirmation */}
          {activeOrder.status === 'DELIVERED' ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-xs font-bold text-emerald-800">Pesanan sudah kamu konfirmasi selesai dan diterima. Terima kasih sudah jastip di Jastipyudin!</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-sm font-extrabold text-slate-900">Sudah Menerima Barang?</h4>
              <p className="text-xs text-slate-500">Upload foto barang yang kamu terima, lalu klik selesaikan pesanan. Tombol ini aktif setelah barang tiba di Jakarta.</p>
              <label className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs cursor-pointer w-fit">
                <Camera className="w-4 h-4 text-amber-600" />
                <span>{deliveryProofFile ? deliveryProofFile.name : 'Upload foto barang diterima'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={activeOrder.status !== 'ARRIVED_JKT'}
                  onChange={(event) => setDeliveryProofFile(event.target.files?.[0] || null)}
                />
              </label>
              <button
                type="button"
                disabled={activeOrder.status !== 'ARRIVED_JKT' || !deliveryProofFile || isConfirmingDelivery}
                onClick={async () => {
                  if (!deliveryProofFile) return;
                  setIsConfirmingDelivery(true);
                  try {
                    await confirmOrderReceived(activeOrder.id, deliveryProofFile);
                    setDeliveryProofFile(null);
                  } catch (error) {
                    window.alert(error instanceof Error ? error.message : 'Gagal menyelesaikan pesanan.');
                  } finally {
                    setIsConfirmingDelivery(false);
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl"
              >
                {isConfirmingDelivery ? 'Menyimpan...' : 'Selesaikan Pesanan'}
              </button>
            </div>
          )}

        </div>

        {/* Right Column: Order Items Summary & Support CTA */}
        <div className="space-y-6">
          
          {/* Items in this order */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Item yang Dititip ({availableItems.reduce((total, item) => total + (item.purchasedQuantity ?? item.quantity), 0)})</span>
              <span className="text-amber-700 font-mono font-black">{formatTHB(activeOrder.subtotalTHB)}</span>
            </h4>

            <div className="space-y-3">
              {availableItems.map((item, idx) => (
                <div key={idx} className="flex gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 bg-slate-100"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-amber-700 font-bold uppercase truncate">{item.storeName}</p>
                    <h5 className="text-xs font-bold text-slate-900 truncate leading-snug">{item.name}</h5>
                    {item.selectedVariant && (
                      <p className="text-[10px] text-slate-500 truncate">Varian: {item.selectedVariant}</p>
                    )}
                    <div className="flex justify-between items-center mt-1 text-[11px]">
                      <span className="text-slate-500 font-semibold">{item.purchasedQuantity ?? item.quantity} dari {item.orderedQuantity ?? item.quantity}x @ {formatTHB(item.priceTHB)}</span>
                      <span className="font-extrabold text-slate-800">{formatIDR(calculateLinePrice({ priceTHB: item.priceTHB, weightGrams: item.weightGrams, quantity: item.purchasedQuantity ?? item.quantity }).totalIdr)}</span>
                    </div>
                    <p className={`text-[10px] font-bold mt-1 ${item.fulfillmentStatus === 'PURCHASED' ? 'text-emerald-700' : item.fulfillmentStatus === 'PARTIAL' ? 'text-orange-700' : 'text-amber-700'}`}>
                      Status: {item.fulfillmentStatus === 'PURCHASED' ? 'Sudah dibeli' : item.fulfillmentStatus === 'PARTIAL' ? 'Stok sebagian' : 'Pending'}
                    </p>
                    {item.fulfillmentStatus === 'PARTIAL' && (
                      <div className="mt-2 rounded-xl bg-orange-50 border border-orange-200 p-2.5">
                        <p className="text-[10px] text-orange-900 font-semibold mb-2">Stok kurang. Pilih penyelesaian untuk {((item.orderedQuantity ?? item.quantity) - (item.purchasedQuantity ?? 0))} item:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {item.shortageResolution === 'PENDING' && (
                            <>
                              <button type="button" onClick={() => confirmShortageResolution(item.name, 'REFUND') && resolveOrderItemShortage(activeOrder.id, item.id, 'REFUND')} className="bg-white border border-orange-300 text-orange-900 rounded-lg px-2 py-1 text-[10px] font-bold">Refund</button>
                              <button type="button" onClick={() => confirmShortageResolution(item.name, 'CANCEL') && resolveOrderItemShortage(activeOrder.id, item.id, 'CANCEL')} className="bg-white border border-orange-300 text-orange-900 rounded-lg px-2 py-1 text-[10px] font-bold">Batalkan kurangnya</button>
                            </>
                          )}
                        </div>
                        {item.shortageResolution && item.shortageResolution !== 'PENDING' && (
                          <p className="text-[10px] text-emerald-700 font-bold mt-2">
                            Pilihan: {item.shortageResolution === 'REFUND' ? `Refund ${formatIDR(calculateLinePrice({ priceTHB: item.priceTHB, weightGrams: item.weightGrams, quantity: Math.max(0, (item.orderedQuantity ?? item.quantity) - (item.purchasedQuantity ?? 0)) }).totalIdr)}` : 'Bagian yang kurang dibatalkan; selisih dikembalikan'}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {refundItems.length > 0 && (
              <div className="mt-5 pt-4 border-t border-rose-200 bg-rose-50/60 -mx-2 px-2 rounded-2xl">
                <h5 className="text-xs font-black text-rose-900 uppercase tracking-wider mb-3">
                  Rincian item yang direfund ({refundItems.reduce((total, item) => total + getMissingQuantity(item), 0)})
                </h5>
                <div className="space-y-3">
                  {refundItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3 pb-3 border-b border-rose-100 last:border-0 last:pb-0">
                      <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover shrink-0 bg-white" />
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-bold text-slate-900">{item.name}</h5>
                        <p className="text-[10px] text-rose-700 font-bold mt-1">
                          {item.fulfillmentStatus === 'PARTIAL'
                            ? `Stok sebagian: ${getMissingQuantity(item)} item tidak terbeli`
                            : `Status: ${item.fulfillmentStatus === 'FAILED' ? 'Gagal beli' : 'Cancel'}`}
                        </p>
                        <p className="text-[11px] text-slate-600 mt-1">Remarks: {item.fulfillmentNote || 'Tidak ada alasan yang dicatat.'}</p>
                        <p className="text-[11px] text-slate-700 mt-1">{getMissingQuantity(item)}x @ {formatTHB(item.priceTHB)}</p>
                        {(() => {
                          const refund = refunds.find((entry) => entry.orderItemId === item.id);
                          return refund ? <p className="text-[10px] text-emerald-700 font-bold mt-1">Status refund: {refund.status}</p> : null;
                        })()}
                      </div>
                      <span className="text-xs font-black text-rose-700 shrink-0">{formatIDR(calculateLinePrice({ priceTHB: item.priceTHB, weightGrams: item.weightGrams, quantity: getMissingQuantity(item) }).totalIdr)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {refundTotal > 0 && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-emerald-900">Total refund yang akan diproses</p>
                  <p className="text-[10px] text-emerald-800">Termasuk item gagal beli, cancel, dan quantity yang tidak terbeli.</p>
                </div>
                <span className="text-sm font-black text-emerald-700">{formatIDR(refundTotal)}</span>
              </div>
            )}

            {/* Total Billing Box */}
            <div className="mt-4 pt-3 border-t border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Barang:</span>
                <span className="font-semibold text-slate-800">{formatIDR(activeOrder.subtotalIDR)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Jastip & Handling:</span>
                <span className="font-semibold text-slate-800">{formatIDR(activeOrder.jastipFeeIDR)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Penyesuaian Kapasitas Bagasi:</span>
                <span className="font-semibold text-slate-800">{formatIDR(activeOrder.weightFeeIDR)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
                <span>Total Lunas:</span>
                <span className="text-rose-600 font-extrabold">{formatIDR(activeOrder.totalIDR)}</span>
              </div>
            </div>
          </div>

          {/* Shopper Direct Support WhatsApp CTA */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 text-emerald-950">
            <div className="flex items-center space-x-2 mb-2 font-extrabold text-xs text-emerald-900">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Mau Tanya Admin?</span>
            </div>
            <p className="text-xs text-emerald-800/90 leading-relaxed mb-4">
              Hubungi via WhatsApp untuk pertanyaan seputar titipan Bangkok, status pesanan, atau request barang khusus.
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

      </div>

    </div>
  );
};
