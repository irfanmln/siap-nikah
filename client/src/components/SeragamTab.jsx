import React, { useState } from 'react';
import {
  Scissors,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Clock,
  Shirt,
  Users,
  Sparkles,
  Filter,
  Check
} from 'lucide-react';
import { addSeragamItem, updateSeragamItem, deleteSeragamItem } from '../utils/api';

const ROLE_OPTIONS = [
  'Semua',
  'Keluarga Wanita',
  'Keluarga Pria',
  'Bridesmaid',
  'Groomsmen',
  'Panitia / Among Tamu'
];

export default function SeragamTab({
  seragam = [],
  activeActor,
  onRefresh,
  isPremium = false,
  onRequireVip
}) {
  const [selectedRole, setSelectedRole] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    recipientName: '',
    roleCategory: 'Keluarga Wanita',
    clothType: '',
    sizeOrMeter: '',
    status: 'Belum Diberikan',
    notes: ''
  });

  const totalRecipients = seragam.length;
  const distributedCount = seragam.filter(s => s.status === 'Sudah Diberikan' || s.status === 'Sudah Jahit').length;
  const finishedCount = seragam.filter(s => s.status === 'Sudah Jahit').length;

  const filteredSeragam = seragam.filter(item => {
    if (selectedRole === 'Semua') return true;
    return (item.role_category || '').toLowerCase() === selectedRole.toLowerCase();
  });

  const handleOpenAdd = () => {
    if (!isPremium && seragam.length >= 8) {
      if (onRequireVip) {
        onRequireVip('Batas kuota 8 data seragam di akun Gratis tercapai. Upgrade ke Siap Nikah VIP untuk rekap seragam keluarga & panitia tanpa batas!');
      } else {
        alert('Batas kuota seragam tercapai.');
      }
      return;
    }

    setEditingItem(null);
    setFormData({
      recipientName: '',
      roleCategory: selectedRole === 'Semua' ? 'Keluarga Wanita' : selectedRole,
      clothType: '',
      sizeOrMeter: '2.5 Meter',
      status: 'Belum Diberikan',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      recipientName: item.recipient_name || '',
      roleCategory: item.role_category || 'Keluarga Wanita',
      clothType: item.cloth_type || '',
      sizeOrMeter: item.size_or_meter || '',
      status: item.status || 'Belum Diberikan',
      notes: item.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.recipientName.trim() || !formData.clothType.trim()) return;

    try {
      setSubmitting(true);
      if (editingItem) {
        await updateSeragamItem(editingItem.id, formData, activeActor);
      } else {
        const res = await addSeragamItem(formData, activeActor);
        if (res.error) throw new Error(res.error);
      }
      setIsModalOpen(false);
      if (onRefresh) onRefresh(true);
    } catch (err) {
      alert('Gagal menyimpan seragam: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatus = async (item, newStatus) => {
    try {
      await updateSeragamItem(item.id, { status: newStatus }, activeActor);
      if (onRefresh) onRefresh(true);
    } catch (err) {
      alert('Gagal mengubah status: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus penerima seragam ini?')) return;
    try {
      await deleteSeragamItem(id, activeActor);
      if (onRefresh) onRefresh(true);
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Quick KPI Overview */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-purple-50 text-purple-600">
                <Scissors className="w-5 h-5" />
              </span>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-stone-900">
                Rekap Seragam Keluarga & Panitia
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Catatan pembagian kain kebaya, batik, beskap, dan seragam untuk keluarga inti, bridesmaid, serta panitia.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-sm shadow-rose-200 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Penerima</span>
            </button>
          </div>
        </div>

        {/* KPI Mini Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/60">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total Penerima</span>
            <p className="text-lg sm:text-xl font-bold text-stone-900 mt-0.5">{totalRecipients}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Kain Terbagi</span>
            <p className="text-lg sm:text-xl font-bold text-amber-900 mt-0.5">{distributedCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Sudah Jahit/Jadi</span>
            <p className="text-lg sm:text-xl font-bold text-emerald-900 mt-0.5">{finishedCount}</p>
          </div>
        </div>

        {/* Quota counter for free tier */}
        {!isPremium && (
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Batas Kuota Akun Gratis: {seragam.length}/8 Penerima</span>
            <span className="text-[11px] text-amber-600 font-semibold">Upgrade VIP untuk rekap tanpa batas</span>
          </div>
        )}
      </div>

      {/* 2. Role Filter Tabs */}
      <div className="bg-white rounded-2xl p-2.5 border border-stone-200/70 shadow-2xs flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
        <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-2 shrink-0">Kelompok:</span>
        {ROLE_OPTIONS.map(role => {
          const isActive = selectedRole === role;
          const count = role === 'Semua' 
            ? seragam.length 
            : seragam.filter(s => (s.role_category || '').toLowerCase() === role.toLowerCase()).length;

          return (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-rose-500 text-white shadow-2xs'
                  : 'bg-stone-100/80 text-stone-600 hover:bg-stone-200/60'
              }`}
            >
              <span>{role}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isActive ? 'bg-white/25 text-white' : 'bg-stone-200 text-stone-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Seragam List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredSeragam.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-stone-200 text-stone-400 text-xs sm:text-sm">
            Belum ada data penerima seragam di kelompok ini.
          </div>
        ) : (
          filteredSeragam.map(item => {
            const isDistributed = item.status === 'Sudah Diberikan' || item.status === 'Sudah Jahit';
            const isFinished = item.status === 'Sudah Jahit';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-2xs hover:shadow-xs transition flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900">
                        {item.recipient_name}
                      </h3>
                      <span className="inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded-md font-bold bg-purple-50 text-purple-700 border border-purple-200/50">
                        {item.role_category || 'Keluarga'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                        title="Ubah data"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Hapus data"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Cloth type & Size info */}
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60 mb-2.5 text-xs space-y-1">
                    <p className="text-stone-800 font-semibold flex items-center gap-1.5">
                      <Shirt className="w-3.5 h-3.5 text-stone-400" />
                      <span>{item.cloth_type}</span>
                    </p>
                    {item.size_or_meter && (
                      <p className="text-stone-500 text-[11px] pl-5">
                        Ukuran/Bahan: <strong className="text-stone-700">{item.size_or_meter}</strong>
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-stone-400 italic text-[11px] pl-5">
                        💬 {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Switcher */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Status:</span>
                  <div className="flex items-center gap-1">
                    {[
                      { key: 'Belum Diberikan', label: 'Belum', color: 'bg-stone-100 text-stone-600 border-stone-200' },
                      { key: 'Sudah Diberikan', label: 'Terkirim', color: 'bg-amber-100 text-amber-900 border-amber-300 font-bold' },
                      { key: 'Sudah Jahit', label: 'Sudah Jadi', color: 'bg-emerald-500 text-white border-emerald-600 font-bold shadow-2xs' }
                    ].map(s => {
                      const isCurrent = (item.status || 'Belum Diberikan') === s.key;
                      return (
                        <button
                          key={s.key}
                          onClick={() => handleQuickStatus(item, s.key)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] transition cursor-pointer border ${
                            isCurrent
                              ? s.color
                              : 'bg-white text-stone-400 border-stone-200 hover:text-stone-700'
                          }`}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* 4. Modal Tambah / Edit Seragam */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-serif font-bold text-lg text-stone-900 mb-1">
              {editingItem ? 'Ubah Data Seragam' : 'Tambah Penerima Seragam'}
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Catat nama penerima, jenis kain/busana, dan ukuran meteran bahan.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Nama Penerima</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ibu Kandung Pengantin, Sarah (Bridesmaid)"
                  value={formData.recipientName}
                  onChange={e => setFormData({ ...formData, recipientName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Kelompok Peran</label>
                  <select
                    value={formData.roleCategory}
                    onChange={e => setFormData({ ...formData, roleCategory: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-400 bg-white"
                  >
                    {ROLE_OPTIONS.filter(r => r !== 'Semua').map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Ukuran / Meteran</label>
                  <input
                    type="text"
                    placeholder="Contoh: 2.5 Meter / Ukuran L"
                    value={formData.sizeOrMeter}
                    onChange={e => setFormData({ ...formData, sizeOrMeter: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Jenis Bahan / Seragam</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kain Brokat Sage Green + Furing Satin"
                  value={formData.clothType}
                  onChange={e => setFormData({ ...formData, clothType: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Status Pembagian</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-400 bg-white"
                  >
                    <option value="Belum Diberikan">Belum Diberikan</option>
                    <option value="Sudah Diberikan">Sudah Diberikan</option>
                    <option value="Sudah Jahit">Sudah Jahit / Jadi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Catatan Tambahan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Penjahit Bu Yati"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Seragam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}