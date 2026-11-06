import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  User,
  Tag,
  FileText,
  Search,
  X,
  CheckCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { formatRupiah, formatDate } from '../utils/formatters';
import { addTabungan, updateTabungan, deleteTabungan } from '../utils/api';

export default function TabunganTab({
  tabungan = [],
  metadata,
  activeActor,
  onRefresh,
  isPremium = false,
  onRequireVip
}) {
  const [filterPenyetor, setFilterPenyetor] = useState('Semua');
  const [filterKategori, setFilterKategori] = useState('Semua');
  const [searchNotes, setSearchNotes] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const groomName = metadata?.groom || 'Pria';
  const brideName = metadata?.bride || 'Wanita';

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    contributor: activeActor || groomName,
    category: 'Pernikahan',
    amount: '',
    notes: ''
  });

  // Calculate totals
  const targetSavings = Number(metadata?.targetSavings) || 100000000;
  const totalSavings = tabungan.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const shortage = Math.max(0, targetSavings - totalSavings);

  const irfanTotal = tabungan
    .filter(t => (t.contributor || '').toLowerCase().includes(groomName.toLowerCase()))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const kaniaTotal = tabungan
    .filter(t => (t.contributor || '').toLowerCase().includes(brideName.toLowerCase()))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // Sort chronologically to calculate accurate running balance
  const sortedTabungan = [...tabungan].sort((a, b) => new Date(a.date) - new Date(b.date));
  let running = 0;
  const tabunganWithBalance = sortedTabungan.map((item) => {
    running += Number(item.amount) || 0;
    return { ...item, runningBalance: running };
  });

  // Then sort descending for display so newest deposits appear first
  const displayList = [...tabunganWithBalance].reverse().filter(item => {
    if (filterPenyetor !== 'Semua' && item.contributor !== filterPenyetor) return false;
    if (filterKategori !== 'Semua' && item.category !== filterKategori) return false;
    if (searchNotes && !((item.notes || '').toLowerCase().includes(searchNotes.toLowerCase()))) return false;
    return true;
  });

  const handleOpenAdd = () => {
    if (!isPremium && tabungan.length >= 5) {
      if (onRequireVip) {
        onRequireVip('Batas kuota 5 kali setoran di akun Gratis tercapai. Upgrade ke VIP seumur hidup untuk mencatat setoran tabungan tanpa batas!');
      } else {
        alert('Batas kuota 5 kali setoran tabungan di akun Gratis tercapai.');
      }
      return;
    }

    setEditingItem(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      contributor: activeActor || 'Irfan',
      category: 'Pernikahan',
      amount: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      date: item.date || new Date().toISOString().split('T')[0],
      contributor: item.contributor || 'Irfan',
      category: item.category || 'Tabungan',
      amount: item.amount || '',
      notes: item.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        await updateTabungan(editingItem.id, formData, activeActor);
      } else {
        await addTabungan(formData, activeActor);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      alert('Gagal menyimpan setoran: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Hapus catatan setoran Rp ${Number(item.amount).toLocaleString('id-ID')} (${item.contributor})?`)) {
      try {
        await deleteTabungan(item.id, activeActor);
        onRefresh();
      } catch (err) {
        alert('Gagal menghapus: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-serif font-bold text-stone-900">Catatan Tabungan Pernikahan</h2>
            {!isPremium ? (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
                Kuota Gratis: {tabungan.length}/5 Setoran
              </span>
            ) : (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                VIP: Unlimited Setoran ✨
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Pencatatan setoran dari {groomName} & {brideName} menuju target {formatRupiah(targetSavings)}
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-2xl shadow-md transition hover:shadow-lg cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Setoran</span>
        </button>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Bersama */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Terkumpul</span>
          <div className="text-2xl sm:text-3xl font-bold text-stone-900 mt-2">{formatRupiah(totalSavings)}</div>
          <div className="text-xs text-stone-500 mt-2 flex items-center justify-between">
            <span>Target: {formatRupiah(targetSavings)}</span>
            <span className="font-bold text-emerald-600">{Math.round((totalSavings / targetSavings) * 100)}%</span>
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalSavings / targetSavings) * 100)}%` }}
            />
          </div>
        </div>

        {/* Setoran Groom */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Setoran {groomName}</span>
            <span className="text-lg">🤵</span>
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2">{formatRupiah(irfanTotal)}</div>
          <p className="text-xs text-stone-500 mt-1">
            {tabungan.filter(t => (t.contributor || '').toLowerCase().includes(groomName.toLowerCase())).length} kali setoran (
            {totalSavings > 0 ? Math.round((irfanTotal / totalSavings) * 100) : 0}% porsi)
          </p>
        </div>

        {/* Setoran Bride */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Setoran {brideName}</span>
            <span className="text-lg">👰</span>
          </div>
          <div className="text-2xl font-bold text-rose-900 mt-2">{formatRupiah(kaniaTotal)}</div>
          <p className="text-xs text-rose-400 mt-1">
            {tabungan.filter(t => (t.contributor || '').toLowerCase().includes(brideName.toLowerCase())).length} kali setoran (
            {totalSavings > 0 ? Math.round((kaniaTotal / totalSavings) * 100) : 0}% porsi)
          </p>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Penyetor Filter */}
          <div className="flex items-center bg-stone-100 p-1 rounded-2xl text-xs">
            {['Semua', groomName, brideName].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPenyetor(p)}
                className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                  filterPenyetor === p
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {p === groomName ? `🤵 ${groomName}` : p === brideName ? `👰 ${brideName}` : 'Semua Penyetor'}
              </button>
            ))}
          </div>

          {/* Kategori Filter */}
          <div className="flex items-center bg-stone-100 p-1 rounded-2xl text-xs">
            {['Semua', 'Mahar', 'Pernikahan', 'Tabungan'].map((k) => (
              <button
                key={k}
                onClick={() => setFilterKategori(k)}
                className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                  filterKategori === k
                    ? 'bg-rose-500 text-white shadow-xs font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {k}
              </button>
            ))}
          </div>

        </div>

        {/* Search Notes */}
        <div className="relative min-w-[200px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari catatan / keterangan..."
            value={searchNotes}
            onChange={e => setSearchNotes(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>
      </div>

      {/* Table of Deposits */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200/80 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Tanggal</th>
                <th className="py-3.5 px-4">Penyetor</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Jumlah Setoran</th>
                <th className="py-3.5 px-4">Saldo Berjalan</th>
                <th className="py-3.5 px-4">Catatan</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {displayList.length > 0 ? (
                displayList.map((item) => {
                  const isNegative = Number(item.amount) < 0;
                  return (
                    <tr key={item.id} className="hover:bg-stone-50/60 transition group">
                      
                      {/* Tanggal */}
                      <td className="py-3 px-4 sm:px-6 text-stone-700 font-medium whitespace-nowrap">
                        {formatDate(item.date)}
                      </td>

                      {/* Penyetor */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold ${
                          (item.contributor || '').toLowerCase().includes('irfan')
                            ? 'bg-stone-100 text-stone-800 border border-stone-300'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          <span className="mr-1">{(item.contributor || '').toLowerCase().includes('irfan') ? '🤵' : '👰'}</span>
                          {item.contributor}
                        </span>
                      </td>

                      {/* Kategori */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium ${
                          item.category === 'Mahar'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : item.category === 'Pernikahan'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {item.category}
                        </span>
                      </td>

                      {/* Jumlah Setoran */}
                      <td className={`py-3 px-4 font-bold whitespace-nowrap ${isNegative ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {formatRupiah(item.amount)}
                      </td>

                      {/* Saldo Berjalan */}
                      <td className="py-3 px-4 font-semibold text-stone-900 whitespace-nowrap">
                        {formatRupiah(item.runningBalance)}
                      </td>

                      {/* Catatan */}
                      <td className="py-3 px-4 text-stone-500 max-w-xs truncate">
                        {item.notes ? (
                          <span className="inline-block bg-stone-100 px-2 py-0.5 rounded text-stone-700 text-xs">
                            {item.notes}
                          </span>
                        ) : (
                          <span className="text-stone-300">-</span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1 opacity-70 group-hover:opacity-100 transition">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">
                    Tidak ada catatan setoran yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-100 overflow-hidden">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-gradient-to-r from-rose-50 to-amber-50">
              <h3 className="font-serif font-bold text-stone-900 text-lg">
                {editingItem ? 'Edit Setoran Tabungan' : 'Tambah Setoran Tabungan'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                    Penyetor
                  </label>
                  <select
                    value={formData.contributor}
                    onChange={e => setFormData({ ...formData, contributor: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 font-semibold"
                  >
                    <option value={groomName}>🤵 {groomName}</option>
                    <option value={brideName}>👰 {brideName}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    <option value="Pernikahan">Pernikahan</option>
                    <option value="Mahar">Mahar</option>
                    <option value="Tabungan">Tabungan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                  Jumlah Setoran (Rp)
                </label>
                <input
                  type="number"
                  required
                  step="50000"
                  placeholder="Contoh: 2000000 (Gunakan tanda minus untuk penarikan)"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 font-bold text-stone-900"
                />
                <p className="text-[11px] text-stone-400 mt-1">Masukkan nominal positif untuk setoran, negatif untuk penarikan.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                  Catatan / Keterangan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Gaji bulan ini, Dari Kak Uvi, Sisa saham..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-stone-600 hover:text-stone-800 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl shadow-sm transition hover:shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : (editingItem ? 'Simpan Perubahan' : 'Tambah Setoran')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
