import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Wallet,
  Gift,
  Coins,
  Store,
  Mail,
  Users,
  Heart,
  Calendar,
  Sparkles,
  Download,
  Settings,
  ShieldAlert,
  LogOut,
  Crown,
  ChevronRight,
  ChevronDown,
  X,
  ArrowLeftRight,
  CalendarCheck,
  Clock,
  FileText,
  Shirt
} from 'lucide-react';
import { getDaysUntil, formatDate } from '../utils/formatters';

const NAV_SECTIONS = [
  {
    id: 'utama',
    title: 'UTAMA',
    items: [
      { id: 'dashboard', label: 'Ringkasan & Progres', icon: LayoutDashboard },
      { id: 'tabungan', label: 'Tabungan Bersama', icon: Wallet, badgeKey: 'tabungan' }
    ]
  },
  {
    id: 'persiapan',
    title: 'PERSIAPAN & HARI H',
    items: [
      { id: 'timeline', label: 'Timeline & Checklist', icon: CalendarCheck, badgeKey: 'timeline' },
      { id: 'rundown', label: 'Rundown Acara Hari H', icon: Clock, badgeKey: 'rundown' }
    ]
  },
  {
    id: 'anggaran',
    title: 'RINCIAN ANGGARAN',
    items: [
      { id: 'wedding', label: 'Vendor & Resepsi', icon: Store, badgeKey: 'wedding' },
      { id: 'seserahan', label: 'Seserahan & Hantaran', icon: Gift, badgeKey: 'seserahan' },
      { id: 'mahar', label: 'Mahar Pernikahan', icon: Coins, badgeKey: 'mahar' },
      { id: 'undangan', label: 'Undangan & Souvenir', icon: Mail, badgeKey: 'undangan' }
    ]
  },
  {
    id: 'tamu_legal',
    title: 'TAMU, SERAGAM & LEGAL',
    items: [
      { id: 'tamu', label: 'Daftar Tamu Undangan', icon: Users, badgeKey: 'tamu' },
      { id: 'seragam', label: 'Rekap Seragam & Panitia', icon: Shirt, badgeKey: 'seragam' },
      { id: 'legal', label: 'Dokumen KUA / Sipil', icon: FileText, badgeKey: 'legal' }
    ]
  }
];

