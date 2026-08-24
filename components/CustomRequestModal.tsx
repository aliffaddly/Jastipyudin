'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/lib/store';
import { 
  X, 
  Sparkles, 
  UploadCloud, 
  Link as LinkIcon, 
  DollarSign, 
  Scale, 
  MessageSquare, 
  CheckCircle2, 
  ArrowRight,
  Store,
  Camera,
  Image as ImageIcon
} from 'lucide-react';

const PHOTO_PRESETS = [
  {
    label: 'Gentle Woman Bag',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Cosmetics / Skincare',
    url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Thai Snacks / Milk Tea',
    url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Bangkok Apparel / Linen',
    url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
  },
];

export const CustomRequestModal: React.FC = () => {
  const { 
    isCustomModalOpen, 
    setIsCustomModalOpen, 
    submitCustomRequest, 
    uploadRequestImage,
    calculatePriceBreakdown, 
    formatIDR, 
    formatTHB,
    stores,
    setBuyerTab,
    exchangeConfig,
    currentUser
  } = useApp();

  const [userName, setUserName] = useState(currentUser?.name || '');
  const [userPhone, setUserPhone] = useState(currentUser?.phone || '');
  const [itemName, setItemName] = useState('');
  const [brandOrStore, setBrandOrStore] = useState('Eveandboy (Siam Square One)');
  const [notes, setNotes] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [imageUrl, setImageUrl] = useState(PHOTO_PRESETS[0].url);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [targetPriceTHB, setTargetPriceTHB] = useState<number>(350);
  const [estimatedWeightGrams, setEstimatedWeightGrams] = useState<number>(200);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState<string>('');

  useEffect(() => {
    if (!isCustomModalOpen) return;

    setUserName(currentUser?.name || '');
    setUserPhone(currentUser?.phone || '');
    setItemName('');
    setBrandOrStore('Eveandboy (Siam Square One)');
    setNotes('');
    setReferenceUrl('');
    setImageUrl(PHOTO_PRESETS[0].url);
    setTargetPriceTHB(350);
    setEstimatedWeightGrams(200);
    setIsSuccess(false);
    setCreatedRequestId('');
  }, [isCustomModalOpen, currentUser?.id, currentUser?.name, currentUser?.phone]);

  if (!isCustomModalOpen) return null;

  const breakdown = calculatePriceBreakdown(targetPriceTHB || 0, estimatedWeightGrams || 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !userName || !userPhone) return;

    try {
      const reqId = await submitCustomRequest({
        userId: currentUser?.id || '',
        userName: currentUser?.name || userName,
        userPhone: currentUser?.phone || userPhone,
        itemName,
        brandOrStore,
        notes,
        referenceUrl: referenceUrl || undefined,
        imageUrl,
        targetPriceTHB: Number(targetPriceTHB) || 0,
        estimatedWeightGrams: Number(estimatedWeightGrams) || 100,
      });
      setCreatedRequestId(reqId);
      setIsSuccess(true);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Request gagal disimpan. Silakan coba lagi.');
    }
  };

  const handleClose = () => {
    setIsCustomModalOpen(false);
    setIsSuccess(false);
    setItemName('');
    setBrandOrStore('Eveandboy (Siam Square One)');
    setNotes('');
    setReferenceUrl('');
    setImageUrl(PHOTO_PRESETS[0].url);
    setTargetPriceTHB(350);
    setEstimatedWeightGrams(200);
    setCreatedRequestId('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 relative my-auto">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-rose-700 p-5 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center space-x-2 text-amber-200 text-xs font-bold uppercase mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Formulir Titip Request Khusus</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            Titip Barang Apa Saja dari Bangkok
          </h2>
          <p className="text-xs text-amber-100/90 mt-1">
            Shopper kami akan mencarikan barang sesuai foto dan detail pesananmu langsung di toko Bangkok.
          </p>
        </div>

        {isSuccess ? (
          /* Success Screen */
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">
              Request Berhasil Dikirim ke Shopper!
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto mb-4 leading-relaxed">
              ID Request: <span className="font-mono font-bold text-amber-700">{createdRequestId}</span>. 
              Shopper kami di Bangkok akan memeriksa ketersediaan stok & mengonfirmasi langsung via WhatsApp ke <span className="font-bold text-slate-800">{userPhone}</span>.
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-left mb-6 max-w-md mx-auto space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Barang:</span>
                <span className="font-bold text-slate-800">{itemName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Budget THB:</span>
                <span className="font-bold text-slate-800">{formatTHB(targetPriceTHB)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimasi Landed IDR:</span>
                <span className="font-black text-rose-600">{formatIDR(breakdown.landedSingleItemIdr)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  handleClose();
                  setBuyerTab('custom');
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md"
              >
                Lihat Daftar Request Saya
              </button>
              <button
                onClick={handleClose}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-2.5 rounded-xl text-xs"
              >
                Lanjut Belanja Katalog
              </button>
            </div>
          </div>
        ) : (
          /* Form Body */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 max-h-[72vh] overflow-y-auto space-y-4">
            
            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Pemesan *
                </label>
                <input
                  type="text"
                  required
                  disabled
                  placeholder="Contoh: Sarah Aulia"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  No. WhatsApp Aktif *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 08123456789"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>
            </div>

            {/* Item Name & Target Store */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Barang / Produk yang Dicari *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Gentle Woman Denim Halter Top (Size S)"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Lokasi / Toko Bangkok
                </label>
                <select
                  value={brandOrStore}
                  onChange={(e) => setBrandOrStore(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-medium text-slate-800"
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.area})
                    </option>
                  ))}
                  <option value="Toko Lainnya di Bangkok">Toko Lainnya di Bangkok (Bebas)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Link Referensi / Web Toko (Opsional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={referenceUrl}
                  onChange={(e) => setReferenceUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>
            </div>

            {/* Photo Selection / Preset */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Foto Contoh / Referensi Produk</span>
                <span className="text-[10px] text-slate-400 font-normal">Pilih preset atau upload foto sendiri</span>
              </label>

              <div className="grid grid-cols-4 gap-2 mb-2">
                {PHOTO_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all ${
                      imageUrl === preset.url
                        ? 'border-amber-600 ring-2 ring-amber-500/30 scale-105'
                        : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] truncate px-1 py-0.5 text-center">
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                />
              )}
              <label className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs cursor-pointer w-fit">
                <UploadCloud className="w-4 h-4 text-amber-600" />
                <span>{isUploadingImage ? 'Mengunggah...' : 'Upload foto sendiri'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  className="hidden"
                  disabled={isUploadingImage}
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    setIsUploadingImage(true);
                    try {
                      const url = await uploadRequestImage(file);
                      setImageUrl(url);
                    } catch (error) {
                      window.alert(error instanceof Error ? error.message : 'Gagal mengunggah foto.');
                    } finally {
                      setIsUploadingImage(false);
                    }
                  }}
                />
              </label>
            </div>

            {/* Specific Notes: Size, Shade, Flavor */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Detail Spesifikasi (Ukuran, Shade Warna, Varian Rasa, dll) *
              </label>
              <textarea
                required
                rows={2}
                placeholder="Contoh: Shade 03 (warm coral), kalau habis opsi kedua Shade 05. Size M."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>

            {/* Pricing Calculator in THB & Landed IDR */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-3">
                <DollarSign className="w-4 h-4 text-amber-600" />
                <span>Simulasi Biaya & Kurs Real-Time (1 THB = Rp {exchangeConfig.thbToIdrRate})</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Target Harga di Toko (THB ฿):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-500">฿</span>
                    <input
                      type="number"
                      min="1"
                      value={targetPriceTHB}
                      onChange={(e) => setTargetPriceTHB(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-7 pr-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Estimasi Berat (Gram):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="50"
                      step="50"
                      value={estimatedWeightGrams}
                      onChange={(e) => setEstimatedWeightGrams(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500/40"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">gram</span>
                  </div>
                </div>
              </div>

              {/* Real-time calculated landed cost */}
              <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">Estimasi Total Biaya (Sampai JKT):</span>
                  <span className="text-xs text-slate-400 font-mono">
                    Harga Asli {formatIDR(breakdown.rawIdr)} + Fee & Ongkir {formatIDR(breakdown.jastipFeeIdr + breakdown.markupIdr + breakdown.weightFeeIdr)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base sm:text-lg font-black text-rose-600">
                    {formatIDR(breakdown.landedSingleItemIdr)}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <span>Ajukan Request ke Shopper Bangkok</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-center text-slate-400 mt-2">
                🔒 Pembayaran baru ditagihkan setelah Shopper mengonfirmasi ketersediaan barang di Bangkok.
              </p>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
