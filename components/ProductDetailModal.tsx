'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { 
  X, 
  MapPin, 
  Scale, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Check, 
  ShieldCheck, 
  Sparkles,
  Info,
  HelpCircle
  , ChevronLeft, ChevronRight
} from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const { 
    selectedProduct, 
    setSelectedProduct, 
    calculatePriceBreakdown, 
    calculateLinePrice,
    formatIDR, 
    formatTHB, 
    addToCart,
    exchangeConfig
  } = useApp();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string>(
    selectedProduct?.variants ? selectedProduct.variants[0] : ''
  );
  const [notes, setNotes] = useState('');
  const [showBreakdownInfo, setShowBreakdownInfo] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  React.useEffect(() => {
    if (!selectedProduct) return;

    setQuantity(1);
    setSelectedVariant(selectedProduct.variants ? selectedProduct.variants[0] : '');
    setNotes('');
    setShowBreakdownInfo(false);
    setSelectedImageIndex(0);
  }, [selectedProduct?.id]);

  if (!selectedProduct) return null;

  const productImages = selectedProduct.images?.length ? selectedProduct.images : [selectedProduct.image];

  const breakdown = calculatePriceBreakdown(selectedProduct.priceTHB, selectedProduct.weightGrams);
  const lineBreakdown = calculateLinePrice({
    priceTHB: selectedProduct.priceTHB,
    weightGrams: selectedProduct.weightGrams,
    quantity,
  });
  const totalItemLanded = lineBreakdown.totalIdr;

  const handleAddToCart = () => {
    addToCart({
      productId: selectedProduct.id,
      name: selectedProduct.name,
      storeName: selectedProduct.storeName,
      priceTHB: selectedProduct.priceTHB,
      quantity,
      weightGrams: selectedProduct.weightGrams,
      selectedVariant: selectedVariant || (selectedProduct.variants ? selectedProduct.variants[0] : undefined),
      notes: notes.trim() || undefined,
      image: selectedProduct.image,
      isCustomRequest: false,
    });
    setSelectedProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 relative my-auto">
        
        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-colors"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Product Media */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-slate-100">
          <img
            src={productImages[selectedImageIndex] || selectedProduct.image}
            alt={selectedProduct.name}
            className="w-full h-full object-cover"
          />
          {productImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setSelectedImageIndex((index) => (index - 1 + productImages.length) % productImages.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/55 text-white flex items-center justify-center"
                aria-label="Foto sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setSelectedImageIndex((index) => (index + 1) % productImages.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/55 text-white flex items-center justify-center"
                aria-label="Foto berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
          <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md text-amber-300 text-xs font-bold px-3 py-1 rounded-xl border border-white/10 flex items-center gap-1.5 shadow">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>{selectedProduct.storeName}</span>
          </div>

          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-xl shadow">
            Estimasi: {selectedProduct.weightGrams} gram
          </div>
        </div>

        {productImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto px-5 pt-3 sm:px-6">
            {productImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setSelectedImageIndex(index)}
                className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 ${selectedImageIndex === index ? 'border-amber-600' : 'border-slate-200'}`}
                aria-label={`Pilih foto ${index + 1}`}
              >
                <img src={image} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[60vh] overflow-y-auto">
          {/* Brand & Title */}
          <div className="mb-3">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              {selectedProduct.brand}
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
              {selectedProduct.name}
            </h2>
            {selectedProduct.thaiName && (
              <p className="text-xs text-slate-400 font-medium">
                {selectedProduct.thaiName}
              </p>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed mb-5">
            {selectedProduct.description}
          </p>

          {/* Variants Selector if available */}
          {selectedProduct.variants && selectedProduct.variants.length > 0 && (
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-800 mb-2">
                Pilih Varian / Shade / Model:
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.variants.map((v) => {
                  const isSelected = (selectedVariant || selectedProduct.variants?.[0]) === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes for Shopper */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Catatan Tambahan untuk Shopper (Opsional):
            </label>
            <input
              type="text"
              placeholder="Contoh: Tolong pilih kemasan yang masa expired masih panjang"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>

          {/* Price Breakdown Component */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 mb-5 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-900 mb-2">
              <span className="flex items-center gap-1.5 text-amber-900">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Rincian Perhitungan Biaya Transparan
              </span>
              {/* <button
                type="button"
                onClick={() => setShowBreakdownInfo(!showBreakdownInfo)}
                className="text-[11px] text-amber-700 hover:underline flex items-center gap-1"
              >
                <HelpCircle className="w-3 h-3" />
                {showBreakdownInfo ? 'Sembunyikan' : 'Detail Formula'}
              </button> */}
            </div>

            <div className="space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Harga Resmi Toko (THB ➜ IDR):</span>
                <span className="font-semibold text-slate-800">
                  {formatTHB(selectedProduct.priceTHB)} ({formatIDR(breakdown.rawIdr)})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Jasa Titip & Handling Fee:</span>
                <span className="font-semibold text-slate-800">
                  {formatIDR(lineBreakdown.totalHandlingIdr + lineBreakdown.totalMarkupIdr)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Penyesuaian Kapasitas Bagasi ({lineBreakdown.totalWeightGrams}g):</span>
                <span className="font-semibold text-slate-800">
                  {formatIDR(lineBreakdown.baggageFeeIdr)}
                </span>
              </div>

              {showBreakdownInfo && (
                <div className="pt-2 mt-2 border-t border-amber-200 text-[10px] text-slate-500 bg-white/60 p-2 rounded-lg leading-relaxed">
                  Formula: (Harga THB × Kurs Rp {exchangeConfig.thbToIdrRate}) + Markup {exchangeConfig.markupPercent}% + Jasa Titip sesuai harga barang + Penyesuaian kapasitas bagasi.
                </div>
              )}

              <div className="pt-2 border-t border-amber-200 flex justify-between items-center text-sm font-extrabold text-amber-950">
                <span>Harga Bersih Sampai Jakarta:</span>
                <span className="text-rose-600 font-black text-base">
                  {formatIDR(breakdown.landedSingleItemIdr)} / pcs
                </span>
              </div>
            </div>
          </div>

          {/* Quantity and Add to Cart Section */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex items-center border border-slate-300 rounded-xl bg-white p-1">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors"
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-extrabold text-sm text-slate-800">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold py-3 px-4 rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Titip ({formatIDR(totalItemLanded)})</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
