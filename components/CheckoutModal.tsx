'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/store';
import confetti from 'canvas-confetti';
import { 
  X, 
  CheckCircle2, 
  QrCode, 
  CreditCard, 
  Truck, 
  MapPin, 
  Copy, 
  Check, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  ShoppingBag
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const { 
    currentUser,
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cart, 
    calculatePriceBreakdown, 
    formatIDR, 
    formatTHB,
    createOrder,
    submitPayment,
    setBuyerTab,
    exchangeConfig
  } = useApp();

  const [customerName, setCustomerName] = useState(currentUser?.name || 'Alya Putri Maharani');
  const [customerWhatsapp, setCustomerWhatsapp] = useState(currentUser?.phone || '081234567890');
  const [customerAddress, setCustomerAddress] = useState(currentUser?.address || 'Jl. Senopati Raya No. 42, Kebayoran Baru');
  const [customerCity, setCustomerCity] = useState(currentUser?.city || 'Jakarta Selatan');
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'BCA' | 'MANDIRI'>('QRIS');
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [paymentTimerSeconds, setPaymentTimerSeconds] = useState(899); // 15 mins
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isCheckoutOpen) return;

    setCustomerName(currentUser?.name || 'Alya Putri Maharani');
    setCustomerWhatsapp(currentUser?.phone || '081234567890');
    setCustomerAddress(currentUser?.address || 'Jl. Senopati Raya No. 42, Kebayoran Baru');
    setCustomerCity(currentUser?.city || 'Jakarta Selatan');
    setPaymentMethod('QRIS');
    setProofFile(null);
    setIsProcessing(false);
    setIsCompleted(false);
    setCreatedOrderNumber('');
    setPaymentTimerSeconds(899);
  }, [isCheckoutOpen, currentUser?.id, currentUser?.name, currentUser?.phone, currentUser?.address, currentUser?.city]);

  // Payment countdown
  useEffect(() => {
    if (!isCheckoutOpen) return;
    const interval = setInterval(() => {
      setPaymentTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  // Billing calculation for all items in the user's cart
  let totalRawTHB = 0;
  let totalRawIDR = 0;
  let totalJastipIDR = 0;
  let totalWeightFeeIDR = 0;
  let totalWeightGrams = 0;

  cart.forEach((item) => {
    const bd = calculatePriceBreakdown(item.priceTHB, item.weightGrams);
    totalRawTHB += item.priceTHB * item.quantity;
    totalRawIDR += bd.baseWithMarkupIdr * item.quantity;
    totalJastipIDR += bd.jastipFeeIdr * item.quantity;
    totalWeightFeeIDR += bd.weightFeeIdr * item.quantity;
    totalWeightGrams += item.weightGrams * item.quantity;
  });

  const grandTotal = totalRawIDR + totalJastipIDR + totalWeightFeeIDR;

  const handleCopyAccount = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedBank(true);
    setCopiedAmount(true);
    setTimeout(() => setCopiedBank(false), 2000);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleConfirmPayment = () => {
    if (!customerName || !customerWhatsapp || !customerAddress || !proofFile) return;
    if (proofFile.size > 5 * 1024 * 1024) {
      window.alert('Ukuran bukti transfer maksimal 5 MB.');
      return;
    }

    setIsProcessing(true);
    setTimeout(async () => {
      try {
        const order = await createOrder({
        customerName,
        customerWhatsapp,
        customerAddress,
        customerCity,
        paymentMethod,
        });
        await submitPayment(order.id, grandTotal, paymentMethod, proofFile);

        setCreatedOrderNumber(order.orderNumber);
        setIsProcessing(false);
        setIsCompleted(true);

        // Trigger Confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (error) {
        setIsProcessing(false);
        window.alert(error instanceof Error ? error.message : 'Pesanan gagal disimpan. Silakan coba lagi.');
      }
    }, 1000);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 relative my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-rose-700 p-5 text-white relative">
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center space-x-2 text-amber-200 text-xs font-bold uppercase mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure Checkout & Billing</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            Pembayaran & Pengiriman Titipan
          </h2>
          <p className="text-xs text-amber-100/90 mt-0.5">
            Total pembayaran mencakup seluruh item belanja dalam satu tagihan bersih.
          </p>
        </div>

        {isCompleted ? (
          /* Order Placed Success */
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Pesanan Berhasil Dibuat
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-2 mb-1">
              Pesanan Jastip Siap Dibelanjakan!
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto mb-4">
              Nomor Pesanan: <span className="font-mono font-bold text-amber-700 text-sm">{createdOrderNumber}</span>. 
              Bukti pembayaranmu sedang menunggu verifikasi admin. Pesanan akan masuk antrean belanja setelah pembayaran dikonfirmasi.
            </p>

            {/* Total Paid Summary Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs max-w-md mx-auto text-left mb-6 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Penerima:</span>
                <span className="font-bold text-slate-800">{customerName} ({customerWhatsapp})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Alamat Kirim:</span>
                <span className="font-medium text-slate-800 text-right max-w-[250px] truncate">{customerAddress}, {customerCity}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
                <span>Total Tagihan:</span>
                <span className="text-rose-600 font-extrabold">{formatIDR(grandTotal)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setIsCompleted(false);
                  setBuyerTab('tracking');
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2"
              >
                <Truck className="w-4 h-4" />
                <span>Buka Live Tracking Pesanan</span>
              </button>

              <button
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setIsCompleted(false);
                  setBuyerTab('home');
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-3 rounded-xl text-xs"
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        ) : (
          /* Simplified Checkout Body */
          <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-6">
            
            {/* 1. Customer & Shipping Destination */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>1. Alamat Pengiriman di Indonesia</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Nama Penerima *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500/30 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    No. WhatsApp (Notifikasi Resi) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerWhatsapp}
                    onChange={(e) => setCustomerWhatsapp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500/30 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Alamat Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Kota / Kabupaten *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
              </div>
            </div>

            {/* 2. Total Cart Summary & Billing Breakdown */}
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-amber-600" />
                  <span>2. Rincian & Total Tagihan Keranjang ({cart.length} Item)</span>
                </h3>
                <span className="text-[11px] font-bold text-amber-800">
                  Total Berat: ±{totalWeightGrams}g
                </span>
              </div>

              {/* Items preview in cart */}
              <div className="space-y-2 mb-3 max-h-32 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs bg-white/80 p-2 rounded-xl border border-amber-200/60">
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-slate-900 block truncate">{item.name}</span>
                      <span className="text-[10px] text-slate-500">
                        {item.quantity}x @ {formatTHB(item.priceTHB)} {item.selectedVariant ? `• ${item.selectedVariant}` : ''}
                      </span>
                    </div>
                    <span className="font-bold text-slate-800 shrink-0">
                      {formatIDR(calculatePriceBreakdown(item.priceTHB, item.weightGrams).landedSingleItemIdr * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Summary line items */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-amber-200/80">
                <div className="flex justify-between">
                  <span>1. Subtotal Harga Asli Barang di Bangkok ({formatTHB(totalRawTHB)}):</span>
                  <span className="font-semibold text-slate-800">{formatIDR(totalRawIDR)}</span>
                </div>
                <div className="flex justify-between">
                  <span>2. Total Jasa Titip (Jastip Fee):</span>
                  <span className="font-semibold text-slate-800">{formatIDR(totalJastipIDR)}</span>
                </div>
                <div className="flex justify-between">
                  <span>3. Total Estimasi Kargo Udara BKK ✈️ JKT (±{totalWeightGrams}g):</span>
                  <span className="font-semibold text-slate-800">{formatIDR(totalWeightFeeIDR)}</span>
                </div>
                
                <div className="pt-3 border-t border-amber-300 flex justify-between items-center text-sm font-extrabold text-slate-900">
                  <span>Total yang Harus Dibayar:</span>
                  <span className="text-base sm:text-lg font-black text-rose-600">
                    {formatIDR(grandTotal)}
                  </span>
                </div>

                <button
                      type="button"
                      onClick={() => handleCopyAccount(grandTotal.toString())}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      {copiedAmount ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAmount ? 'Tersalin' : 'Salin'}</span>
                    </button>
              </div>
            </div>

            {/* 3. Payment Gateway Selection & QRIS Mockup */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-amber-600" />
                <span>3. Metode Pembayaran (Instan & Otomatis)</span>
              </h3>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('QRIS')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'QRIS'
                      ? 'border-rose-600 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-rose-600" />
                  <span>QRIS (Semua Bank)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('BCA')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'BCA'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span>BCA Transfer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('MANDIRI')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'MANDIRI'
                      ? 'border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-amber-600" />
                  <span>Mandiri Transfer</span>
                </button>
              </div>

              {/* Payment UI Details */}
              {paymentMethod === 'QRIS' ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-700">QRIS Jastipyudin</span>
                    {/* <span className="text-[11px] font-mono font-bold text-rose-600 flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      <Clock className="w-3 h-3" />
                      Berlaku {formatTimer(paymentTimerSeconds)}
                    </span> */}
                  </div>

                  {/* QR Box */}
                  <div className="w-55 h-77 bg-white p-3 rounded-2xl border border-slate-300 mx-auto mb-2 flex flex-col items-center justify-center shadow-inner relative group">
                    <img
                      // src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=JASTIPYUDIN-TH-${grandTotal}`}
                      src="https://bcvhnwlucfbljjewumbh.supabase.co/storage/v1/object/public/payment-assets/Kode%20QRIS%20MUHAMMAD%20ALIF%20FADDLY%20RESPATYADI,%20Hiburan.PNG"
                      alt="QRIS Code"
                      className="w-45 h-60"
                    />
                    {/* <div className="text-[9px] font-bold text-slate-500 mt-1">NMID: ID1020268891001</div> */}
                  </div>

                  <p className="text-[11px] text-slate-500 mb-2">
                    Scan via GoPay, OVO, Dana, BCA Mobile, Livin, dll.
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Harap upload bukti transfer setelah melakukan transfer.
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700">
                      Nomor Rekening {paymentMethod}:
                    </span>
                    <span className="text-[11px] text-emerald-600 font-semibold">Online 24 Jam</span>
                  </div>

                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-300 mb-2">
                    <div>
                      <p className="text-[10px] text-slate-400">Atas Nama: MUHAMMAD ALIF FADDLY RESPATYADI</p>
                      <p className="font-mono font-black text-sm text-slate-900">
                        {paymentMethod === 'BCA' ? '4210408571' : '1570010757871'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyAccount(paymentMethod === 'BCA' ? '4210408571' : '1570010757871')}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedBank ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-500">
                    Harap upload bukti transfer setelah melakukan transfer.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-2xl p-3">
              <label className="block text-[11px] font-bold text-amber-900 mb-1.5" htmlFor="payment-proof">
                Upload Bukti Transfer *
              </label>
              <input
                id="payment-proof"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                required
                onChange={(event) => setProofFile(event.target.files?.[0] || null)}
                className="w-full text-xs text-slate-600 file:mr-2 file:rounded-lg file:border-0 file:bg-amber-600 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
              />
              <p className="text-[10px] text-amber-800 mt-1">JPG, PNG, WEBP, atau PDF. Maksimal 5 MB.</p>
            </div>

            {/* Action CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isProcessing || cart.length === 0 || !proofFile}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-95 transition-all text-sm disabled:opacity-75"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 animate-spin" />
                    Mengirim Pembayaran...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Bayar Total Tagihan ({formatIDR(grandTotal)})
                  </span>
                )}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
