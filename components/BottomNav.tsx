'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { 
  ShoppingBag, 
  PlusCircle, 
  Truck, 
  Home, 
  Store,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { 
    buyerTab, 
    setBuyerTab, 
    activeView, 
    setActiveView, 
    cartTotalCount, 
    setIsCartOpen,
    setIsCustomModalOpen
  } = useApp();

  if (activeView === 'admin') {
    return (
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-slate-900 border-t border-slate-800 py-2.5 px-4 flex items-center justify-between text-white shadow-2xl">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold">Mode Shopper Admin</span>
        </div>
        <button
          onClick={() => setActiveView('buyer')}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-xl"
        >
          Kembali ke Pembeli
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden glass-panel border-t border-slate-200/80 px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around">
        
        {/* Katalog / Home */}
        <button
          onClick={() => setBuyerTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
            buyerTab === 'home' ? 'text-amber-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Katalog</span>
        </button>

        {/* Mall & Pasar Bangkok */}
        <button
          onClick={() => setBuyerTab('stores')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
            buyerTab === 'stores' ? 'text-amber-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Store className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Mall & Pasar</span>
        </button>

        {/* Custom Request Floating Action Button */}
        <button
          onClick={() => setIsCustomModalOpen(true)}
          className="flex flex-col items-center justify-center -mt-5 bg-gradient-to-tr from-amber-500 to-rose-500 text-white w-12 h-12 rounded-full shadow-lg shadow-amber-500/30 active:scale-95 transition-transform border-2 border-white"
          aria-label="Titip Request Khusus"
        >
          <PlusCircle className="w-6 h-6" />
        </button>

        {/* Lacak Order */}
        <button
          onClick={() => setBuyerTab('tracking')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
            buyerTab === 'tracking' ? 'text-amber-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Lacak</span>
        </button>

        {/* Keranjang */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 hover:text-amber-600"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartTotalCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {cartTotalCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Keranjang</span>
        </button>

      </div>
    </div>
  );
};
