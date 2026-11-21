import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  X,
  CheckCircle2,
  Circle,
  Luggage,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import { addHoneymoon, updateHoneymoon, deleteHoneymoon } from '../utils/api';
import { useModalBack } from '../utils/useModalBack';

const CATEGORIES = [
  'Semua',
  'Akomodasi',
  'Transportasi',
  'Kuliner',
  'Wisata & Rekreasi',
  'Oleh-oleh'
];

const DEFAULT_PACKING_LIST = [
  { id: 'pack_1', text: 'Buku Nikah Asli / Fotokopi', note: 'Wajib untuk kemudahan check-in hotel/resort' },
  { id: 'pack_2', text: 'KTP Asli Suami & Istri', note: 'Identitas utama perjalanan & reservasi' },
  { id: 'pack_3', text: 'E-Ticket & Bukti Reservasi Hotel', note: 'Simpan offline di HP' },
  { id: 'pack_4', text: 'Pakaian Santai & Baju Ganti Harian', note: 'Sesuaikan cuaca destinasi' },
  { id: 'pack_5', text: 'Outfit Rapi / Dress Romantic Dinner', note: 'Untuk momen makan malam berdua' },
  { id: 'pack_6', text: 'Pakaian Tidur / Piyama Pasangan', note: 'Bahan nyaman & sejuk' },
  { id: 'pack_7', text: 'Set Skincare & Sunscreen / Sunblock', note: 'Melindungi kulit saat aktivitas outdoor' },
  { id: 'pack_8', text: 'Obat Pribadi, Tolak Angin & Minyak Kayu Putih', note: 'P3K dasar antisipasi masuk angin / lelah' },
  { id: 'pack_9', text: 'Charger HP, Kabel & Powerbank', note: 'Pastikan baterai aman selama bepergian' },
  { id: 'pack_10', text: 'Tripod / Tongsis & Kamera', note: 'Abadikan momen romantis pasutri' }
];

