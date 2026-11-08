import React from 'react';
import {
  Wallet,
  Target,
  TrendingUp,
  Heart,
  Gift,
  CheckCircle2,
  Users,
  Home,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Crown
} from 'lucide-react';
import { formatRupiah, getDaysUntil, formatDate } from '../utils/formatters';

export default function DashboardTab({
  db,
  onSwitchTab,
  onQuickAddTabungan,
  onQuickAddSeserahan,
  onOpenInvite,
  onOpenUpgradeVip
}) {
  const { metadata, tabungan = [], seserahan = [], mahar = [], wedding = [], undanganSouvenir = [], tamuUndangan = [], afterNikah = [], activityLogs = [] } = db || {};

  const isPremium = Boolean(metadata?.isPremium);

  // Financial calculations
  const targetSavings = Number(metadata?.targetSavings) || 100000000;
  const totalSavings = tabungan.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const shortage = Math.max(0, targetSavings - totalSavings);
  const savingsPercent = Math.min(100, Math.round((totalSavings / targetSavings) * 100));

  const groomName = metadata?.groom || 'Pria';
  const brideName = metadata?.bride || 'Wanita';

  // Groom vs Bride contribution
  const irfanSavings = tabungan.filter(t => (t.contributor || '').toLowerCase().includes(groomName.toLowerCase()))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const kaniaSavings = tabungan.filter(t => (t.contributor || '').toLowerCase().includes(brideName.toLowerCase()))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const irfanPercent = totalSavings > 0 ? Math.round((irfanSavings / totalSavings) * 100) : 50;
  const kaniaPercent = totalSavings > 0 ? Math.round((kaniaSavings / totalSavings) * 100) : 50;

  // Expense estimations
  const totalSeserahan = seserahan.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  const boughtSeserahan = seserahan.filter(s => s.purchased)
    .reduce((sum, s) => sum + (Number(s.price) || 0), 0);

  const totalMahar = mahar.reduce((sum, m) => sum + (Number(m.price) || 0), 0);
  const totalWeddingVendors = wedding.reduce((sum, w) => sum + (Number(w.estimatedCost) || 0), 0);
  const dpWeddingVendors = wedding.reduce((sum, w) => sum + (Number(w.dpPaid) || 0), 0);

  const totalUndangan = undanganSouvenir.reduce((sum, u) => sum + (Number(u.totalPrice) || 0), 0);
  const totalAfterNikah = afterNikah.reduce((sum, a) => sum + (Number(a.estimatedPrice) || 0), 0);

  const grandTotalBudget = totalWeddingVendors + totalMahar + totalSeserahan + totalUndangan;

  // Readiness counters
  const seserahanBoughtCount = seserahan.filter(s => s.purchased).length;
  const vendorDealCount = wedding.filter(w => w.status === 'DP' || w.status === 'Lunas' || w.checked).length;
  const tamuCount = tamuUndangan.length;
  const totalPax = tamuUndangan.reduce((sum, t) => sum + (Number(t.pax) || 2), 0);
  const afterNikahCount = afterNikah.filter(a => a.status === 'Sudah Dibeli' || a.status === 'Kado Tamu').length;

  const daysRemaining = getDaysUntil(metadata?.weddingDate);

  return (
    <div className="space-y-6">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-850 to-rose-950 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-stone-200 text-xs font-medium border border-white/10">
              <span>Bismillah Menuju Akad & Resepsi</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              Pernikahan {metadata?.groom || 'Irfan'} & {metadata?.bride || 'Kania'}
            </h2>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya."
            </p>
          </div>

          {/* Countdown & Quick Action */}
          <div className="flex flex-col items-stretch md:items-end space-y-3 w-full md:w-auto shrink-0">
            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 text-center w-full md:w-auto">
              <div className="text-3xl sm:text-4xl font-serif font-bold text-amber-300">
                {daysRemaining > 0 ? daysRemaining : 0}
              </div>
              <div className="text-xs text-stone-200 font-medium uppercase tracking-wider mt-0.5">
                Hari Menuju Hari H 💍
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <button
                onClick={onOpenInvite}
                className="flex-1 md:flex-initial text-center px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {!isPremium ? (
                  <>
                    <Crown className="w-3.5 h-3.5 fill-white text-white" />
                    <span>Undang Pasangan</span>
                    <span className="text-[9px] bg-white/25 px-1.5 py-0.2 rounded-full font-bold">VIP</span>
                  </>
                ) : (
                  <>
                    <span>💍</span>
                    <span>Undang Pasangan</span>
                  </>
                )}
              </button>
              <button
                onClick={onQuickAddTabungan}
                className="flex-1 md:flex-initial text-center px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-xl shadow-md transition cursor-pointer"
              >
                + Setor Tabungan
              </button>
              <button
                onClick={onQuickAddSeserahan}
                className="flex-1 md:flex-initial text-center px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-xl backdrop-blur-md transition cursor-pointer"
              >
                + Seserahan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Non-VIP Highlight Banner */}
      {!isPremium && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-50 via-rose-50 to-amber-50 border border-amber-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-xs shrink-0 mt-0.5">
              <Crown className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-stone-900">Buka Akses Kolaborasi Pasangan & Backup Excel</h3>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">Promo Rp 45.000</span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Hubungkan HP calon pengantin agar bisa isi tabungan bersama secara real-time dan unduh laporan ke spreadsheet Excel kapan saja.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenUpgradeVip}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition hover:shadow-md cursor-pointer shrink-0 text-center"
          >
            Upgrade ke VIP
          </button>
        </div>
      )}

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Tabungan Terkumpul */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Tabungan</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-stone-900">{formatRupiah(totalSavings)}</div>
            <div className="flex items-center justify-between text-xs text-stone-500 mt-2">
              <span>Target: {formatRupiah(targetSavings)}</span>
              <span className="font-semibold text-emerald-600">{savingsPercent}%</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-stone-100 h-2.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${savingsPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Sisa Target Kekurangan */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Sisa Kekurangan</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-700">{formatRupiah(shortage)}</div>
            <p className="text-xs text-stone-500 mt-1">
              {shortage === 0 ? '🎉 Target tercapai penuh!' : `Perlu dikumpulkan berdua untuk mencapai ${formatRupiah(targetSavings)}`}
            </p>
          </div>
        </div>

        {/* Card 3: Total Estimasi Biaya */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Estimasi Biaya Acara</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-stone-900">{formatRupiah(grandTotalBudget)}</div>
            <p className="text-xs text-stone-500 mt-1">
              Vendor, Mahar, Seserahan & Undangan
            </p>
          </div>
        </div>

        {/* Card 4: Kesiapan Item & Vendor */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Seserahan Terbeli</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-stone-900">
              {seserahanBoughtCount} <span className="text-sm font-normal text-stone-500">/ {seserahan.length} item</span>
            </div>
            <div className="flex items-center justify-between text-xs text-stone-500 mt-2">
              <span>Biaya Terbeli: {formatRupiah(boughtSeserahan)}</span>
              <span className="font-semibold text-purple-600">
                {seserahan.length > 0 ? Math.round((seserahanBoughtCount / seserahan.length) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-stone-100 h-2.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-rose-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${seserahan.length > 0 ? (seserahanBoughtCount / seserahan.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Row 2: Kontribusi Tabungan Irfan vs Kania & Alokasi Anggaran */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Kontribusi Tabungan Irfan & Kania */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900">Kontribusi Tabungan Berdua</h3>
              <p className="text-xs text-stone-500">Transparansi setoran tabungan {groomName} & {brideName}</p>
            </div>
            <button
              onClick={() => onSwitchTab('tabungan')}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center cursor-pointer"
            >
              Lihat Riwayat <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          {/* Dual Bars */}
          <div className="space-y-4">
            
            {/* Groom Bar */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/60">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🤵</span>
                  <div>
                    <span className="font-semibold text-sm text-stone-800">{groomName}</span>
                    <span className="text-xs text-stone-400 ml-2">
                      ({tabungan.filter(t => (t.contributor || '').toLowerCase().includes(groomName.toLowerCase())).length} kali setoran)
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-stone-900">{formatRupiah(irfanSavings)}</div>
                  <div className="text-xs text-stone-500">{irfanPercent}% dari total</div>
                </div>
              </div>
              <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                <div className="bg-stone-800 h-full rounded-full transition-all duration-500" style={{ width: `${irfanPercent}%` }} />
              </div>
            </div>

            {/* Bride Bar */}
            <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-200/60">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">👰</span>
                  <div>
                    <span className="font-semibold text-sm text-rose-950">{brideName}</span>
                    <span className="text-xs text-rose-400 ml-2">
                      ({tabungan.filter(t => (t.contributor || '').toLowerCase().includes(brideName.toLowerCase())).length} kali setoran)
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-rose-900">{formatRupiah(kaniaSavings)}</div>
                  <div className="text-xs text-rose-500">{kaniaPercent}% dari total</div>
                </div>
              </div>
              <div className="w-full bg-rose-200 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${kaniaPercent}%` }} />
              </div>
            </div>

          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Total Bersama: <strong className="text-stone-800 font-bold">{formatRupiah(totalSavings)}</strong></span>
            <span>Rasio: <strong className="text-rose-600 font-bold">{irfanPercent}% : {kaniaPercent}%</strong></span>
          </div>
        </div>

        {/* Breakdown Alokasi Anggaran */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900">Rincian Anggaran Kebutuhan</h3>
              <p className="text-xs text-stone-500">Estimasi total biaya per kategori</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
              {formatRupiah(grandTotalBudget)}
            </span>
          </div>

          <div className="space-y-3">
            
            {/* Vendor & Resepsi */}
            <div
              onClick={() => onSwitchTab('wedding')}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-stone-50 transition cursor-pointer border border-transparent hover:border-stone-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
                  🎪
                </div>
                <div>
                  <div className="text-sm font-semibold text-stone-800">Vendor Resepsi & Acara</div>
                  <div className="text-xs text-stone-400">{wedding.length} vendor ({vendorDealCount} deal/DP)</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-stone-900">{formatRupiah(totalWeddingVendors)}</div>
                <div className="text-xs text-emerald-600 font-medium">DP Terbayar: {formatRupiah(dpWeddingVendors)}</div>
              </div>
            </div>

            {/* Mahar */}
            <div
              onClick={() => onSwitchTab('mahar')}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-stone-50 transition cursor-pointer border border-transparent hover:border-stone-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                  💍
                </div>
                <div>
                  <div className="text-sm font-semibold text-stone-800">Mahar Pernikahan</div>
                  <div className="text-xs text-stone-400">Cincin spilla/aulova, LM 8gr, uang seri</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-stone-900">{formatRupiah(totalMahar)}</div>
                <div className="text-xs text-stone-400">{mahar.length} item mahar</div>
              </div>
            </div>

            {/* Seserahan */}
            <div
              onClick={() => onSwitchTab('seserahan')}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-stone-50 transition cursor-pointer border border-transparent hover:border-stone-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                  🎁
                </div>
                <div>
                  <div className="text-sm font-semibold text-stone-800">Seserahan</div>
                  <div className="text-xs text-stone-400">{seserahanBoughtCount} dari {seserahan.length} item terbeli</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-stone-900">{formatRupiah(totalSeserahan)}</div>
                <div className="text-xs text-purple-600">Sisa: {formatRupiah(totalSeserahan - boughtSeserahan)}</div>
              </div>
            </div>

            {/* Undangan & Souvenir */}
            <div
              onClick={() => onSwitchTab('undangan')}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-stone-50 transition cursor-pointer border border-transparent hover:border-stone-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  💌
                </div>
                <div>
                  <div className="text-sm font-semibold text-stone-800">Undangan & Souvenir</div>
                  <div className="text-xs text-stone-400">Fisik (1000 pcs), Digital, Souvenir (400 pcs)</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-stone-900">{formatRupiah(totalUndangan)}</div>
                <div className="text-xs text-stone-400">{undanganSouvenir.length} item</div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Row 3: Wedding Readiness Quick Cards & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Readiness Checklist Quick Access */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Tamu Undangan Card */}
          <div
            onClick={() => onSwitchTab('tamu')}
            className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs hover:shadow-md hover:border-rose-300 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">👥</span>
              <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-rose-500 transition" />
            </div>
            <h4 className="font-serif font-bold text-stone-900 mt-3">Daftar Tamu</h4>
            <p className="text-xs text-stone-500 mt-0.5">Keluarga {groomName}, {brideName} & Rekan</p>
            <div className="mt-3 text-lg font-bold text-stone-900">
              {tamuCount} <span className="text-xs font-normal text-stone-500">undangan ({totalPax} pax)</span>
            </div>
          </div>

          {/* After Nikah Card */}
          <div
            onClick={() => onSwitchTab('afternikah')}
            className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs hover:shadow-md hover:border-rose-300 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🏡</span>
              <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-rose-500 transition" />
            </div>
            <h4 className="font-serif font-bold text-stone-900 mt-3">After Nikah</h4>
            <p className="text-xs text-stone-500 mt-0.5">Perabot & kebutuhan rumah baru</p>
            <div className="mt-3 text-lg font-bold text-stone-900">
              {afterNikahCount} <span className="text-xs font-normal text-stone-500">/ {afterNikah.length} siap</span>
            </div>
          </div>

          {/* Vendors Card */}
          <div
            onClick={() => onSwitchTab('wedding')}
            className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs hover:shadow-md hover:border-rose-300 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🏛️</span>
              <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-rose-500 transition" />
            </div>
            <h4 className="font-serif font-bold text-stone-900 mt-3">Vendor Hari H</h4>
            <p className="text-xs text-stone-500 mt-0.5">Makeup, WO, Foto, KUA, Hiburan</p>
            <div className="mt-3 text-lg font-bold text-stone-900">
              {vendorDealCount} <span className="text-xs font-normal text-stone-500">/ {wedding.length} deal</span>
            </div>
          </div>

        </div>

        {/* Activity Feed */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif font-bold text-base text-stone-900 flex items-center">
              <Clock className="w-4 h-4 mr-1.5 text-rose-500" /> Aktivitas Terakhir
            </h3>
            <span className="text-[11px] text-stone-400">Real-time sync</span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-64 pr-1 text-xs">
            {activityLogs && activityLogs.length > 0 ? (
              activityLogs.slice(0, 6).map((log) => (
                <div key={log.id} className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 flex items-start space-x-2.5">
                  <span className="text-sm shrink-0">
                    {log.user === groomName ? '🤵' : log.user === brideName ? '👰' : '✨'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-800">{log.user}</span>
                      <span className="text-[10px] text-stone-400">
                        {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-stone-600 mt-0.5 truncate">{log.details || log.action}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-stone-400 text-center py-6">Belum ada catatan aktivitas.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
