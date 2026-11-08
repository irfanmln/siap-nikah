import React, { useState } from 'react';
import {
  Mail,
  Plus,
  Trash2,
  Edit2,
  X,
  ExternalLink,
  Package,
  CheckCircle,
  Circle,
  Tag
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import { addUndangan, updateUndangan, deleteUndangan } from '../utils/api';
import { useModalBack } from '../utils/useModalBack';

export default function UndanganSouvenirTab({
  undanganSouvenir = [],
  activeActor,
  onRefresh,
  isPremium = false,
  onRequireVip
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useModalBack(isModalOpen, () => setIsModalOpen(false));

  const [formData, setFormData] = useState({
    type: 'Undangan',
    name: '',
    detail: '',
    quantity: '',
    unitPrice: '',
    link: '',
    checked: false,
    notes: ''
  });

  const totalCost = undanganSouvenir.reduce((sum, u) => sum + (Number(u.totalPrice) || (Number(u.quantity) * Number(u.unitPrice)) || 0), 0);
  const totalUndanganCount = undanganSouvenir
    .filter(u => u.type === 'Undangan' && u.quantity > 1)
    .reduce((sum, u) => sum + (Number(u.quantity) || 0), 0);
  const totalSouvenirCount = undanganSouvenir
    .filter(u => u.type === 'Souvenir')
    .reduce((sum, u) => sum + (Number(u.quantity) || 0), 0);

  const handleToggleChecked = async (item) => {
    try {
      const nextChecked = !item.checked;
      await updateUndangan(item.id, {
        checked: nextChecked,
        status: nextChecked ? 'Lunas' : 'Pending',
        name: item.name,
        targetCost: Number(item.totalPrice ?? item.unitPrice ?? 0),
        unitPrice: Number(item.unitPrice ?? 0),
        quantity: Number(item.quantity ?? 1)
      }, activeActor);
      onRefresh();
    } catch (err) {
      alert('Gagal memperbarui status: ' + err.message);
    }
  };

  const handleOpenAdd = () => {
    if (!isPremium && undanganSouvenir.length >= 6) {
      if (onRequireVip) {
        onRequireVip('Batas kuota 6 item pengadaan di akun Gratis tercapai. Upgrade ke VIP seumur hidup untuk rincian tanpa batas!');
      } else {
        alert('Batas kuota 6 item pengadaan di akun Gratis tercapai.');
      }
      return;
    }

    setEditingItem(null);
    setFormData({
      type: 'Undangan',
      name: '',
      detail: '',
      quantity: '',
      unitPrice: '',
      link: '',
      checked: false,
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      type: item.type || 'Undangan',
      name: item.name || '',
      detail: item.detail || '',
      quantity: item.quantity || '',
      unitPrice: item.unitPrice || '',
      link: item.link || '',
      checked: item.checked || false,
      notes: item.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const q = Number(formData.quantity) || 0;
      const u = Number(formData.unitPrice) || 0;
      const payload = {
        ...formData,
        quantity: q,
        unitPrice: u,
        totalPrice: q * u,
        targetCost: q * u
      };
      if (editingItem) {
        await updateUndangan(editingItem.id, payload, activeActor);
      } else {
        await addUndangan(payload, activeActor);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Hapus item "${item.name}"?`)) {
      try {
        await deleteUndangan(item.id, activeActor);
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
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">Undangan & Souvenir</h2>
            {!isPremium ? (
              <span className="inline-flex items-center text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200 whitespace-nowrap shrink-0">
                Kuota Gratis: {undanganSouvenir.length}/6 Pos
              </span>
            ) : (
              <span className="inline-flex items-center text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 whitespace-nowrap shrink-0">
                VIP: Unlimited Pos ✨
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Perencanaan pengadaan kartu undangan fisik (reguler & VIP), buku tamu, dan souvenir pernikahan
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-2xl shadow-md transition hover:shadow-lg cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Item</span>
        </button>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Anggaran</span>
          <div className="text-2xl font-bold text-stone-900 mt-2">{formatRupiah(totalCost)}</div>
          <p className="text-xs text-stone-500 mt-1">Estimasi biaya cetak & pembelian souvenir</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Undangan Fisik</span>
          <div className="text-2xl font-bold text-rose-600 mt-2">{totalUndanganCount} <span className="text-sm font-normal text-stone-500">lembar</span></div>
          <p className="text-xs text-stone-500 mt-1">Undangan reguler + VIP</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Souvenir</span>
          <div className="text-2xl font-bold text-amber-600 mt-2">{totalSouvenirCount} <span className="text-sm font-normal text-stone-500">buah</span></div>
          <p className="text-xs text-stone-500 mt-1">Souvenir premium + asbak unik</p>
        </div>
      </div>

      {/* Item Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {undanganSouvenir.map((item) => {
          const total = Number(item.totalPrice) || (Number(item.quantity) * Number(item.unitPrice)) || 0;
          return (
            <div
              key={item.id}
              className={`p-5 rounded-3xl border transition flex flex-col justify-between group ${
                item.checked
                  ? 'bg-emerald-50/30 border-emerald-200/80'
                  : 'bg-white border-stone-200/80 hover:border-rose-300 shadow-xs hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl ${
                    item.type === 'Undangan' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-800'
                  }`}>
                    {item.type}
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
                    onClick={() => handleToggleChecked(item)}
                    className="mt-0.5 text-stone-400 hover:text-emerald-600 transition cursor-pointer shrink-0"
                    title={item.checked ? 'Tandai belum siap' : 'Tandai sudah siap'}
                  >
                    {item.checked ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-5 h-5 hover:scale-110 transition" />
                    )}
                  </button>

                  <div className="flex-1">
                    <h4 className="font-serif font-bold text-base text-stone-900">{item.name}</h4>
                    {item.detail && (
                      <p className="text-xs text-stone-500 mt-0.5">{item.detail}</p>
                    )}
                    <div className="text-xs text-stone-600 mt-2 font-medium bg-stone-50 p-2 rounded-xl border border-stone-100">
                      {item.quantity} pcs × {formatRupiah(item.unitPrice)}
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Total & Link */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Total Biaya</span>
                  <span className="text-base font-bold text-stone-900">{formatRupiah(total)}</span>
                </div>

                {item.link ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-rose-600 hover:text-rose-700 font-semibold"
                  >
                    <span>Link Toko</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-stone-400 text-[11px]">{item.checked ? '✅ Siap' : 'Belum'}</span>
                )}
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
                {editingItem ? 'Edit Undangan / Souvenir' : 'Tambah Undangan / Souvenir'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                    Tipe
                  </label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    <option value="Undangan">Undangan</option>
                    <option value="Souvenir">Souvenir</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                    Jumlah (Pcs)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="100"
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                  Nama Item
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Undangan Fisik VIP, Souvenir Pouch..."
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                  Harga Satuan (Rp)
                </label>
                <input
                  type="number"
                  step="50"
                  required
                  placeholder="Contoh: 800"
                  value={formData.unitPrice}
                  onChange={e => setFormData({ ...formData, unitPrice: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 font-bold"
                />
                {formData.quantity && formData.unitPrice && (
                  <p className="text-xs text-emerald-600 mt-1 font-semibold">
                    Total Kalkulasi: {formatRupiah(Number(formData.quantity) * Number(formData.unitPrice))}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                  Link Pembelian (Shopee / Tokopedia)
                </label>
                <input
                  type="text"
                  placeholder="https://s.shopee.co.id/..."
                  value={formData.link}
                  onChange={e => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="undChecked"
                  checked={formData.checked}
                  onChange={e => setFormData({ ...formData, checked: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded focus:ring-rose-400"
                />
                <label htmlFor="undChecked" className="text-sm text-stone-700 font-medium cursor-pointer">
                  Item sudah selesai / siap
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
