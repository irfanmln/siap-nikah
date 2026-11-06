import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  Download,
  Settings,
  Heart,
  Sparkles,
  LogOut,
  User,
  ArrowLeftRight,
  ChevronDown,
  Crown,
  ShieldAlert
} from 'lucide-react';
import { getDaysUntil, formatDate } from '../utils/formatters';

export default function Navbar({
  metadata,
  activeActor,
  setActiveActor,
  onOpenSettings,
  onOpenInvite,
  onOpenUpgradeVip,
  onDownloadExcel,
  isAdmin = false,
  onOpenAdmin,
  user,
  onLogout
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isPremium = Boolean(metadata?.isPremium);
  const groomName = metadata?.groom || 'Pria';
  const brideName = metadata?.bride || 'Wanita';
  const daysRemaining = getDaysUntil(metadata?.weddingDate);

  const handleDownloadExcel = () => {
    if (onDownloadExcel) {
      onDownloadExcel();
    } else if (!isPremium) {
      onOpenUpgradeVip();
    } else {
      const token = localStorage.getItem('nikahplan_token');
      window.open(`/api/export-excel?wedding_id=${metadata?.id}&token=${token}`, '_blank');
    }
  };

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleActor = () => {
    if (activeActor === groomName) {
      setActiveActor(brideName);
    } else {
      setActiveActor(groomName);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-rose-100/80 shadow-2xs w-full max-w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20 gap-2">
          
          {/* Logo & Names */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 p-0.5 shadow-sm flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-white rounded-[10px] sm:rounded-[13px] flex items-center justify-center">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 fill-rose-500 animate-pulse" />
              </div>
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1.5">
                <h1 className="text-sm sm:text-2xl font-serif font-bold text-stone-900 tracking-tight truncate">
                  {groomName} <span className="text-rose-500 font-sans font-light">&</span> {brideName}
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                  <Sparkles className="w-3 h-3 mr-1 text-amber-500" /> Siap Nikah
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-stone-400 flex items-center mt-0.5 truncate">
                <Calendar className="w-3 h-3 mr-1 text-rose-400 shrink-0" />
                {formatDate(metadata?.weddingDate)}
              </p>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            
            {/* Desktop Countdown Badge */}
            <div className="hidden lg:flex items-center px-3.5 py-1.5 bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200/80 rounded-full shadow-2xs">
              <span className="text-base mr-1.5">💍</span>
              <div className="text-xs">
                {daysRemaining > 0 ? (
                  <span className="font-semibold text-rose-900">
                    <strong className="text-sm font-bold text-rose-600">{daysRemaining}</strong> hari lagi
                  </span>
                ) : daysRemaining === 0 ? (
                  <span className="font-bold text-rose-600 animate-bounce">Hari Bahagia Tiba! 🎉</span>
                ) : (
                  <span className="font-medium text-stone-600">Alhamdulillah Sah! ✨</span>
                )}
              </div>
            </div>

            {/* Mobile Actor Switcher: Single Compact Toggle Pill */}
            <button
              onClick={toggleActor}
              className="flex sm:hidden items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-stone-200/80 border border-stone-200 text-xs font-semibold text-stone-800 transition shadow-2xs cursor-pointer"
              title="Ketuk untuk ganti pengisi data (Pria/Wanita)"
            >
              <span>{activeActor === groomName ? '🤵' : '👰'}</span>
              <span className="max-w-[70px] truncate">{activeActor}</span>
              <ArrowLeftRight className="w-2.5 h-2.5 text-stone-400 ml-0.5" />
            </button>

            {/* Desktop Actor Switcher: Dual Button Pill */}
            <div className="hidden sm:flex items-center bg-stone-100 p-1 rounded-2xl border border-stone-200/80 shadow-inner">
              <button
                onClick={() => setActiveActor(groomName)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                  activeActor === groomName
                    ? 'bg-white text-stone-900 shadow-2xs font-bold ring-1 ring-stone-950/5'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
                title={`Isi data sebagai ${groomName}`}
              >
                <span>🤵</span>
                <span className="truncate max-w-[100px]">{groomName}</span>
              </button>

              <button
                onClick={() => setActiveActor(brideName)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                  activeActor === brideName
                    ? 'bg-rose-500 text-white shadow-2xs font-bold ring-1 ring-rose-400'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
                title={`Isi data sebagai ${brideName}`}
              >
                <span>👰</span>
                <span className="truncate max-w-[100px]">{brideName}</span>
              </button>
            </div>

            {/* VIP Status Badge or Upgrade VIP Button */}
            {!isPremium ? (
              <button
                onClick={onOpenUpgradeVip}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition hover:shadow-md cursor-pointer animate-pulse"
                title="Upgrade ke Siap Nikah VIP"
              >
                <Crown className="w-3.5 h-3.5 fill-white" />
                <span>Akses VIP</span>
              </button>
            ) : (
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-amber-100/90 border border-amber-300/80 text-amber-800 text-xs font-bold rounded-xl shadow-2xs"
                title="Status Akun: VIP Seumur Hidup"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-400" />
                <span>VIP Aktif</span>
              </div>
            )}

            {/* Desktop Excel Button */}
            <button
              onClick={handleDownloadExcel}
              className={`hidden md:inline-flex items-center px-3 py-1.5 text-white text-xs font-semibold rounded-xl shadow-xs transition hover:shadow-md cursor-pointer ${
                isPremium ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-stone-700 hover:bg-stone-800'
              }`}
              title={isPremium ? "Unduh backup Excel (.csv)" : "Fitur VIP: Unduh backup Excel"}
            >
              {isPremium ? (
                <Download className="w-3.5 h-3.5 mr-1" />
              ) : (
                <Crown className="w-3.5 h-3.5 mr-1 text-amber-300 fill-amber-300" />
              )}
              <span>Excel</span>
              {!isPremium && <span className="ml-1 text-[9px] bg-amber-400 text-stone-900 px-1 py-0.2 rounded font-bold">VIP</span>}
            </button>

            {/* Admin Panel Quick Button (Hanya tampil untuk Admin) */}
            {isAdmin && (
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl border border-purple-200 transition shadow-2xs cursor-pointer"
                title="Buka Pusat Pengelolaan Admin"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Admin Panel</span>
              </button>
            )}

            {/* Desktop Settings Button */}
            <button
              onClick={onOpenSettings}
              className="hidden sm:inline-flex p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition border border-stone-200 bg-white shadow-2xs cursor-pointer shrink-0"
              title="Pengaturan Tanggal & Target"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Profile Menu (Compact on Mobile, Full on Desktop) */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-1 p-0.5 sm:p-1 rounded-full hover:ring-2 hover:ring-rose-400/40 transition cursor-pointer"
                title="Menu Pengguna & Pengaturan"
              >
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-stone-200 object-cover shadow-2xs"
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs border border-rose-200">
                    {user?.name?.charAt(0) || <User className="w-4 h-4" />}
                  </div>
                )}
                <ChevronDown className="w-3 h-3 text-stone-400 hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200/80 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="text-xs font-bold text-stone-900 truncate">{user?.name || 'User'}</p>
                    <p className="text-[11px] text-stone-400 truncate">{user?.email || ''}</p>
                  </div>

                  <div className="py-1">
                    {!isPremium ? (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenUpgradeVip();
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-amber-900 bg-amber-50/90 hover:bg-amber-100 font-bold transition text-left border-b border-amber-100"
                      >
                        <div className="flex items-center">
                          <Crown className="w-3.5 h-3.5 mr-2 text-amber-600 fill-amber-500" />
                          <span>Upgrade Siap Nikah VIP</span>
                        </div>
                        <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-full font-bold">Rp 45rb</span>
                      </button>
                    ) : (
                      <div className="flex items-center px-4 py-2.5 text-xs text-amber-800 bg-amber-50/70 font-semibold border-b border-amber-100">
                        <Sparkles className="w-3.5 h-3.5 mr-2 text-amber-500 fill-amber-400" />
                        <span>Status: <strong>VIP Seumur Hidup ✨</strong></span>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        if (!isPremium) {
                          onOpenUpgradeVip();
                        } else {
                          onOpenInvite();
                        }
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-rose-700 bg-rose-50/70 hover:bg-rose-100/70 font-semibold transition text-left"
                    >
                      <div className="flex items-center">
                        <Heart className="w-3.5 h-3.5 mr-2 text-rose-500 fill-rose-500" />
                        <span>Undang Pasangan (WhatsApp)</span>
                      </div>
                      {!isPremium && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5 border border-amber-200">
                          <Crown className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> VIP
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenSettings();
                      }}
                      className="w-full flex items-center px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 transition text-left"
                    >
                      <Settings className="w-3.5 h-3.5 mr-2.5 text-stone-500" />
                      <span>Pengaturan Target & Tanggal</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleDownloadExcel();
                      }}
                      className="w-full flex items-center px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 transition text-left sm:hidden"
                    >
                      <Download className="w-3.5 h-3.5 mr-2.5 text-emerald-600" />
                      <span>Unduh Backup Excel</span>
                    </button>

                    {/* Admin Panel Link in Dropdown */}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenAdmin();
                        }}
                        className="w-full flex items-center justify-between px-4 py-2 text-xs text-purple-700 bg-purple-50/70 hover:bg-purple-100/80 font-bold transition text-left"
                      >
                        <div className="flex items-center">
                          <ShieldAlert className="w-3.5 h-3.5 mr-2.5 text-purple-600" />
                          <span>Panel Admin Platform</span>
                        </div>
                        <span className="text-[9px] bg-purple-200 text-purple-900 px-1.5 py-0.2 rounded-full font-bold">Admin</span>
                      </button>
                    )}

                    <div className="border-t border-stone-100 my-1"></div>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition text-left font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-2.5" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
