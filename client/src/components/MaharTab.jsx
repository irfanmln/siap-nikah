import React, { useState } from 'react';
import {
  Coins,
  Plus,
  Trash2,
  Edit2,
  X,
  Calculator,
  Gem
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import { addMahar, updateMahar, deleteMahar } from '../utils/api';
import { useModalBack } from '../utils/useModalBack';

export default function MaharTab({
  mahar = [],
  metadata,
  activeActor,
  onRefresh,
  isPremium = false,
  onRequireVip
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useModalBack(isModalOpen, () => setIsModalOpen(false));

  // Dynamic Gold Price Calculator
  const [goldPrice, setGoldPrice] = useState(metadata?.goldPricePerGram || 2700000);
  const [calcGrams, setCalcGrams] = useState(8);

  const [formData, setFormData] = useState({
    category: 'Logam Mulia',
    name: '',
    detail: '',
    weight: '',
    price: '',
    status: 'Rencana',
    notes: ''
  });

  const totalMahar = mahar.reduce((sum, m) => sum + (Number(m.price) || 0), 0);

  const handleOpenAdd = () => {
    if (!isPremium && mahar.length >= 3) {
      if (onRequireVip) {
        onRequireVip('Batas kuota 3 item mahar di akun Gratis tercapai. Upgrade ke VIP seumur hidup untuk rincian mahar tanpa batas!');
      } else {
        alert('Batas kuota 3 item mahar di akun Gratis tercapai.');
      }
      return;
    }

    setEditingItem(null);
    setFormData({
      category: 'Logam Mulia',
      name: '',
      detail: '',
      weight: '',
      price: '',
      status: 'Rencana',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      category: item.category || 'Logam Mulia',
      name: item.name || '',
      detail: item.detail || '',
      weight: item.weight || '',
      price: item.price || '',
      status: item.status || 'Rencana',
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
        targetCost: Number(formData.price) || 0,
        price: Number(formData.price) || 0
      };
      if (editingItem) {
        await updateMahar(editingItem.id, payload, activeActor);
      } else {
        await addMahar(payload, activeActor);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      alert('Gagal menyimpan mahar: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Hapus item mahar "${item.name}"?`)) {
      try {
        await deleteMahar(item.id, activeActor);
        onRefresh();
      } catch (err) {
        alert('Gagal menghapus: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-serif font-bold text-stone-900">Rencana Mahar Pernikahan</h2>
            {!isPremium ? (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
                Kuota Gratis: {mahar.length}/3 Item
              </span>
            ) : (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                VIP: Unlimited Mahar ✨
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Rincian cincin kawin, logam mulia emas murni, uang seri mahar, dan hiasan frame
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-2xl shadow-md transition hover:shadow-lg cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Item Mahar</span>
        </button>
      </div>

      {/* Top Cards: Total Mahar & Live Gold Estimator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total Nilai Mahar */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Nilai Mahar</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-stone-900 mt-3">{formatRupiah(totalMahar)}</div>
          <p className="text-xs text-stone-500 mt-1">
            Terdiri dari {mahar.length} komponen mahar pernikahan
          </p>
        </div>

        {/* Live Gold Calculator Tool */}
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-stone-50 p-5 rounded-3xl border border-amber-200 shadow-xs md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-amber-700" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">Kalkulator Logam Mulia (Emas Antam)</h4>
            </div>
            <span className="text-[11px] bg-amber-200/60 text-amber-900 px-2.5 py-0.5 rounded-full font-semibold">
              Simulasi Dinamis
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-medium text-stone-600">Harga Emas / Gram (Rp)</label>
              <input
                type="number"
                step="50000"
                value={goldPrice}
                onChange={e => setGoldPrice(Number(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-1.5 bg-white border border-amber-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-stone-600">Berat Logam Mulia (Gram)</label>
              <input
                type="number"
                step="0.5"
                value={calcGrams}
                onChange={e => setCalcGrams(Number(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-1.5 bg-white border border-amber-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200 flex flex-col justify-center">
              <span className="text-[10px] text-stone-500 font-semibold uppercase">Estimasi Nilai Emas:</span>
              <span className="text-base font-bold text-amber-800">{formatRupiah(goldPrice * calcGrams)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Mahar Items Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mahar.map((item) => (
          <div
            key={item.id}
            className="p-5 bg-white rounded-3xl border border-stone-200/80 hover:border-amber-300 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
          >
            <div>
              
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                  {item.category || 'Mahar'}
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
                  <p className="text-xs text-stone-500 mt-1">{item.detail}</p>
                )}
                {item.weight && item.weight !== '-' && (
                  <div className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md mt-2">
                    <Gem className="w-3 h-3 mr-1" />
                    Berat: {item.weight}
                  </div>
                )}
              </div>

            </div>

            <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Estimasi Biaya</span>
                <span className="text-lg font-bold text-stone-900">{formatRupiah(item.price)}</span>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl ${
                item.status === 'Selesai'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-stone-100 text-stone-600'
              }`}>
                {item.status || 'Rencana'}
              </span>
            </div>

          </div>
        ))}
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-100 overflow-hidden">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-gradient-to-r from-amber-50 to-rose-50">
              <h3 className="font-serif font-bold text-stone-900 text-lg">
                {editingItem ? 'Edit Item Mahar' : 'Tambah Item Mahar'}
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
                  Kategori Mahar
                </label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="Cincin Couple">Cincin Couple (Emas/Perak)</option>
                  <option value="Logam Mulia">Logam Mulia Emas Murni</option>
                  <option value="Uang Mahar">Uang Seri Mahar</option>
                  <option value="Hias Mahar">Jasa Hias & Bingkai Mahar</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                  Nama Item
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Logam Mulia 8 Gram Antam..."
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                    Berat / Gramasi
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 8 gr / 2.29 gr"
                    value={formData.weight}
                    onChange={e => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="Rencana">Rencana</option>
                    <option value="Sudah Dibeli">Sudah Dibeli</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                  Estimasi Harga / Nilai (Rp)
                </label>
                <input
                  type="number"
                  step="50000"
                  required
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                  Keterangan / Detail
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Untuk Kania, Emas putih kadar 75%..."
                  value={formData.detail}
                  onChange={e => setFormData({ ...formData, detail: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
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
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-xl shadow-sm transition hover:shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : (editingItem ? 'Simpan Perubahan' : 'Tambah Mahar')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
