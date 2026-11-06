import React from 'react';
import { X, Crown, CheckCircle2, Sparkles, ShieldCheck, ArrowRight, QrCode } from 'lucide-react';

export default function UpgradeVipModal({
  isOpen,
  onClose,
  onProceedPayment,
  mayarPaymentUrl,
  isPremium = false,
  onToggleVipTest,
  featureMessage
}) {
  if (!isOpen) return null;

  const handlePayClick = () => {
    if (mayarPaymentUrl) {
      window.open(mayarPaymentUrl, '_blank');
    } else if (onProceedPayment) {
      onProceedPayment();
    } else {
      alert('Tautan pembayaran Mayar akan segera aktif saat peluncuran!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-100 overflow-hidden text-center relative max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Hero */}
        <div className="bg-gradient-to-b from-amber-500/15 via-rose-500/10 to-transparent pt-8 pb-4 px-6 text-center">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-white mb-3 shadow-md shadow-amber-500/20">
            <Crown className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold tracking-wide uppercase mb-2 border border-amber-200">
            <Sparkles className="w-3 h-3 text-amber-600" /> Akses Seumur Hidup
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Upgrade ke Siap Nikah VIP
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-sm mx-auto">
            Kelola persiapan pernikahan impian Anda bersama pasangan secara tenang, rapi, dan transparan.
          </p>

          {featureMessage && (
            <div className="mt-3 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-900 text-xs font-semibold inline-flex items-center gap-1.5 animate-bounce">
              <span>🔒</span> {featureMessage}
            </div>
          )}
        </div>

        {/* Price Card */}
        <div className="px-6 pb-2">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50/60 border border-rose-200/60 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[11px] text-stone-400 line-through">Rp 99.000</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">Rp 45.000</span>
                <span className="text-[11px] text-stone-500 font-medium">/ selamanya</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-xs">
              Hemat 55%
            </span>
          </div>
        </div>

        {/* Benefits List (Scrollable if screen small) */}
        <div className="px-6 py-4 overflow-y-auto space-y-3 text-left flex-1">
          <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-stone-50 border border-stone-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">Kelola Daftar Tamu Undangan Tanpa Batas</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Bebas catat ratusan hingga ribuan nama tamu keluarga, sahabat & rekan kantor (Akun gratis dibatasi maks 15 tamu).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-stone-50 border border-stone-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">Pos Vendor, Seserahan & Mahar Unlimited</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Bebas tambah pos vendor katering, dekorasi, busana, foto/video, seserahan & mahar kustom tanpa batasan kuota.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-stone-50 border border-stone-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">Catat Riwayat Tabungan Bersama Rutin</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Rekam seluruh riwayat cicilan setoran tabungan bersama pria & wanita hingga hari H tanpa batas kuota setoran.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-stone-50 border border-stone-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">Kolaborasi Pasangan Real-Time (2 HP)</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Hubungkan HP calon suami & istri. Input tabungan atau centang checklist otomatis tersinkronisasi berdua seketika.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-stone-50 border border-stone-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">Unduh Backup Spreadsheet Excel (.xlsx)</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Ekspor seluruh data anggaran, tabungan, vendor, dan buku tamu ke file Excel rapi kapan saja untuk keluarga atau WO.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-2 border-t border-stone-100 bg-white">
          <button
            onClick={handlePayClick}
            className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-rose-500/25 transition cursor-pointer flex items-center justify-center gap-2 group"
          >
            <span>Beli Akses VIP — Rp 45.000</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </button>

          <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-stone-400">
            <span className="flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5 text-stone-500" /> QRIS Instan
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Garansi Akses Selamanya
            </span>
          </div>

          {/* Simulator Mode Pengujian */}
          {onToggleVipTest && (
            <div className="mt-4 pt-3 border-t border-stone-100 flex flex-col items-center">
              <span className="text-[10px] text-stone-400 font-medium mb-1.5">
                🛠️ <strong>Mode Pengujian:</strong> Uji coba aktivasi VIP seketika
              </span>
              <button
                type="button"
                onClick={onToggleVipTest}
                className="px-3 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition border border-stone-200 cursor-pointer flex items-center gap-1.5"
              >
                <span>{isPremium ? '🔒 Simulasi Jadikan Non-VIP (Kunci Fitur)' : '✨ Simulasi Aktifkan VIP (Buka Semua Fitur)'}</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
