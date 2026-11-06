import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Crown,
  Users,
  Wallet,
  Gift,
  Search,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Mail,
  User,
  ExternalLink,
  Sparkles,
  Smartphone,
  AlertCircle
} from 'lucide-react';
import { formatRupiah, formatDate } from '../utils/formatters';

export default function AdminPanel({ onBack, adminUser }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, vip, free
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('nikahplan_token');
      const res = await fetch('/api/admin/weddings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Error ${res.status}: Gagal memuat data admin`);
      }

      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleVip = async (wedding, newVipStatus) => {
    const actionText = newVipStatus ? 'Jadikan VIP' : 'Cabut status VIP';
    const confirmMsg = `Apakah Anda yakin ingin ${actionText} untuk rencana pernikahan "${wedding.groom_name} & ${wedding.bride_name}"?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setActionLoadingId(wedding.id);
      const token = localStorage.getItem('nikahplan_token');
      const res = await fetch('/api/admin/toggle-vip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          weddingId: wedding.id,
          isPremium: newVipStatus
        })
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Gagal mengubah status VIP');
      }

      // Update state local
      setData(prev => {
        if (!prev) return prev;
        const updatedWeddings = prev.weddings.map(w => {
          if (w.id === wedding.id) {
            return { ...w, is_premium: newVipStatus ? 1 : 0 };
          }
          return w;
        });

        const totalVip = updatedWeddings.filter(w => w.is_premium === 1).length;
        const totalFree = updatedWeddings.length - totalVip;
        const totalRevenue = totalVip * 45000;

        return {
          ...prev,
          stats: {
            ...prev.stats,
            totalVip,
            totalFree,
            totalRevenue
          },
          weddings: updatedWeddings
        };
      });

      setToastMessage({
        type: 'success',
        text: `Berhasil! Status "${wedding.groom_name} & ${wedding.bride_name}" kini ${newVipStatus ? '✨ VIP Aktif' : 'Gratis (Freemium)'}.`
      });
      setTimeout(() => setToastMessage(null), 4000);

    } catch (err) {
      alert('Gagal: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter weddings
  const filteredWeddings = (data?.weddings || []).filter(w => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || (
      (w.groom_name || '').toLowerCase().includes(q) ||
      (w.bride_name || '').toLowerCase().includes(q) ||
      (w.owner_name || '').toLowerCase().includes(q) ||
      (w.owner_email || '').toLowerCase().includes(q) ||
      (w.id || '').toLowerCase().includes(q)
    );

    const isVip = w.is_premium === 1;
    let matchFilter = true;
    if (statusFilter === 'vip') matchFilter = isVip;
    if (statusFilter === 'free') matchFilter = !isVip;

    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 pb-12">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-3 duration-200 border border-stone-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-white border-b border-stone-200/80 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Kembali ke Workspace"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Kembali</span>
            </button>
            <div className="h-5 w-px bg-stone-200" />
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-purple-600 text-white shadow-xs">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold font-serif text-stone-900 leading-tight">
                  Panel Administrator
                </h1>
                <p className="text-[10px] text-stone-400">Siap Nikah Platform Manager</p>
              </div>
            </div>
          </div>

          {/* Admin User Info */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-xs font-bold text-stone-800">{adminUser?.name || 'Super Admin'}</span>
              <span className="text-[10px] text-purple-600 font-semibold uppercase tracking-wider">Super Administrator</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-purple-100 border border-purple-200 text-purple-700 font-bold flex items-center justify-center text-xs">
              {adminUser?.name?.charAt(0) || 'A'}
            </div>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Statistics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Card 1: Total Pasangan */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Total Pasangan</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              {data?.stats?.totalWeddings ?? '-'}
            </div>
            <p className="text-[11px] text-stone-500 mt-1">Rencana pernikahan terdaftar</p>
          </div>

          {/* Card 2: Akun VIP */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-amber-200 shadow-xs bg-gradient-to-br from-white to-amber-50/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Akun VIP Aktif</span>
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                <Crown className="w-4 h-4 fill-amber-500" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-900">
              {data?.stats?.totalVip ?? '-'}
            </div>
            <p className="text-[11px] text-amber-700/80 mt-1">Status berbayar seumur hidup</p>
          </div>

          {/* Card 3: Akun Gratis */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Akun Gratis</span>
              <div className="p-2 rounded-xl bg-stone-100 text-stone-600">
                <Gift className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              {data?.stats?.totalFree ?? '-'}
            </div>
            <p className="text-[11px] text-stone-500 mt-1">Prospek upgrade ke VIP</p>
          </div>

          {/* Card 4: Estimasi Omzet */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-emerald-200 shadow-xs bg-gradient-to-br from-white to-emerald-50/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Estimasi Omzet</span>
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-900 truncate">
              {data?.stats ? formatRupiah(data.stats.totalRevenue) : '-'}
            </div>
            <p className="text-[11px] text-emerald-700/80 mt-1">Total revenue dari VIP (Rp 45rb)</p>
          </div>

        </div>

        {/* Action Controls & Table */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
          
          {/* Filter Bar */}
          <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari pengantin, nama pemilik, email, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
              />
            </div>

            {/* Filter Tabs & Refresh */}
            <div className="flex items-center gap-2">
              <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    statusFilter === 'all' ? 'bg-white shadow-2xs text-stone-900' : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Semua ({data?.weddings?.length || 0})
                </button>
                <button
                  onClick={() => setStatusFilter('vip')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                    statusFilter === 'vip' ? 'bg-amber-500 text-white shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Crown className="w-3 h-3 fill-current" />
                  <span>VIP ({data?.stats?.totalVip || 0})</span>
                </button>
                <button
                  onClick={() => setStatusFilter('free')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    statusFilter === 'free' ? 'bg-white shadow-2xs text-stone-900' : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Gratis ({data?.stats?.totalFree || 0})
                </button>
              </div>

              <button
                onClick={fetchAdminData}
                disabled={loading}
                className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition cursor-pointer border border-stone-200"
                title="Segarkan Data"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            {loading && !data ? (
              <div className="py-16 text-center text-stone-400 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-500" />
                <span>Memuat data pengguna dari database...</span>
              </div>
            ) : error ? (
              <div className="py-12 text-center text-rose-500 text-xs px-4">
                <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                <p className="font-semibold">{error}</p>
                <button
                  onClick={fetchAdminData}
                  className="mt-3 px-3 py-1.5 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100"
                >
                  Coba Lagi
                </button>
              </div>
            ) : filteredWeddings.length === 0 ? (
              <div className="py-16 text-center text-stone-400 text-xs">
                <span>Tidak ada data rencana pernikahan yang cocok dengan pencarian.</span>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50/70 border-b border-stone-100 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                    <th className="py-3 px-4 sm:px-6">Pasangan & ID</th>
                    <th className="py-3 px-4">Pemilik Akun</th>
                    <th className="py-3 px-4">Hari H & Anggota</th>
                    <th className="py-3 px-4">Total Tabungan</th>
                    <th className="py-3 px-4">Status VIP</th>
                    <th className="py-3 px-4 sm:px-6 text-right">Aksi Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {filteredWeddings.map((w) => {
                    const isVip = w.is_premium === 1;
                    const isActionLoading = actionLoadingId === w.id;

                    return (
                      <tr key={w.id} className="hover:bg-stone-50/60 transition group">
                        
                        {/* Pasangan & ID */}
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="font-serif font-bold text-sm text-stone-900">
                            {w.groom_name} <span className="text-rose-500 font-sans font-light">&</span> {w.bride_name}
                          </div>
                          <div className="text-[10px] text-stone-400 mt-0.5 font-mono">
                            ID: {w.id}
                          </div>
                        </td>

                        {/* Pemilik Akun */}
                        <td className="py-3.5 px-4">
                          <div className="text-stone-800 font-semibold truncate max-w-[150px]">
                            {w.owner_name || 'Tanpa Nama'}
                          </div>
                          <div className="text-[11px] text-stone-400 truncate max-w-[180px] flex items-center gap-1">
                            <Mail className="w-3 h-3 text-stone-300 shrink-0" />
                            <span>{w.owner_email || '-'}</span>
                          </div>
                        </td>

                        {/* Hari H & Anggota */}
                        <td className="py-3.5 px-4 text-stone-600">
                          <div className="flex items-center gap-1 font-semibold text-stone-700">
                            <Calendar className="w-3 h-3 text-rose-400" />
                            <span>{w.wedding_date ? formatDate(w.wedding_date) : 'Belum diatur'}</span>
                          </div>
                          <div className="text-[10px] text-stone-400 mt-0.5 flex items-center gap-1">
                            <Smartphone className="w-3 h-3 text-stone-300" />
                            <span>{w.member_count || 1} Perangkat Terhubung</span>
                          </div>
                        </td>

                        {/* Total Tabungan */}
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-stone-900">
                            {formatRupiah(w.total_savings || 0)}
                          </span>
                          <div className="text-[10px] text-stone-400 mt-0.5">
                            Target: {formatRupiah(w.target_savings || 0)}
                          </div>
                        </td>

                        {/* Status VIP */}
                        <td className="py-3.5 px-4">
                          {isVip ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200">
                              <Crown className="w-3 h-3 text-amber-600 fill-amber-500" />
                              <span>VIP Aktif</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-[11px] font-semibold">
                              <span>Gratis (Free)</span>
                            </span>
                          )}
                        </td>

                        {/* Aksi Admin: 1-Klik Jadikan VIP / Cabut VIP */}
                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          {isVip ? (
                            <button
                              onClick={() => handleToggleVip(w, false)}
                              disabled={isActionLoading}
                              className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:text-rose-600 hover:bg-rose-50 text-[11px] font-semibold transition cursor-pointer disabled:opacity-50"
                              title="Cabut status VIP kembali ke gratis"
                            >
                              {isActionLoading ? 'Memproses...' : 'Cabut VIP'}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleVip(w, true)}
                              disabled={isActionLoading}
                              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-[11px] font-bold shadow-xs transition hover:shadow-md cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                              title="Aktifkan status VIP untuk pasangan ini"
                            >
                              <Crown className="w-3 h-3 fill-white" />
                              <span>{isActionLoading ? 'Memproses...' : 'Jadikan VIP'}</span>
                            </button>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer Table Info */}
          <div className="p-4 bg-stone-50/60 border-t border-stone-100 text-[11px] text-stone-400 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              Menampilkan {filteredWeddings.length} dari total {data?.weddings?.length || 0} rencana pernikahan
            </span>
            <span className="text-stone-400 italic">
              Klik "Jadikan VIP" untuk langsung membuka semua fitur bagi pasangan terpilih secara instan.
            </span>
          </div>

        </div>

      </main>

    </div>
  );
}
