import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  X,
  CheckCircle,
  Clock,
  DollarSign,
  Phone,
  FileText
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import { addWedding, updateWedding, deleteWedding } from '../utils/api';

export default function WeddingTab({
  wedding = [],
  activeActor,
  onRefresh,
  isPremium = false,
  onRequireVip
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    category: 'Paket Resepsi & Dekor',
    name: '',
    detail: '',
    estimatedCost: '',
    dpPaid: '',
    notes: '',
    status: 'Belum',
    checked: false
  });

  const totalCost = wedding.reduce((sum, w) => sum + (Number(w.estimatedCost) || 0), 0);
  const totalDp = wedding.reduce((sum, w) => sum + (Number(w.dpPaid) || 0), 0);
  const remainingCost = totalCost - totalDp;
  const dealCount = wedding.filter(w => w.status === 'DP' || w.status === 'Lunas' || w.checked).length;

  const handleOpenAdd = () => {
    if (!isPremium && wedding.length >= 7) {
      if (onRequireVip) {
        onRequireVip('Batas kuota 7 pos vendor awal di akun Gratis tercapai. Upgrade ke VIP seumur hidup untuk menambah vendor kustom tanpa batas!');
      } else {
        alert('Batas kuota 7 pos vendor di akun Gratis tercapai.');
      }
      return;
    }

    setEditingItem(null);
    setFormData({
      category: 'Paket Resepsi & Dekor',
      name: '',
      detail: '',
      estimatedCost: '',
      dpPaid: '',
      notes: '',
      status: 'Belum',
      checked: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      category: item.category || 'Vendor',
      name: item.name || '',
      detail: item.detail || '',
      estimatedCost: item.estimatedCost || '',
      dpPaid: item.dpPaid || '',
      notes: item.notes || '',
      status: item.status || 'Belum',
      checked: item.checked || false
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        await updateWedding(editingItem.id, formData, activeActor);
      } else {
        await addWedding(formData, activeActor);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      alert('Gagal menyimpan vendor: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Hapus vendor/item "${item.name}"?`)) {
      try {
        await deleteWedding(item.id, activeActor);
        onRefresh();
      } catch (err) {
        alert('Gagal menghapus: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-serif font-bold text-stone-900">Vendor Resepsi & Kebutuhan Acara</h2>
            {!isPremium ? (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
                Kuota Gratis: {wedding.length}/7 Pos
              </span>
            ) : (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                VIP: Unlimited Pos ✨
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Daftar paket rias & dekorasi, WO, fotografer, katering, tenda, hiburan, dan legalitas KUA
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-2xl shadow-md transition hover:shadow-lg cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Vendor / Kebutuhan</span>
        </button>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Biaya Vendor */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Estimasi Vendor</span>
          <div className="text-2xl font-bold text-stone-900 mt-2">{formatRupiah(totalCost)}</div>
          <p className="text-xs text-stone-500 mt-1">
            {dealCount} dari {wedding.length} vendor sudah deal / DP
          </p>
        </div>

        {/* DP Terbayar */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">DP Sudah Dibayar</span>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{formatRupiah(totalDp)}</div>
          <div className="w-full bg-stone-100 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${totalCost > 0 ? Math.min(100, (totalDp / totalCost) * 100) : 0}%` }}
            />
          </div>
        </div>

        {/* Sisa Pelunasan */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Sisa Pelunasan Vendor</span>
          <div className="text-2xl font-bold text-stone-900 mt-2">{formatRupiah(remainingCost)}</div>
          <p className="text-xs text-stone-500 mt-1">Harus dilunasi menjelang atau di hari H</p>
        </div>

      </div>

      {/* Vendor List / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wedding.map((item) => {
          const cost = Number(item.estimatedCost) || 0;
          const dp = Number(item.dpPaid) || 0;
          const remaining = cost - dp;

          return (
            <div
              key={item.id}
              className={`p-5 rounded-3xl border transition flex flex-col justify-between group ${
                item.status === 'Lunas'
                  ? 'bg-emerald-50/30 border-emerald-200/80'
                  : item.status === 'DP'
                  ? 'bg-amber-50/30 border-amber-200/80'
                  : 'bg-white border-stone-200/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-stone-100 text-stone-700">
                    {item.category || 'Vendor'}
                  </span>
                  
                  <div className="flex items-center space-x-1 opacity-70 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <h4 className="font-serif font-bold text-base text-stone-900">{item.name}</h4>
                  {item.detail && (
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">{item.detail}</p>
                  )}
                  {item.notes && (
                    <div className="mt-2 text-xs bg-stone-50 p-2 rounded-xl text-stone-600 border border-stone-100">
                      💡 {item.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Cost Breakdown */}
              <div className="mt-5 pt-3 border-t border-stone-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-400">Total Biaya:</span>
                  <span className="font-bold text-stone-900">{formatRupiah(cost)}</span>
                </div>
                {dp > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-600">DP Terbayar:</span>
                    <span className="font-semibold text-emerald-600">{formatRupiah(dp)}</span>
                  </div>
                )}
                {remaining > 0 && dp > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">Sisa Pelunasan:</span>
                    <span className="font-semibold text-rose-600">{formatRupiah(remaining)}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between">
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                    item.status === 'Lunas'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.status === 'DP'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-stone-100 text-stone-500'
                  }`}>
                    {item.status === 'Lunas' ? '✅ Lunas' : item.status === 'DP' ? '⏳ Sudah DP' : '⚪ Belum Deal'}
                  </span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-100 overflow-hidden">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-gradient-to-r from-rose-50 to-amber-50">
              <h3 className="font-serif font-bold text-stone-900 text-lg">
                {editingItem ? 'Edit Vendor / Acara' : 'Tambah Vendor / Acara'}
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
                  Kategori
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Paket Resepsi, WO, Fotografer, Katering..."
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                  Nama Vendor / Layanan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Paket Rumah 2 (Iionk), Developphotto..."
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                  Rincian Fasilitas / Detail
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Makeup, Attire, Dekorasi, MC, Lengser..."
                  value={formData.detail}
                  onChange={e => setFormData({ ...formData, detail: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                    Estimasi Biaya (Rp)
                  </label>
                  <input
                    type="number"
                    step="50000"
                    placeholder="0"
                    value={formData.estimatedCost}
                    onChange={e => setFormData({ ...formData, estimatedCost: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                    DP Dibayar (Rp)
                  </label>
                  <input
                    type="number"
                    step="50000"
                    placeholder="0"
                    value={formData.dpPaid}
                    onChange={e => setFormData({ ...formData, dpPaid: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                    Status Kerjasama
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    <option value="Belum">Belum Deal</option>
                    <option value="DP">Sudah DP</option>
                    <option value="Lunas">Lunas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                    Catatan / PIC
                  </label>
                  <input
                    type="text"
                    placeholder="dp 2 juta, nomor wa..."
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
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
                  {submitting ? 'Menyimpan...' : (editingItem ? 'Simpan Perubahan' : 'Tambah Vendor')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
