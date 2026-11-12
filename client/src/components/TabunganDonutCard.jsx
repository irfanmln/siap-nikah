import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, EyeOff, Sparkles, PieChart } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

const DEFAULT_CATEGORY_THEMES = [
  { stroke: '#8b5cf6', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-500', icon: '💒' },
  { stroke: '#0ea5e9', bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', badge: 'bg-sky-500', icon: '💍' },
  { stroke: '#f43f5e', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', badge: 'bg-rose-500', icon: '💰' },
  { stroke: '#10b981', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-500', icon: '🎁' },
  { stroke: '#f59e0b', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-500', icon: '📋' },
];

export default function TabunganDonutCard({
  tabungan = [],
  totalSavings = 0,
  activeFilter = 'Semua',
  onSelectCategory
}) {
  const [activeIndex, setActiveIndex] = useState(-1); // -1 = Overview (Total)
  const [showBalance, setShowBalance] = useState(true);

  // Group tabungan by category
  const categoryMap = {};
  tabungan.forEach((item) => {
    const cat = item.category || 'Tabungan';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { name: cat, total: 0, count: 0 };
    }
    categoryMap[cat].total += Number(item.amount) || 0;
    categoryMap[cat].count += 1;
  });

  const categories = Object.values(categoryMap)
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total)
    .map((c, index) => {
      const theme = DEFAULT_CATEGORY_THEMES[index % DEFAULT_CATEGORY_THEMES.length];
      const percentage = totalSavings > 0 ? (c.total / totalSavings) * 100 : 0;
      return {
        ...c,
        percentage,
        theme
      };
    });

  // SVG Geometry for Donut Ring
  const size = 260;
  const center = size / 2;
  const radius = 90;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;

  // Calculate SVG stroke dashes and badge coordinates
  let cumulativePercent = 0;
  const slices = categories.map((cat, idx) => {
    const percent = cat.percentage;
    const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativePercent / 100) * circumference);

    // Calculate midpoint angle for icon badge (in radians, -90deg starting point)
    const midAngle = ((cumulativePercent + percent / 2) / 100) * 360 - 90;
    const rad = (midAngle * Math.PI) / 180;
    const badgeX = center + radius * Math.cos(rad);
    const badgeY = center + radius * Math.sin(rad);

    cumulativePercent += percent;

    return {
      ...cat,
      idx,
      strokeDasharray,
      strokeDashoffset,
      badgeX,
      badgeY
    };
  });

  // Total slides count: 1 (Overview) + categories count
  const totalSlides = categories.length + 1;
  // Current slide: 0 = Overview, 1..N = Categories
  const currentSlide = activeIndex + 1;

  const handlePrev = () => {
    const nextSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    const newIdx = nextSlide - 1;
    setActiveIndex(newIdx);
    if (onSelectCategory) {
      onSelectCategory(newIdx >= 0 ? categories[newIdx].name : 'Semua');
    }
  };

  const handleNext = () => {
    const nextSlide = (currentSlide + 1) % totalSlides;
    const newIdx = nextSlide - 1;
    setActiveIndex(newIdx);
    if (onSelectCategory) {
      onSelectCategory(newIdx >= 0 ? categories[newIdx].name : 'Semua');
    }
  };

  const handleSelectSlice = (idx) => {
    if (activeIndex === idx) {
      // Toggle back to overview
      setActiveIndex(-1);
      if (onSelectCategory) onSelectCategory('Semua');
    } else {
      setActiveIndex(idx);
      if (onSelectCategory) onSelectCategory(categories[idx].name);
    }
  };

  const selectedCategory = activeIndex >= 0 ? categories[activeIndex] : null;

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs p-5 sm:p-6 transition-all">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-rose-500" />
            <h3 className="font-bold text-stone-900 text-sm sm:text-base">
              Alokasi Finansial Tabungan
            </h3>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">
            Komposisi dana tabungan bersama berdasarkan peruntukan
          </p>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-stone-100 text-stone-600">
          {categories.length} Kategori
        </span>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-8 text-stone-400 text-xs">
          Belum ada setoran tabungan untuk dianalisis.
        </div>
      ) : (
        <div className="flex flex-col items-center">
          
          {/* Interactive Donut Graphic */}
          <div className="relative w-[260px] h-[260px] flex items-center justify-center select-none">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="transform -rotate-90"
            >
              {/* Background Ring */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#f5f5f4"
                strokeWidth={strokeWidth}
              />

              {/* Colored Segments */}
              {slices.map((slice) => {
                const isSelected = activeIndex === slice.idx;
                return (
                  <circle
                    key={slice.name}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={slice.theme.stroke}
                    strokeWidth={isSelected ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    strokeLinecap="round"
                    className="cursor-pointer transition-all duration-300 hover:opacity-90"
                    onClick={() => handleSelectSlice(slice.idx)}
                  />
                );
              })}
            </svg>

            {/* Floating Mini Badges on Ring Arcs */}
            {slices.map((slice) => {
              if (slice.percentage < 8) return null; // Only show badge if slice is large enough
              return (
                <div
                  key={`badge-${slice.name}`}
                  className="absolute w-6 h-6 rounded-full bg-white shadow-md border border-stone-200/80 flex items-center justify-center text-[10px] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-300"
                  style={{
                    left: `${slice.badgeX}px`,
                    top: `${slice.badgeY}px`,
                    transform: activeIndex === slice.idx ? 'translate(-50%, -50%) scale(1.2)' : 'translate(-50%, -50%) scale(1)'
                  }}
                >
                  <span>{slice.theme.icon}</span>
                </div>
              );
            })}

            {/* Center Content Display (Dynamic based on selected slide) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
              
              {selectedCategory ? (
                /* Selected Category View */
                <div className="animate-fade-in space-y-0.5">
                  <div
                    className="text-xs font-bold px-2 py-0.5 rounded-full inline-block text-white"
                    style={{ backgroundColor: selectedCategory.theme.stroke }}
                  >
                    {Math.round(selectedCategory.percentage)}%
                  </div>
                  <div className="text-xs font-bold text-stone-700 mt-1 truncate max-w-[140px]">
                    {selectedCategory.name}
                  </div>
                  <div className="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight">
                    {showBalance ? formatRupiah(selectedCategory.total) : '••••••••'}
                  </div>
                  <div className="text-[10px] text-stone-400">
                    {selectedCategory.count} kali setoran
                  </div>
                </div>
              ) : (
                /* Overview (Total) View */
                <div className="animate-fade-in space-y-0.5">
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                    Total Tabungan
                  </span>
                  <div className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight mt-0.5">
                    {showBalance ? formatRupiah(totalSavings) : '••••••••'}
                  </div>
                  <div className="text-[10px] text-stone-400">
                    {tabungan.length} transaksi setoran
                  </div>
                </div>
              )}

              {/* Eye Toggle Visibility */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBalance(!showBalance);
                }}
                className="mt-1 p-1 text-stone-300 hover:text-stone-600 rounded-lg transition pointer-events-auto cursor-pointer"
                title={showBalance ? "Sembunyikan Saldo" : "Tampilkan Saldo"}
              >
                {showBalance ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>

            </div>

          </div>

          {/* Stepper Navigation: <  ● ○ ○  > */}
          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={handlePrev}
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition cursor-pointer shadow-2xs active:scale-95"
              aria-label="Kategori Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Pagination Dots */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalSlides }).map((_, i) => {
                const isActive = i === currentSlide;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      const newIdx = i - 1;
                      setActiveIndex(newIdx);
                      if (onSelectCategory) {
                        onSelectCategory(newIdx >= 0 ? categories[newIdx].name : 'Semua');
                      }
                    }}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      isActive ? 'w-5 bg-rose-500' : 'w-2 bg-stone-200 hover:bg-stone-300'
                    }`}
                    title={i === 0 ? 'Total Keseluruhan' : categories[i - 1].name}
                  />
                );
              })}
            </div>

            <button
              onClick={handleNext}
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition cursor-pointer shadow-2xs active:scale-95"
              aria-label="Kategori Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Category Chips / Breakdown Cards */}
          <div className="w-full mt-5 pt-4 border-t border-stone-100">
            <div className="flex items-center justify-between text-xs text-stone-400 mb-2.5">
              <span>Rincian per Kategori:</span>
              {activeIndex >= 0 && (
                <button
                  onClick={() => {
                    setActiveIndex(-1);
                    if (onSelectCategory) onSelectCategory('Semua');
                  }}
                  className="text-rose-600 hover:underline font-semibold cursor-pointer"
                >
                  Tampilkan Semua
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {categories.map((cat, idx) => {
                const isSelected = activeIndex === idx;
                return (
                  <button
                    key={cat.name}
                    onClick={() => handleSelectSlice(idx)}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition text-left cursor-pointer ${
                      isSelected
                        ? 'bg-rose-50/70 border-rose-300 shadow-2xs ring-1 ring-rose-300'
                        : 'bg-stone-50/80 hover:bg-stone-100/70 border-stone-200/70 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-1">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: cat.theme.stroke }}
                      />
                      <div className="truncate">
                        <div className="text-xs font-bold text-stone-900 truncate">
                          {cat.name}
                        </div>
                        <div className="text-[10px] text-stone-400">
                          {cat.count} setoran ({Math.round(cat.percentage)}%)
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-stone-900 whitespace-nowrap pl-1">
                      {showBalance ? formatRupiah(cat.total) : '••••••'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
