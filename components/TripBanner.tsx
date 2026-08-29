'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { 
  Plane, 
  Clock, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const TripBanner: React.FC = () => {
  const { trip, setIsCustomModalOpen, setBuyerTab } = useApp();

  // Countdown timer derived from trip.orderCloseDate
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    const computeTimeLeft = () => {
      const target = new Date(trip.orderCloseDate).getTime();
      if (Number.isNaN(target)) {
        setIsClosed(false);
        return;
      }
      const diffMs = target - Date.now();
      if (diffMs <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        setIsClosed(true);
        return;
      }
      setIsClosed(false);
      const totalSeconds = Math.floor(diffMs / 1000);
      setTimeLeft({
        hours: Math.floor(totalSeconds / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
      });
    };

    computeTimeLeft();
    const timer = setInterval(computeTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [trip.orderCloseDate]);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-amber-700 to-rose-800 text-white shadow-xl shadow-amber-900/10 mb-8 border border-amber-400/30">
      {/* Background Tropical Watermark Motif */}
      <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-40 h-40 bg-rose-400/10 rounded-full blur-xl pointer-events-none" />
      <div className="absolute top-4 right-6 opacity-10 text-9xl font-black select-none pointer-events-none">
        BANGKOK
      </div>

      <div className="relative p-6 sm:p-8 lg:p-10 z-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          
          {/* Status Badge */}
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center gap-1.5 bg-rose-500/90 hover:bg-rose-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-inner border border-rose-300/40">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              {trip.status === 'LIVE_SHOPPING' ? 'SHOPPER DI BANGKOK' : 'TRIP PLANNING'}
            </span>
            <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-md text-amber-100 text-xs px-3 py-1 rounded-full border border-white/20">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              {trip.currentShopperLocation}
            </span>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/10">
            <Clock className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '8s' }} />
            {isClosed ? (
              <span className="text-xs text-rose-200 font-bold">Titipan Ditutup</span>
            ) : (
              <>
                <span className="text-xs text-amber-200/90 font-medium">Tutup Titipan:</span>
                <div className="flex items-center space-x-1 font-mono font-black text-sm text-white">
                  <span className="bg-white/20 px-1.5 py-0.5 rounded">{String(timeLeft.hours).padStart(2, '0')}j</span>
                  <span>:</span>
                  <span className="bg-white/20 px-1.5 py-0.5 rounded">{String(timeLeft.minutes).padStart(2, '0')}m</span>
                  <span>:</span>
                  <span className="bg-white/20 px-1.5 py-0.5 rounded">{String(timeLeft.seconds).padStart(2, '0')}s</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main Banner Heading */}
        <div className="max-w-2xl mb-6">
          <div className="flex items-center gap-2 text-amber-200 text-xs font-bold uppercase tracking-wider mb-1">
            <Plane className="w-4 h-4 text-amber-300" />
            <span>Spree Belanja Thailand Terlengkap</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight mb-2">
            {trip.title}
          </h1>
          <p className="text-amber-100/90 text-xs sm:text-sm leading-relaxed">
            Titip langsung barang viral dari Bangkok! Gentle Woman, Pratunam Market, hingga camilan 7-Eleven Thailand dengan kurs murah spesial buat kamu.
          </p>
        </div>

        {/* Schedule & Quota Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-black/25 backdrop-blur-md rounded-2xl border border-white/10 mb-6">
          <div className="flex items-center space-x-3 p-1">
            <div className="w-9 h-9 rounded-xl bg-amber-500/30 flex items-center justify-center shrink-0 border border-amber-400/30">
              <Calendar className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <p className="text-[10px] text-amber-200 uppercase font-semibold">Jadwal Belanja BKK</p>
              <p className="text-xs font-bold text-white">{trip.startDate} - {trip.endDate}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-1">
            <div className="w-9 h-9 rounded-xl bg-rose-500/30 flex items-center justify-center shrink-0 border border-rose-400/30">
              <Plane className="w-4 h-4 text-rose-300" />
            </div>
            <div>
              <p className="text-[10px] text-rose-200 uppercase font-semibold">Penerbangan Pulang</p>
              <p className="text-xs font-bold text-white">{trip.flightDate} ✈️ JKT</p>
            </div>
          </div>

          <div className="flex flex-col justify-center p-1">
            <div className="flex justify-between items-center text-[10px] text-amber-200 font-semibold mb-1">
              <span>Slot Koper Bagasi</span>
              <span className="font-bold text-white">{trip.quotaPercent}% Terisi</span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-300 to-rose-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${trip.quotaPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Banner Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsCustomModalOpen(true)}
            className="flex items-center justify-center space-x-2 bg-white hover:bg-amber-50 text-amber-950 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-black/20 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Punya Request Khusus? Titip di Sini</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={() => setBuyerTab('stores')}
            className="flex items-center justify-center space-x-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm backdrop-blur-md transition-all"
          >
            <span>Lihat Mall & Pasar Bangkok</span>
          </button>

          <div className="hidden lg:flex items-center space-x-4 ml-auto text-xs text-amber-200/90 font-medium">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Produk Original Store</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Insha Allah Terpercaya</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