export default function HoneymoonTab({
  honeymoon = [],
  activeActor,
  onRefresh,
  isPremium = false,
  onRequireVip,
  activeWeddingId
}) {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPackingList, setShowPackingList] = useState(true);

  // Local state checklist bawaan (tersimpan per workspace)
  const [checkedPacking, setCheckedPacking] = useState(() => {
    try {
      const saved = localStorage.getItem(`honeymoon_packing_${activeWeddingId || 'default'}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`honeymoon_packing_${activeWeddingId || 'default'}`, JSON.stringify(checkedPacking));
    } catch {
      // ignore
    }
  }, [checkedPacking, activeWeddingId]);

  useModalBack(isModalOpen, () => setIsModalOpen(false));

  const [formData, setFormData] = useState({
    category: 'Akomodasi',
    name: '',
    detail: '',
    estimatedCost: '',
    paidAmount: '',
    status: 'Rencana',
    notes: ''
  });

  const totalCost = honeymoon.reduce((sum, h) => sum + (Number(h.estimatedCost) || 0), 0);
  const totalPaid = honeymoon.reduce((sum, h) => sum + (Number(h.paidAmount) || 0), 0);
  const remainingCost = Math.max(0, totalCost - totalPaid);
  const bookedCount = honeymoon.filter(h => h.status === 'Lunas' || h.status === 'Sudah DP').length;

  const filteredItems = selectedCategory === 'Semua'
    ? honeymoon
    : honeymoon.filter(h => (h.category || '').toLowerCase() === selectedCategory.toLowerCase());

  const handleOpenAdd = () => {
    if (!isPremium && honeymoon.length >= 8) {
      if (onRequireVip) {
        onRequireVip('Batas kuota 8 pos bulan madu di akun Gratis tercapai. Upgrade ke VIP seumur hidup untuk rencana liburan tanpa batas!');
      } else {
        alert('Batas kuota 8 pos bulan madu di akun Gratis tercapai.');
      }
      return;
    }

    setEditingItem(null);
    setFormData({
      category: 'Akomodasi',
      name: '',
      detail: '',
      estimatedCost: '',
      paidAmount: '',
      status: 'Rencana',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      category: item.category || 'Akomodasi',
      name: item.name || '',
      detail: item.detail || '',
      estimatedCost: item.estimatedCost || '',
      paidAmount: item.paidAmount || '',
      status: item.status || 'Rencana',
      notes: item.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        category: formData.category,
        name: formData.name.trim(),
        detail: formData.detail.trim(),
        targetCost: Number(formData.estimatedCost) || 0,
        paidAmount: Number(formData.paidAmount) || 0,
        status: formData.status,
        notes: formData.notes.trim()
      };

      if (editingItem) {
        await updateHoneymoon(editingItem.id, payload, activeActor);
      } else {
        await addHoneymoon(payload, activeActor);
      }
      setIsModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Gagal menyimpan pos bulan madu: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Hapus "${item.name}" dari rencana bulan madu?`)) return;
    try {
      await deleteHoneymoon(item.id, activeActor);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    }
  };

  const togglePackingItem = (id) => {
    setCheckedPacking(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const packedCount = DEFAULT_PACKING_LIST.filter(p => checkedPacking[p.id]).length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 leading-tight">
              Bulan Madu (Honeymoon)
            </h2>
            {!isPremium ? (
              <span className="self-start inline-flex items-center text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200 whitespace-nowrap shrink-0">
                Kuota Gratis: {honeymoon.length}/8 Pos
              </span>
            ) : (
              <span className="self-start inline-flex items-center text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 whitespace-nowrap shrink-0">
                VIP: Unlimited Pos ✨
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Rencana transportasi, hotel/resort, makan romantis, wisata, dan oleh-oleh liburan pasutri
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-2xl shadow-md transition hover:shadow-lg cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pos Honeymoon</span>
        </button>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Estimasi Honeymoon */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Estimasi Honeymoon</span>
          <div className="text-2xl font-bold text-stone-900 mt-2">{formatRupiah(totalCost)}</div>
          <p className="text-xs text-stone-500 mt-1">
            {bookedCount} dari {honeymoon.length} pos sudah dipesan / lunas
          </p>
        </div>

        {/* Terbayar / DP */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Sudah Dibayar / DP</span>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{formatRupiah(totalPaid)}</div>
          <div className="w-full bg-stone-100 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${totalCost > 0 ? Math.min(100, (totalPaid / totalCost) * 100) : 0}%` }}
            />
          </div>
        </div>

        {/* Sisa Pelunasan */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Sisa Pembayaran</span>
          <div className="text-2xl font-bold text-stone-900 mt-2">{formatRupiah(remainingCost)}</div>
          <p className="text-xs text-stone-500 mt-1">Estimasi biaya yang masih perlu dilunasi</p>
        </div>

      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 ${
              selectedCategory === cat
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Honeymoon Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const est = Number(item.estimatedCost) || 0;
          const paid = Number(item.paidAmount) || 0;
          const remaining = Math.max(0, est - paid);

          const getCategoryBadgeClass = (category) => {
            switch ((category || '').toLowerCase()) {
              case 'akomodasi':
                return 'bg-indigo-50 text-indigo-700 border-indigo-200/60';
              case 'transportasi':
                return 'bg-sky-50 text-sky-700 border-sky-200/60';
              case 'kuliner':
                return 'bg-amber-50 text-amber-800 border-amber-200/60';
              case 'wisata & rekreasi':
                return 'bg-emerald-50 text-emerald-800 border-emerald-200/60';
              case 'oleh-oleh':
                return 'bg-purple-50 text-purple-700 border-purple-200/60';
              default:
                return 'bg-stone-50 text-stone-700 border-stone-200/60';
            }
          };

          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryBadgeClass(item.category)}`}>
                    {item.category || 'Honeymoon'}
                  </span>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                      title="Edit Pos"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      title="Hapus Pos"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-serif font-bold text-stone-900 text-base mt-2 line-clamp-1">
                  {item.name}
                </h3>

                {item.detail && (
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                    {item.detail}
                  </p>
                )}

                <div className="mt-4 pt-3 border-t border-stone-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">Estimasi Biaya:</span>
                    <span className="font-bold text-stone-900">{formatRupiah(est)}</span>
                  </div>

                  {paid > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-600">Terbayar / DP:</span>
                      <span className="font-semibold text-emerald-600">{formatRupiah(paid)}</span>
                    </div>
                  )}

                  {remaining > 0 && paid > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500">Sisa Pelunasan:</span>
                      <span className="font-semibold text-rose-600">{formatRupiah(remaining)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between">
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                  item.status === 'Lunas'
                    ? 'bg-emerald-100 text-emerald-800'
                    : item.status === 'Sudah DP'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-stone-100 text-stone-500'
                }`}>
                  {item.status === 'Lunas' ? '✅ Lunas' : item.status === 'Sudah DP' ? '⏳ Sudah DP' : '⚪ Rencana'}
                </span>

                {item.notes && (
                  <span className="text-[11px] text-stone-400 italic line-clamp-1 max-w-[150px]">
                    {item.notes}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="bg-white p-8 rounded-3xl border border-stone-200/80 text-center space-y-3">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto text-xl">
            🏖️
          </div>
          <p className="text-stone-600 text-sm font-medium">Belum ada pos di kategori ini</p>
          <button
            onClick={handleOpenAdd}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 underline cursor-pointer"
          >
            + Tambah pos baru sekarang
          </button>
        </div>
      )}

      {/* Interactive Packing List Pasutri */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowPackingList(!showPackingList)}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Luggage className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-stone-900 text-base sm:text-lg">
                  Checklist Bawaan Pasutri (Packing List)
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {packedCount}/{DEFAULT_PACKING_LIST.length} Siap
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Barang penting dan dokumen yang wajib dipersiapkan sebelum berangkat
              </p>
            </div>
          </div>

          <button
            type="button"
            className="p-2 text-stone-400 hover:text-stone-600 rounded-xl transition cursor-pointer"
          >
            {showPackingList ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {showPackingList && (
          <div className="mt-5 pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {DEFAULT_PACKING_LIST.map((item) => {
              const isChecked = !!checkedPacking[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => togglePackingItem(item.id)}
                  className={`flex items-start space-x-3 p-3 rounded-2xl border transition cursor-pointer ${
                    isChecked
                      ? 'bg-emerald-50/50 border-emerald-200 text-stone-700'
                      : 'bg-stone-50/50 hover:bg-stone-50 border-stone-200/60 text-stone-800'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isChecked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-stone-300" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold leading-snug ${isChecked ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                      {item.text}
                    </p>
                    {item.note && (
                      <p className="text-[11px] text-stone-400 mt-0.5">{item.note}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-100 overflow-hidden">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-gradient-to-r from-rose-50 to-amber-50">
              <h3 className="font-serif font-bold text-stone-900 text-lg">
                {editingItem ? 'Edit Pos Honeymoon' : 'Tambah Pos Honeymoon'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-white/80 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Kategori
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                >
                  <option value="Akomodasi">Akomodasi (Hotel / Resort / Villa)</option>
                  <option value="Transportasi">Transportasi (Tiket Pesawat / Sewa Mobil)</option>
                  <option value="Kuliner">Kuliner (Romantic Dinner / Makan Harian)</option>
                  <option value="Wisata & Rekreasi">Wisata & Rekreasi (Tiket Wisata / Spa)</option>
                  <option value="Oleh-oleh">Oleh-oleh & Belanja</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Nama Kebutuhan / Pos *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Hotel Resort 3 Malam di Ubud"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Lokasi / Maskapai / Link Booking (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Traveloka / Tiket.com / Garuda Indonesia"
                  value={formData.detail}
                  onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Estimasi Biaya (Rp)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Sudah Dibayar / DP (Rp)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.paidAmount}
                    onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Status Pemesanan
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                >
                  <option value="Rencana">⚪ Rencana (Belum Dipesan)</option>
                  <option value="Sudah DP">⏳ Sudah DP / Sebagian</option>
                  <option value="Lunas">✅ Lunas / Selesai Booking</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Termasuk sarapan pagi, check in jam 14:00"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-800 text-sm font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl shadow-md transition hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Tambah Pos'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
