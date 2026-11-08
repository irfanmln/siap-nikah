import React, { useState } from 'react';
import {
  Gift,
  Plus,
  ExternalLink,
  CheckCircle,
  Circle,
  Search,
  Filter,
  Trash2,
  Edit2,
  X,
  ShoppingBag,
  Sparkles,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatRupiah } from '../utils/formatters';
import { addSeserahan, updateSeserahan, deleteSeserahan } from '../utils/api';
import { useModalBack } from '../utils/useModalBack';

const DEFAULT_CATEGORIES = [
  'Pakaian',
  'Pakaian dalam',
  'Sepatu/heels',
  'Tas',
  'Skincare',
  'Makeup',
  'Perlengkapan Mandi',
  'Perlengkapan Tidur',
  'Parfum',
  'Snack & buah-buahan',
  'Box Seserahan',
  'Hias mahar',
  'Alat shalat',
  'Lain-lain'
];

export default function SeserahanTab({
  seserahan = [],
  metadata,
  activeActor,
  onRefresh,
  isPremium = false,
  onRequireVip
}) {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua'); // 'Semua' | 'Belum' | 'Sudah'
  const [searchQuery, setSearchQuery] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useModalBack(isModalOpen, () => setIsModalOpen(false));

  const [formData, setFormData] = useState({
    category: 'Pakaian',
    name: '',
    price: '',
    link: '',
    purchased: false,
    notes: ''
  });

  // Unique categories in dataset
  const categoriesInDb = Array.from(new Set(seserahan.map(s => s.category || 'Lain-lain')));
  const allCategories = ['Semua', ...Array.from(new Set([...DEFAULT_CATEGORIES, ...categoriesInDb]))];

  // Budget calculations
  const totalBudget = seserahan.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  const boughtItems = seserahan.filter(s => s.purchased);
  const boughtTotal = boughtItems.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  const remainingTotal = totalBudget - boughtTotal;
  const progressPercent = totalBudget > 0 ? Math.round((boughtTotal / totalBudget) * 100) : 0;

  // Filter items
  const filteredItems = seserahan.filter(item => {
    if (selectedCategory !== 'Semua' && (item.category || '').trim() !== selectedCategory) return false;
    if (selectedStatus === 'Sudah' && !item.purchased) return false;
    if (selectedStatus === 'Belum' && item.purchased) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = (item.name || '').toLowerCase().includes(q);
      const matchCat = (item.category || '').toLowerCase().includes(q);
      const matchNotes = (item.notes || '').toLowerCase().includes(q);
      if (!matchName && !matchCat && !matchNotes) return false;
    }
    return true;
  });

  const handleTogglePurchased = async (item) => {
    const nextPurchased = !item.purchased;
    if (nextPurchased) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
    try {
      await updateSeserahan(item.id, {
        ...item,
        purchased: nextPurchased,
        purchasedBy: nextPurchased ? activeActor : null,
        targetCost: Number(item.price) || 0,
        price: Number(item.price) || 0,
        status: nextPurchased ? 'Lunas' : 'Pending'
      }, activeActor);
      onRefresh();
    } catch (err) {
      alert('Gagal memperbarui status: ' + err.message);
    }
  };

  const handleOpenAdd = () => {
    if (!isPremium && seserahan.length >= 12) {
      if (onRequireVip) {
        onRequireVip('Batas kuota 12 item seserahan di akun Gratis tercapai. Upgrade ke VIP seumur hidup untuk checklist seserahan tanpa batas!');
      } else {
        alert('Batas kuota 12 item seserahan di akun Gratis tercapai.');
      }
      return;
    }

    setEditingItem(null);
    setFormData({
      category: selectedCategory !== 'Semua' ? selectedCategory : 'Pakaian',
      name: '',
      price: '',
      link: '',
      purchased: false,
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      category: item.category || 'Pakaian',
      name: item.name || '',
      price: item.price || '',
      link: item.link || '',
      purchased: item.purchased || false,
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
        price: Number(formData.price) || 0,
        vendorContact: formData.link || '',
        status: formData.purchased ? 'Lunas' : 'Pending'
      };
      if (editingItem) {
        await updateSeserahan(editingItem.id, payload, activeActor);
      } else {
        await addSeserahan(payload, activeActor);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      alert('Gagal menyimpan seserahan: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Hapus item "${item.name}" dari seserahan?`)) {
      try {
        await deleteSeserahan(item.id, activeActor);
        onRefresh();
      } catch (err) {
        alert('Gagal menghapus: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">Daftar Kebutuhan Seserahan</h2>
            {!isPremium ? (
              <span className="inline-flex items-center text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200 whitespace-nowrap shrink-0">
                Kuota Gratis: {seserahan.length}/12 Item
              </span>
            ) : (
              <span className="inline-flex items-center text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 whitespace-nowrap shrink-0">
                VIP: Unlimited Seserahan ✨
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Daftar belanja seserahan dari {metadata?.groom || 'Pria'} untuk {metadata?.bride || 'Wanita'} dengan link Shopee / Tokopedia
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-2xl shadow-md transition hover:shadow-lg cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Item Seserahan</span>
        </button>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Item & Terbeli */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Progress Pembelian</span>
          <div className="text-2xl font-bold text-stone-900 mt-2">
            {boughtItems.length} <span className="text-sm font-normal text-stone-500">/ {seserahan.length} item terbeli</span>
          </div>
          <div className="flex items-center justify-between text-xs text-stone-500 mt-2">
            <span>Progress: {progressPercent}%</span>
            <span className="font-semibold text-purple-600">{seserahan.length - boughtItems.length} belum</span>
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-rose-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Total Anggaran */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Anggaran Seserahan</span>
          <div className="text-2xl font-bold text-stone-900 mt-2">{formatRupiah(totalBudget)}</div>
          <p className="text-xs text-stone-500 mt-1">Estimasi biaya seluruh isi seserahan</p>
        </div>

        {/* Sudah Dibeli vs Sisa */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Status Biaya</span>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{formatRupiah(boughtTotal)}</div>
          <p className="text-xs text-stone-500 mt-1">
            Sisa yang belum dibeli: <strong className="text-rose-600">{formatRupiah(remainingTotal)}</strong>
          </p>
        </div>

      </div>

      {/* Filter and Category Pills */}
      <div className="space-y-3">
        
        {/* Top Controls: Search & Status Filter */}
        <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Status filter buttons */}
          <div className="flex items-center bg-stone-100 p-1 rounded-2xl text-xs">
            {[
              { id: 'Semua', label: 'Semua Item' },
              { id: 'Belum', label: `Belum Beli (${seserahan.length - boughtItems.length})` },
              { id: 'Sudah', label: `Sudah Terbeli (${boughtItems.length})` }
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedStatus(s.id)}
                className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                  selectedStatus === s.id
                    ? 'bg-rose-500 text-white shadow-xs font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari item, merk, atau kategori..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

        </div>

        {/* Category Pills (horizontal scroll) */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
          {allCategories.map(cat => {
            const count = cat === 'Semua'
              ? seserahan.length
              : seserahan.filter(s => (s.category || '').trim() === cat).length;
            if (cat !== 'Semua' && count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-medium whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
                  selectedCategory === cat
                    ? 'bg-stone-900 text-white shadow-xs font-semibold'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                <span>{cat}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Seserahan Item Cards / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <div
              key={item.id}
              className={`p-4 rounded-3xl border transition-all duration-200 relative group flex flex-col justify-between ${
                item.purchased
                  ? 'bg-rose-50/40 border-rose-200/80 shadow-2xs'
                  : 'bg-white border-stone-200/80 hover:border-stone-300 shadow-xs hover:shadow-sm'
              }`}
            >
              <div>
                
                {/* Top Category Badge & Actions */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-stone-100 text-stone-600 border border-stone-200/60">
                    {item.category || 'Seserahan'}
                  </span>
                  
                  <div className="flex items-center space-x-1 opacity-70 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg cursor-pointer"
                      title="Edit item"
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

                {/* Item Name & Checkbox */}
                <div className="flex items-start space-x-3 mt-3">
                  <button
                    onClick={() => handleTogglePurchased(item)}
                    className="mt-0.5 text-stone-400 hover:text-rose-600 transition cursor-pointer shrink-0"
                    title={item.purchased ? 'Tandai belum dibeli' : 'Tandai sudah dibeli'}
                  >
                    {item.purchased ? (
                      <CheckCircle className="w-5 h-5 text-rose-500 fill-rose-100" />
                    ) : (
                      <Circle className="w-5 h-5 hover:scale-110 transition" />
                    )}
                  </button>

                  <div className="flex-1">
                    <h4 className={`text-sm font-semibold transition ${
                      item.purchased ? 'text-stone-500 line-through' : 'text-stone-900'
                    }`}>
                      {item.name}
                    </h4>
                    <div className="text-base font-bold text-stone-900 mt-1">
                      {formatRupiah(item.price)}
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Details: Link & Purchased By */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                
                {/* Link button */}
                {item.link ? (
                  item.link.startsWith('http') ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-rose-600 hover:text-rose-700 font-medium hover:underline"
                    >
                      <span>Buka Toko</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-stone-500 font-medium bg-stone-100 px-2 py-0.5 rounded-lg text-[11px]">
                      🏪 {item.link}
                    </span>
                  )
                ) : (
                  <span className="text-stone-400 text-[11px]">-</span>
                )}

                {/* Status tag */}
                {item.purchased ? (
                  <span className="inline-flex items-center space-x-1 text-emerald-700 font-medium text-[11px] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                    <CheckCircle className="w-3 h-3" />
                    <span>Terbeli {item.purchasedBy ? `(${item.purchasedBy})` : ''}</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-stone-400">Belum dibeli</span>
                )}

              </div>

            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-stone-200/80">
            <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-2" />
            <p className="text-stone-500 text-sm">Tidak ada item seserahan yang cocok dengan filter.</p>
          </div>
        )}
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-100 overflow-hidden">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-gradient-to-r from-rose-50 to-amber-50">
              <h3 className="font-serif font-bold text-stone-900 text-lg">
                {editingItem ? 'Edit Item Seserahan' : 'Tambah Item Seserahan'}
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
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  {DEFAULT_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                  Nama / Detail Barang
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dress kondangan couple, Parfum Miniso..."
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                  Estimasi Harga (Rp)
                </label>
                <input
                  type="number"
                  step="5000"
                  placeholder="Contoh: 250000"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                  Link Pembelian (Shopee / Tokopedia / "Offline")
                </label>
                <input
                  type="text"
                  placeholder="https://s.shopee.co.id/... atau Offline"
                  value={formData.link}
                  onChange={e => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="purchasedCheck"
                  checked={formData.purchased}
                  onChange={e => setFormData({ ...formData, purchased: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded focus:ring-rose-400"
                />
                <label htmlFor="purchasedCheck" className="text-sm text-stone-700 font-medium cursor-pointer">
                  Item ini sudah dibeli
                </label>
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
                  {submitting ? 'Menyimpan...' : (editingItem ? 'Simpan Perubahan' : 'Tambah Item')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
