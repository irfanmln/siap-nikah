import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  X,
  CheckCircle,
  Circle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatRupiah } from '../utils/formatters';
import { addAfterNikah, updateAfterNikah, deleteAfterNikah } from '../utils/api';
import { useModalBack } from '../utils/useModalBack';

export default function AfterNikahTab({
  afterNikah = [],
  activeActor,
  onRefresh,
  isPremium = false,
  onRequireVip
}) {
  const [filterPriority, setFilterPriority] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useModalBack(isModalOpen, () => setIsModalOpen(false));

  const [formData, setFormData] = useState({
    name: '',
    estimatedPrice: '',
    priority: 'Tinggi',
    status: 'Belum Ada',
    notes: ''
  });

  const totalCost = afterNikah.reduce((sum, a) => sum + (Number(a.estimatedPrice) || 0), 0);
  const acquiredItems = afterNikah.filter(a => a.status === 'Sudah Dibeli' || a.status === 'Kado Tamu');
  const acquiredCost = acquiredItems.reduce((sum, a) => sum + (Number(a.estimatedPrice) || 0), 0);
  const remainingCost = totalCost - acquiredCost;

  const filteredItems = afterNikah.filter(item => {
    if (filterPriority !== 'Semua' && item.priority !== filterPriority) return false;
    if (filterStatus === 'Sudah' && (item.status === 'Belum Ada')) return false;
    if (filterStatus === 'Belum' && (item.status !== 'Belum Ada')) return false;
    return true;
  });

  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === 'Belum Ada' ? 'Sudah Dibeli' : 'Belum Ada';
    if (nextStatus === 'Sudah Dibeli') {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }
    try {
      await updateAfterNikah(item.id, {
        status: nextStatus,
        name: item.name,
        targetCost: Number(item.estimatedPrice ?? 0),
        estimatedPrice: Number(item.estimatedPrice ?? 0)
      }, activeActor);
      onRefresh();
    } catch (err) {
      alert('Gagal update status: ' + err.message);
    }
  };

  const handleOpenAdd = () => {
    if (!isPremium && afterNikah.length >= 5) {
      if (onRequireVip) {
        onRequireVip('Batas kuota 5 barang wishlist di akun Gratis tercapai. Upgrade ke VIP seumur hidup untuk wishlist tanpa batas!');
      } else {
        alert('Batas kuota 5 barang wishlist di akun Gratis tercapai.');
      }
      return;
    }

    setEditingItem(null);
    setFormData({
      name: '',
      estimatedPrice: '',
      priority: 'Tinggi',
      status: 'Belum Ada',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      estimatedPrice: item.estimatedPrice || '',
      priority: item.priority || 'Tinggi',
      status: item.status || 'Belum Ada',
      notes: item.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        targetCost: Number(formData.estimatedPrice) || 0
      };
      if (editingItem) {
        await updateAfterNikah(editingItem.id, payload, activeActor);
      } else {
        await addAfterNikah(payload, activeActor);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      alert('Gagal menyimpan barang: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Hapus barang "${item.name}"?`)) {
      try {
        await deleteAfterNikah(item.id, activeActor);
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
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">After Nikah: Rumah Tangga Baru</h2>
            {!isPremium ? (
              <span className="inline-flex items-center text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200 whitespace-nowrap shrink-0">
                Kuota Gratis: {afterNikah.length}/5 Barang
              </span>
            ) : (
              <span className="inline-flex items-center text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 whitespace-nowrap shrink-0">
                VIP: Unlimited Barang ✨
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Daftar perlengkapan & perabot rumah baru (kasur, kulkas, mesin cuci, kompor, megicom, dll)
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-2xl shadow-md transition hover:shadow-lg cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Barang Wishlist</span>
        </button>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Kesiapan Perabot</span>
          <div className="text-2xl font-bold text-stone-900 mt-2">
            {acquiredItems.length} <span className="text-sm font-normal text-stone-500">/ {afterNikah.length} barang siap</span>
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${afterNikah.length > 0 ? (acquiredItems.length / afterNikah.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Estimasi Total Budget</span>
          <div className="text-2xl font-bold text-stone-900 mt-2">{formatRupiah(totalCost)}</div>
          <p className="text-xs text-stone-500 mt-1">Estimasi biaya perlengkapan rumah baru</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Sisa Kebutuhan Biaya</span>
          <div className="text-2xl font-bold text-rose-600 mt-2">{formatRupiah(remainingCost)}</div>
          <p className="text-xs text-stone-500 mt-1">Bisa dibeli bertahap atau dari hadiah kado</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        
        {/* Priority Filter */}
        <div className="flex items-center space-x-1 bg-stone-100 p-1 rounded-2xl text-xs">
          {['Semua', 'Tinggi', 'Sedang', 'Rendah'].map(p => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                filterPriority === p
                  ? 'bg-stone-900 text-white shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {p === 'Semua' ? 'Semua Prioritas' : `Prioritas ${p}`}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-1 bg-stone-100 p-1 rounded-2xl text-xs">
          {['Semua', 'Belum', 'Sudah'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                filterStatus === s
                  ? 'bg-rose-500 text-white shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {s === 'Semua' ? 'Semua Status' : s === 'Sudah' ? 'Sudah Ada / Kado' : 'Belum Ada'}
            </button>
          ))}
        </div>

      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => {
          const isAcquired = item.status === 'Sudah Dibeli' || item.status === 'Kado Tamu';
          return (
            <div
              key={item.id}
              className={`p-5 rounded-3xl border transition flex flex-col justify-between group ${
                isAcquired
                  ? 'bg-emerald-50/30 border-emerald-200/80'
                  : 'bg-white border-stone-200/80 hover:border-rose-300 shadow-xs hover:shadow-md'
              }`}
            >
              <div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-xl ${
                    item.priority === 'Tinggi'
                      ? 'bg-rose-100 text-rose-800'
                      : item.priority === 'Sedang'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-stone-100 text-stone-600'
                  }`}>
                    Prioritas {item.priority || 'Tinggi'}
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

                <div className="flex items-start space-x-3 mt-3">
                  <button
                    onClick={() => handleToggleStatus(item)}
                    className="mt-0.5 text-stone-400 hover:text-emerald-600 transition cursor-pointer shrink-0"
                    title={isAcquired ? 'Tandai belum ada' : 'Tandai sudah ada'}
                  >
                    {isAcquired ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-5 h-5 hover:scale-110 transition" />
                    )}
                  </button>

                  <div className="flex-1">
                    <h4 className={`font-serif font-bold text-base transition ${
                      isAcquired ? 'text-stone-500 line-through' : 'text-stone-900'
                    }`}>
                      {item.name}
                    </h4>
                    {item.notes && (
                      <p className="text-xs text-stone-500 mt-1">{item.notes}</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Bottom Price & Status */}
              <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Estimasi</span>
                  <span className="text-base font-bold text-stone-900">{formatRupiah(item.estimatedPrice)}</span>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl ${
                  item.status === 'Sudah Dibeli'
                    ? 'bg-emerald-100 text-emerald-800'
                    : item.status === 'Kado Tamu'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-stone-100 text-stone-500'
                }`}>
                  {item.status || 'Belum Ada'}
                </span>
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
                {editingItem ? 'Edit Barang Rumah Tangga' : 'Tambah Wishlist Perabot'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Tutup dialog"
                className="p-1 text-stone-400 hover:text-stone-700 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                  Nama Barang
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kulkas 2 Pintu, Kasur Springbed Queen..."
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                    Prioritas
                  </label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    <option value="Tinggi">Tinggi (Primer)</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Rendah">Rendah (Tersier)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    <option value="Belum Ada">Belum Ada</option>
                    <option value="Sudah Dibeli">Sudah Dibeli</option>
                    <option value="Kado Tamu">Hadiah Kado Tamu</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                  Estimasi Harga (Rp)
                </label>
                <input
                  type="number"
                  step="50000"
                  placeholder="Contoh: 2500000"
                  value={formData.estimatedPrice}
                  onChange={e => setFormData({ ...formData, estimatedPrice: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                  Keterangan / Merk / Ukuran
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Ukuran 160x200, Inverter hemat listrik..."
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
                  {submitting ? 'Menyimpan...' : (editingItem ? 'Simpan Perubahan' : 'Tambah Barang')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
