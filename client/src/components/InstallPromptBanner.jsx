import React, { useState, useEffect } from 'react';
import { X, Share, PlusSquare, Smartphone, Check } from 'lucide-react';

export default function InstallPromptBanner({ user }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // 1. Only run if user is logged in
    if (!user) {
      setShowBanner(false);
      return;
    }

    // 2. Check if already running in standalone mode (already installed & opened from home screen)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setInstalled(true);
      return;
    }

    // 3. Check localStorage for permanent install flag or recent dismissal (7 days cooldown)
    if (localStorage.getItem('pwa_installed') === 'true') {
      setInstalled(true);
      return;
    }

    const dismissedAt = localStorage.getItem('pwa_dismissed_at');
    if (dismissedAt) {
      const daysSinceDismiss = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < 7) {
        return; // Still in 7-day cooldown
      }
    }

    // 4. Detect iOS devices (Safari does not fire beforeinstallprompt)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
    setIsIOS(isIosDevice);

    // 5. Capture beforeinstallprompt for Android Chrome / Edge
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show banner after 2.5s delay to avoid jarring user right at login
      setTimeout(() => {
        setShowBanner(true);
      }, 2500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 6. Listen for appinstalled event
    const handleAppInstalled = () => {
      setInstalled(true);
      setShowBanner(false);
      setShowIOSGuide(false);
      localStorage.setItem('pwa_installed', 'true');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // If on iOS and not standalone, show banner with delay
    if (isIosDevice) {
      setTimeout(() => {
        setShowBanner(true);
      }, 2500);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [user]);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem('pwa_installed', 'true');
        setInstalled(true);
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback instructions for browsers that suppressed the prompt
      alert(
        "Untuk memasang Siap Nikah:\n\n1. Ketuk ikon titik tiga (⋮) di pojok kanan atas browser\n2. Pilih 'Pasang aplikasi' atau 'Tambahkan ke Layar Utama'"
      );
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSGuide(false);
    localStorage.setItem('pwa_dismissed_at', Date.now().toString());
  };

  if (!showBanner || installed) return null;

  return (
    <>
      {/* Floating Bottom Banner */}
      <aside 
        aria-label="Pemasangan Aplikasi"
        className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-40 transition-all duration-300 ease-out transform translate-y-0"
      >
        <div className="bg-[#1e1c1a]/95 backdrop-blur-md text-white rounded-2xl p-3.5 sm:p-4 shadow-2xl border border-stone-700/60 flex items-center justify-between gap-3 animate-fade-in-up">
          
          {/* App Icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shrink-0 shadow-md border border-rose-400/30">
            <span className="text-2xl filter drop-shadow-xs">💍</span>
          </div>

          {/* Text Info */}
          <div className="flex-1 min-w-0 pr-1">
            <h4 className="text-sm font-bold text-white tracking-tight leading-tight truncate">
              Pasang Siap Nikah
            </h4>
            <p className="text-[11px] text-stone-300 leading-snug mt-0.5 line-clamp-2">
              Buka lebih cepat dari layar utama, tanpa bar browser.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              Pasang
            </button>
            <button
              onClick={handleDismiss}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition cursor-pointer"
              title="Tutup pemberitahuan"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </aside>

      {/* iOS Safari Instruction Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-stone-900 shadow-2xl animate-fade-in-up border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-500 flex items-center justify-center text-lg shadow-sm">
                  💍
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900">Pasang di iPhone / iPad</h3>
                  <p className="text-[11px] text-stone-500">Cukup 2 langkah mudah</p>
                </div>
              </div>
              <button 
                onClick={() => setShowIOSGuide(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-stone-700 my-4 bg-stone-50 p-4 rounded-2xl border border-stone-100">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-[11px] shrink-0">1</span>
                <div>
                  Ketuk tombol <span className="font-bold inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white border border-stone-200 rounded text-stone-800"><Share className="w-3 h-3 text-blue-500 inline" /> Bagikan (Share)</span> di bilah bawah browser Safari.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-[11px] shrink-0">2</span>
                <div>
                  Gulir ke bawah dan ketuk opsi <span className="font-bold inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white border border-stone-200 rounded text-stone-800"><PlusSquare className="w-3 h-3 text-stone-700 inline" /> Tambah ke Layar Utama</span>.
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowIOSGuide(false);
                setShowBanner(false);
                localStorage.setItem('pwa_dismissed_at', Date.now().toString());
              }}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer"
            >
              Mengerti, Terima Kasih
            </button>
          </div>
        </div>
      )}
    </>
  );
}
