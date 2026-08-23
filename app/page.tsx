'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { Navbar } from '@/components/Navbar';
import { TripBanner } from '@/components/TripBanner';
import { CategoryPills } from '@/components/CategoryPills';
import { ProductCatalog } from '@/components/ProductCatalog';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { CustomRequestModal } from '@/components/CustomRequestModal';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { AuthModal } from '@/components/AuthModal';
import { OrderTrackingView } from '@/components/OrderTrackingView';
import { AdminDashboard } from '@/components/AdminDashboard';
import { BangkokStoresView } from '@/components/BangkokStoresView';
import { CustomRequestsView } from '@/components/CustomRequestsView';
import { BottomNav } from '@/components/BottomNav';
import { PwaInstallPrompt } from '@/components/PwaInstallPrompt';

export default function Home() {
  const { 
    activeView, 
    buyerTab, 
    setBuyerTab,
    setIsCustomModalOpen
  } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-thai-cream selection:bg-amber-200 selection:text-amber-900">
      
      {/* Top Navbar with Session Auth */}
      <Navbar />

      {/* PWA Install Notification Prompt */}
      <PwaInstallPrompt />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        
        {/* SHOPPER ADMIN VIEW */}
        {activeView === 'admin' ? (
          <AdminDashboard />
        ) : (
          /* BUYER VIEW */
          <div className="space-y-6">
            
            {/* Trip Hero Banner on home */}
            {buyerTab === 'home' && (
              <TripBanner />
            )}

            {/* TAB: Home Catalog */}
            {buyerTab === 'home' && (
              <>
                <CategoryPills />
                <ProductCatalog />
              </>
            )}

            {/* TAB: Bangkok Stores & Markets */}
            {buyerTab === 'stores' && (
              <BangkokStoresView />
            )}

            {/* TAB: Custom Requests Tracking */}
            {buyerTab === 'custom' && (
              <CustomRequestsView />
            )}

            {/* TAB: Order Live Tracking */}
            {buyerTab === 'tracking' && (
              <OrderTrackingView />
            )}

          </div>
        )}

      </main>

      {/* Modals & Slide-overs */}
      <ProductDetailModal />
      <CustomRequestModal />
      <CartDrawer />
      <CheckoutModal />
      <AuthModal />

      {/* Mobile Sticky Bottom Navigation */}
      <BottomNav />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-base">🇹🇭</span>
            <span className="font-extrabold text-slate-800">Jastipyudin by @aliffaddlyy</span>
            <span>— Jastip Thailand Resmi & Terpercaya</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] font-medium text-slate-600">
            <span>Siam Square</span>
            <span>•</span>
            <span>CentralWorld</span>
            <span>•</span>
            <span>Pratunam Market</span>
            <span>•</span>
            <span>Chatuchak BKK</span>
          </div>

          <div className="text-[11px] text-slate-400">
            © 2026 Jastipyudin PWA. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