export default function Sidebar({
  activeTab,
  setActiveTab,
  metadata,
  activeActor,
  setActiveActor,
  isPremium = false,
  onOpenUpgradeVip,
  onOpenInvite,
  onOpenSettings,
  onDownloadExcel,
  isAdmin = false,
  onOpenAdmin,
  user,
  onLogout,
  badgeCounts = {},
  isMobileOpen = false,
  setIsMobileOpen,
  weddings = [],
  activeWeddingId,
  onSwitchWedding
}) {
  const groomName = metadata?.groom || 'Pria';
  const brideName = metadata?.bride || 'Wanita';
  const daysRemaining = getDaysUntil(metadata?.weddingDate);

  const findSectionForTab = (tabId) => {
    return NAV_SECTIONS.find(sec => sec.items.some(item => item.id === tabId))?.id || 'utama';
  };

  // State dropdown accordion tiap section
  const [openSections, setOpenSections] = useState(() => {
    const activeSecId = findSectionForTab(activeTab);
    return {
      utama: true,
      persiapan: activeSecId === 'persiapan',
      anggaran: activeSecId === 'anggaran',
      tamu_legal: activeSecId === 'tamu_legal'
    };
  });

  // Otomatis buka accordion section jika tab aktif berubah
  useEffect(() => {
    const activeSecId = findSectionForTab(activeTab);
    setOpenSections(prev => ({
      ...prev,
      [activeSecId]: true
    }));
  }, [activeTab]);

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const displayActor = (activeActor === brideName) ? brideName : groomName;

  const toggleActor = () => {
    if (displayActor === groomName) {
      setActiveActor(brideName);
    } else {
      setActiveActor(groomName);
    }
  };

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between overflow-y-auto scrollbar-thin">
      
      {/* Top Part: Brand & Couple Info */}
      <div className="p-4 sm:p-5">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('dashboard');
              setIsMobileOpen?.(false);
            }}
            className="flex items-center space-x-2.5 text-left cursor-pointer group focus:outline-none"
            title="Kembali ke Dashboard Utama"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 p-0.5 shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-lg text-stone-900 leading-none group-hover:text-rose-600 transition">
                  Siap Nikah
                </span>
                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-700 font-bold">
                  v2
                </span>
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">Wedding Planning Suite</p>
            </div>
          </button>

          {/* Close button on mobile drawer */}
          <button
            onClick={() => setIsMobileOpen?.(false)}
            className="md:hidden p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wedding / Workspace Switcher (Jika user memiliki lebih dari 1 rencana pernikahan) */}
        {weddings && weddings.length > 1 && (
          <div className="p-2.5 rounded-2xl bg-stone-100/90 border border-stone-200/80 mb-3 shadow-2xs">
            <div className="flex items-center justify-between text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 px-0.5">
              <span>Ganti Rencana:</span>
              <span className="text-rose-600 font-semibold">{weddings.length} Workspace</span>
            </div>
            <select
              value={activeWeddingId}
              onChange={(e) => onSwitchWedding && onSwitchWedding(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-stone-300/80 text-xs font-bold text-stone-900 focus:outline-hidden focus:border-rose-400 cursor-pointer shadow-2xs"
            >
              {weddings.map((w) => (
                <option key={w.id} value={w.id}>
                  💍 {w.groom_name} & {w.bride_name} {w.owner_id === user?.id ? '(Milik Anda)' : '(Dari Pasangan)'}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Couple Profile Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-50 via-stone-50 to-amber-50/60 border border-rose-100 shadow-2xs mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="font-serif font-bold text-sm text-stone-900 truncate">
              {groomName} <span className="text-rose-500 font-sans font-light">&</span> {brideName}
            </h3>
            <span className="text-xs">💍</span>
          </div>
          
          <div className="flex items-center justify-between text-[11px] text-stone-500 mb-2.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-rose-400" />
              {metadata?.weddingDate ? formatDate(metadata.weddingDate) : 'Belum diatur'}
            </span>
            <span className="font-bold text-rose-600">
              {daysRemaining > 0 ? `${daysRemaining} hari lagi` : daysRemaining === 0 ? 'Hari H!' : 'Sah!'}
            </span>
          </div>

          {/* Actor Selector (Pria / Wanita) */}
          <div className="pt-2 border-t border-rose-200/50 flex items-center justify-between">
            <span className="text-[10px] text-stone-400 font-medium">Pengisi Data:</span>
            <button
              onClick={toggleActor}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-xs font-bold text-stone-800 transition cursor-pointer shadow-2xs"
              title="Ketuk untuk beralih antara Pria & Wanita"
            >
              <span>{displayActor === groomName ? '🤵' : '👰'}</span>
              <span className="truncate max-w-[80px]">{displayActor}</span>
              <ArrowLeftRight className="w-2.5 h-2.5 text-stone-400 ml-0.5" />
            </button>
          </div>
        </div>

        {/* VIP Status Banner */}
        <div className="mb-4">
          {isPremium ? (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-amber-100/70 border border-amber-300/80 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-amber-400 text-stone-900">
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-900">Siap Nikah VIP</h4>
                  <p className="text-[10px] text-amber-700">Akses Unlimited Seumur Hidup</p>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenUpgradeVip}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-xs transition hover:shadow-md cursor-pointer text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 fill-white" />
                <div>
                  <h4 className="text-xs font-bold">Upgrade ke VIP</h4>
                  <p className="text-[10px] text-rose-100">Hanya Rp 45.000 sekali bayar</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition" />
            </button>
          )}
        </div>

        {/* Navigation Sections with Collapsible Accordion / Dropdown */}
        <nav className="space-y-1.5">
          {NAV_SECTIONS.map((section) => {
            const isOpen = Boolean(openSections[section.id]);
            const hasActiveItem = section.items.some(item => item.id === activeTab);

            return (
              <div key={section.id} className="rounded-xl transition">
                {/* Accordion / Dropdown Header Button */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100/70 transition cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 group-hover:text-stone-800 truncate">
                      {section.title}
                    </span>
                    {hasActiveItem && !isOpen && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 animate-pulse" title="Menu aktif ada di dalam" />
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-stone-400 shrink-0">
                    <span className="text-[10px] font-medium text-stone-400 bg-stone-100 px-1.5 py-0.2 rounded-md">
                      {section.items.length}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 text-stone-400 group-hover:text-stone-600 ${
                        isOpen ? 'rotate-0' : '-rotate-90'
                      }`}
                    />
                  </div>
                </button>

                {/* Submenu Dropdown Items */}
                {isOpen && (
                  <div className="space-y-0.5 pt-0.5 pb-1 pl-1 border-l-2 border-stone-200/60 ml-3.5 my-0.5 animate-in slide-in-from-top-1 fade-in duration-150">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      const badge = badgeCounts[item.badgeKey];

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectTab(item.id)}
                          className={`w-full flex items-center justify-between px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                            isActive
                              ? 'bg-rose-500 text-white shadow-sm shadow-rose-200 font-bold'
                              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                            <span className="truncate">{item.label}</span>
                          </div>

                          {badge && (
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                              isActive ? 'bg-white/25 text-white' : 'bg-stone-200/80 text-stone-600'
                            }`}>
                              {badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

      </div>

      {/* Bottom Part: Quick Actions & User Profile */}
      <div className="p-4 border-t border-stone-200/80 bg-stone-50/60 space-y-2">
        
        {/* Quick Tool Links */}
        <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold">
          <button
            onClick={onDownloadExcel}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl text-stone-700 transition cursor-pointer shadow-2xs"
            title="Unduh backup spreadsheet Excel (.csv)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel</span>
            {!isPremium && <span className="text-[9px] bg-amber-200 text-amber-900 px-1 rounded font-bold">VIP</span>}
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl text-stone-700 transition cursor-pointer shadow-2xs"
            title="Pengaturan Target & Tanggal"
          >
            <Settings className="w-3.5 h-3.5 text-stone-500" />
            <span>Target</span>
          </button>
        </div>

        {/* Invite Partner Button */}
        <button
          onClick={onOpenInvite}
          className="w-full flex items-center justify-between py-2 px-3 bg-white hover:bg-rose-50/60 border border-rose-200/80 rounded-xl text-xs font-semibold text-rose-700 transition cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>Undang Pasangan (2 HP)</span>
          </div>
          {!isPremium && (
            <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-md font-bold flex items-center gap-0.5 border border-amber-200">
              <Crown className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> VIP
            </span>
          )}
        </button>

        {/* Admin Link (Only for Admin) */}
        {isAdmin && (
          <button
            onClick={onOpenAdmin}
            className="w-full flex items-center justify-between py-2 px-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-xs font-bold text-purple-700 transition cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
              <span>Panel Administrator</span>
            </div>
            <span className="text-[9px] bg-purple-200 text-purple-900 px-1.5 py-0.2 rounded-full font-bold">Admin</span>
          </button>
        )}

        {/* User Profile & Logout */}
        <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-7 h-7 rounded-full border border-stone-200 object-cover shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs border border-rose-200 shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-stone-900 truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-stone-400 truncate">{user?.email || ''}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer shrink-0"
            title="Keluar (Logout)"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );

  return (
    <>
      {/* 1. Desktop Fixed Sidebar */}
      <aside className="hidden md:flex w-64 lg:w-72 bg-white border-r border-stone-200/80 min-h-screen sticky top-0 h-screen z-30 shrink-0">
        {sidebarContent}
      </aside>

      {/* 2. Mobile Drawer Backdrop & Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          
          {/* Backdrop Overlay */}
          <div
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          {/* Drawer Menu Panel */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>

        </div>
      )}
    </>
  );
}
