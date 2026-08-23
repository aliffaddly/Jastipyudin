'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { CategoryType } from '@/types';
import { 
  Sparkles, 
  Sparkle, 
  Heart, 
  ShoppingBag, 
  Cookie, 
  Tv, 
  Store, 
  HelpCircle,
  Plus
} from 'lucide-react';

interface CategoryItem {
  id: CategoryType;
  label: string;
  thaiLabel: string;
  icon: React.ReactNode;
  count?: number;
}

export const CategoryPills: React.FC = () => {
  const { selectedCategory, setSelectedCategory, products, setIsCustomModalOpen } = useApp();

  const categories: CategoryItem[] = [
    {
      id: 'ALL',
      label: 'Semua Produk',
      thaiLabel: 'ทั้งหมด',
      icon: <Sparkles className="w-3.5 h-3.5" />,
      count: products.length,
    },
    {
      id: 'BEAUTY',
      label: 'Beauty & Skincare',
      thaiLabel: 'เครื่องสำอาง',
      icon: <Heart className="w-3.5 h-3.5" />,
      count: products.filter((p) => p.category === 'BEAUTY').length,
    },
    {
      id: 'FASHION',
      label: 'Fashion & Bags',
      thaiLabel: 'แฟชั่นและกระเป๋า',
      icon: <ShoppingBag className="w-3.5 h-3.5" />,
      count: products.filter((p) => p.category === 'FASHION').length,
    },
    {
      id: 'SNACKS',
      label: 'Snacks & Thai Food',
      thaiLabel: 'ขนมและอาหารไทย',
      icon: <Cookie className="w-3.5 h-3.5" />,
      count: products.filter((p) => p.category === 'SNACKS').length,
    },
    {
      id: 'THAI_POP',
      label: 'Thai Pop & Merch',
      thaiLabel: 'ป๊อปไทยและสินค้าดารา',
      icon: <Tv className="w-3.5 h-3.5" />,
      count: products.filter((p) => p.category === 'THAI_POP').length,
    },
    {
      id: 'SEVEN_ELEVEN',
      label: '7-Eleven Specials',
      thaiLabel: 'เซเว่น อีเลฟเว่น',
      icon: <Store className="w-3.5 h-3.5" />,
      count: products.filter((p) => p.category === 'SEVEN_ELEVEN').length,
    },
    {
      id: 'CUSTOM',
      label: 'Titip Khusus',
      thaiLabel: 'สั่งพิเศษ',
      icon: <HelpCircle className="w-3.5 h-3.5" />,
      count: products.filter((p) => p.category === 'CUSTOM').length,
    },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm sm:text-base font-extrabold text-slate-800 flex items-center gap-2">
          <span>Kategori Titipan Bangkok</span>
          <span className="text-xs font-normal text-slate-500 hidden sm:inline">Pilih kategori barang yang ingin dititip</span>
        </h2>

        <button
          onClick={() => setIsCustomModalOpen(true)}
          className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 hover:underline"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Barang tidak ada di katalog? Titip Khusus</span>
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                isActive
                  ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20 scale-105'
                  : 'bg-white text-slate-600 border-slate-200/90 hover:border-amber-300 hover:bg-amber-50/50'
              }`}
            >
              <span className={isActive ? 'text-amber-200' : 'text-amber-600'}>
                {cat.icon}
              </span>
              <span>{cat.label}</span>
              {cat.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {cat.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
