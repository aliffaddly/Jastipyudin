'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { 
  ShoppingBag, 
  Sparkles, 
  Search, 
  ShieldCheck, 
  UserCheck, 
  Truck,
  PlusCircle,
  User,
  LogOut,
  LogIn,
  ChevronDown
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentUser,
    logout,
    setIsAuthModalOpen,
    exchangeConfig, 
    cartTotalCount, 
    setIsCartOpen, 
    setIsCustomModalOpen,
    activeView, 
    setActiveView,
    searchQuery,
    setSearchQuery,
    buyerTab,
    setBuyerTab,
    trip
  } = useApp();

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleAdminSwitch = () => {
    if (!currentUser || currentUser.role !== 'ADMIN') {
      setIsAuthModalOpen(true);
    } else {
      setActiveView('admin');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-header">
      {/* Top Banner Alert / Exchange Rate Bar */}
      <div className="bg-gradient-to-r from-thai-gold-600 via-amber-600 to-thai-coral-600 text-white text-xs py-1 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 truncate">
            <span className="bg-white/20 text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
              LIVE TRIP BKK
            </span>
            <span className="truncate hidden sm:inline font-medium">
              ✈️ {trip.title} • Kuota Titipan {trip.quotaPercent}%
            </span>
            <span className="truncate sm:hidden font-medium">
              ✈️ Spree Bangkok Sedang Berlangsung!
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] shrink-0">
            <div className="flex items-center bg-black/20 px-2 py-0.5 rounded-full">
              <span className="opacity-80 mr-1">Kurs Hari Ini:</span>
              <span className="font-bold text-amber-200">1 THB = Rp {exchangeConfig.thbToIdrRate}</span>
            </div>
            <span className="hidden md:inline text-white/75">• Jastip Fee 100% Transparan</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { setActiveView('buyer'); setBuyerTab('home'); }}>
            <div className="w-10 h-10 rounded-2xl thai-gradient flex items-center justify-center shadow-md shadow-amber-500/20 text-white font-black text-xl">
              🇹🇭
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-amber-700 via-amber-900 to-rose-900 bg-clip-text text-transparent">
                  Jastipyudin
                </span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-300">
                  TH ➜ ID
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Personal Shopper Bangkok Terpercaya</p>
            </div>
          </div>

          {/* Desktop Navigation Links (Buyer Mode - No Live Drops) */}
          {activeView === 'buyer' && (
            <nav className="hidden lg:flex items-center space-x-1 bg-amber-50/80 p-1 rounded-full border border-amber-200/60">
              <button
                onClick={() => setBuyerTab('home')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  buyerTab === 'home'
                    ? 'bg-white text-amber-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Katalog Bangkok
              </button>
              <button
                onClick={() => setBuyerTab('stores')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  buyerTab === 'stores'
                    ? 'bg-white text-amber-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mall & Pasar Bangkok
              </button>
              <button
                onClick={() => setBuyerTab('custom')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  buyerTab === 'custom'
                    ? 'bg-white text-amber-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Request Khusus
              </button>
              <button
                onClick={() => setBuyerTab('tracking')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
                  buyerTab === 'tracking'
                    ? 'bg-white text-amber-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-amber-600" />
                Lacak Titipan
              </button>
            </nav>
          )}

          {/* Search Bar */}
          {activeView === 'buyer' && (
            <div className="flex-1 max-w-xs sm:max-w-sm hidden sm:block">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari Gentle Woman, 4U2, GMMTV, Cha Tra Mue..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/90 border border-slate-200 rounded-full pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all placeholder:text-slate-400 shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Actions: Custom CTA, Cart, User Session & Mode Switcher */}
          <div className="flex items-center space-x-2">
            {/* Custom Request CTA (Buyer Mode) */}
            {activeView === 'buyer' && (
              <button
                onClick={() => setIsCustomModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm shadow-amber-500/20 transition-transform active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Titip Khusus</span>
              </button>
            )}

            {/* Cart Button (Buyer Mode) */}
            {activeView === 'buyer' && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-slate-700 hover:text-amber-600 bg-white border border-slate-200 rounded-full shadow-sm hover:border-amber-300 transition-colors"
                aria-label="Buka Keranjang Titipan"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartTotalCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                    {cartTotalCount}
                  </span>
                )}
              </button>
            )}

            {/* User Session Profile / Auth Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-1.5 bg-white border border-slate-200 hover:border-amber-300 py-1 px-2.5 rounded-full shadow-sm text-xs font-bold text-slate-800 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-black">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="max-w-[80px] sm:max-w-[110px] truncate hidden sm:inline">
                    {currentUser.name}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-black ${
                    currentUser.role === 'ADMIN' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {currentUser.role === 'ADMIN' ? 'ADMIN' : 'PEMBELI'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs">
                    <div className="p-2 border-b border-slate-100 mb-1">
                      <p className="font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">@{currentUser.username}</p>
                    </div>

                    {currentUser.role === 'ADMIN' ? (
                      <button
                        onClick={() => {
                          setActiveView(activeView === 'admin' ? 'buyer' : 'admin');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-amber-50 text-amber-900 font-bold flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        <span>{activeView === 'admin' ? 'Tampilan Pembeli' : 'Dashboard Jastiper'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setBuyerTab('tracking');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2"
                      >
                        <Truck className="w-4 h-4 text-slate-500" />
                        <span>Pesanan Saya</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-rose-50 text-rose-600 font-bold flex items-center gap-2 mt-1 border-t border-slate-100"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm shadow-amber-600/20"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </button>
            )}

            {/* Portal Switcher (Pembeli / Admin Shopper) */}
            <div className="bg-slate-100 p-0.5 rounded-full flex items-center border border-slate-300/80 shadow-inner">
              <button
                onClick={() => setActiveView('buyer')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                  activeView === 'buyer'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Beralih ke Tampilan Pembeli"
              >
                Pembeli
              </button>
              <button
                onClick={handleAdminSwitch}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
                  activeView === 'admin'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-amber-800'
                }`}
                title="Beralih ke Dashboard Jastiper (Membutuhkan Login Admin)"
              >
                <ShieldCheck className="w-3 h-3" />
                Shopper Admin
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
