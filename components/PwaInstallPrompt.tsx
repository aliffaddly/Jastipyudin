'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, Check } from 'lucide-react';

export const PwaInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Show banner after 2 seconds on initial visit
    const dismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => setShowPrompt(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  const handleInstallSimulate = () => {
    setIsInstalled(true);
    setTimeout(() => {
      setShowPrompt(false);
      localStorage.setItem('pwa_prompt_dismissed', 'true');
    }, 1500);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 bg-slate-900 text-white p-4 rounded-3xl shadow-2xl border border-amber-400/30 animate-in slide-in-from-top-4 duration-300">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-slate-400 hover:text-white p-1"
        aria-label="Tutup Banner PWA"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start space-x-3 pr-6">
        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xl shrink-0 shadow-lg">
          🇹🇭
        </div>

        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-extrabold text-sm text-white">Install App Jastipyudin</span>
            <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded">
              PWA
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1 leading-snug">
            Pasang di layar utama HP untuk notifikasi Live Drop Bangkok & tracking pesanan lebih cepat!
          </p>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleInstallSimulate}
              disabled={isInstalled}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow flex items-center gap-1.5 active:scale-95 transition-all"
            >
              {isInstalled ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-950" />
                  <span>Terpasang!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Pasang Aplikasi</span>
                </>
              )}
            </button>

            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-1"
            >
              Nanti Saja
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
