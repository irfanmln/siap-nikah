import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  X,
  Search,
  Filter,
  CheckCircle,
  Share2,
  MessageCircle,
  UserCheck
} from 'lucide-react';
import { addTamu, updateTamu, deleteTamu } from '../utils/api';

export default function TamuTab({
  tamuUndangan = [],
  metadata,
  activeActor,
  onRefresh,
  isPremium = false,
  onRequireVip
}) {
  const groom = metadata?.groom || 'Pria';
  const bride = metadata?.bride || 'Wanita';

  const RELATIONSHIPS = [
    `Keluarga ${groom}`,
    `Teman ${groom}`,
    `Rekan Kantor ${groom}`,
    `Keluarga ${bride}`,
    `Teman ${bride}`,
    `Rekan Kantor ${bride}`,
    'Tetangga / Tokoh',
    'Lain-lain'
  ];

  const [filterRel, setFilterRel] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    relationship: `Keluarga ${groom}`,
    category: 'Reguler',
    pax: 2,
    statusKirim: 'Belum Dikirim',
    konfirmasi: 'Belum Konfirmasi',
    notes: ''
  });

  const totalPax = tamuUndangan.reduce((sum, t) => sum + (Number(t.pax) || 2), 0);
  const sentCount = tamuUndangan.filter(t => t.statusKirim === 'Terkirim').length;
  const confirmedHadir = tamuUndangan.filter(t => t.konfirmasi === 'Hadir').length;
  const hadirPax = tamuUndangan.filter(t => t.konfirmasi === 'Hadir').reduce((sum, t) => sum + (Number(t.pax) || 2), 0);

  const filteredGuests = tamuUndangan.filter(guest => {
    if (filterRel !== 'Semua' && guest.relationship !== filterRel) return false;
    if (filterStatus === 'Terkirim' && guest.statusKirim !== 'Terkirim') return false;
    if (filterStatus === 'Belum Dikirim' && guest.statusKirim === 'Terkirim') return false;
    if (filterStatus === 'Hadir' && guest.konfirmasi !== 'Hadir') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = (guest.name || '').toLowerCase().includes(q);
      const matchNotes = (guest.notes || '').toLowerCase().includes(q);
      if (!matchName && !matchNotes) return false;
    }
    return true;
  });

  const handleOpenAdd = () => {
    if (!isPremium && tamuUndangan.length >= 15) {
      if (onRequireVip) {
        onRequireVip('Batas kuota 15 tamu di akun Gratis tercapai. Upgrade ke VIP seumur hidup untuk kelola tamu tanpa batas!');
      } else {
        alert('Batas kuota 15 tamu di akun Gratis tercapai. Silakan upgrade ke VIP!');
      }
      return;
    }

    setEditingItem(null);
    setFormData({
      name: '',
      relationship: activeActor === bride ? `Keluarga ${bride}` : `Keluarga ${groom}`,
      category: 'Reguler',
      pax: 2,
      statusKirim: 'Belum Dikirim',
      konfirmasi: 'Belum Konfirmasi',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      relationship: item.relationship || `Keluarga ${groom}`,
      category: item.category || 'Reguler',
      pax: item.pax || 2,
      statusKirim: item.statusKirim || 'Belum Dikirim',
      konfirmasi: item.konfirmasi || 'Belum Konfirmasi',
      notes: item.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        await updateTamu(editingItem.id, formData, activeActor);
      } else {
        await addTamu(formData, activeActor);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      alert('Gagal menyimpan tamu: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Hapus tamu "${item.name}"?`)) {
      try {
        await deleteTamu(item.id, activeActor);
        onRefresh();
      } catch (err) {
        alert('Gagal menghapus: ' + err.message);
      }
    }
  };

  const handleToggleSent = async (item) => {
    const nextStatus = item.statusKirim === 'Terkirim' ? 'Belum Dikirim' : 'Terkirim';
    try {
      await updateTamu(item.id, { statusKirim: nextStatus }, activeActor);
      onRefresh();
    } catch (err) {
      alert('Gagal update status: ' + err.message);
    }
  };

  const handleShareWhatsApp = (item) => {
    const groom = metadata?.groom || 'Irfan';
    const bride = metadata?.bride || 'Kania';
    const text = encodeURIComponent(
      `Assalamu'alaikum Wr. Wb.\n\nKepada Yth. Bpk/Ibu/Saudara/i *${item.name}*,\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Anda untuk menghadiri pernikahan kami:\n*${groom} & ${bride}*\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila berkenan hadir memberikan doa restu.\n\nTerima kasih.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-serif font-bold text-stone-900">Daftar Tamu Undangan</h2>
            {!isPremium ? (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
                Kuota Gratis: {tamuUndangan.length}/15 Tamu
              </span>
            ) : (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                VIP: Unlimited Tamu ✨
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Manajemen daftar tamu keluarga {groom}, keluarga {bride}, sahabat, rekan kerja, dan estimasi porsi pax
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-2xl shadow-md transition hover:shadow-lg cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tamu Undangan</span>
        </button>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Total Undangan</span>
          <div className="text-2xl font-bold text-stone-900 mt-1">{tamuUndangan.length} <span className="text-xs font-normal text-stone-400">nama</span></div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Estimasi Pax (Orang)</span>
          <div className="text-2xl font-bold text-rose-600 mt-1">{totalPax} <span className="text-xs font-normal text-stone-400">porsi</span></div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Undangan Terkirim</span>
          <div className="text-2xl font-bold text-blue-600 mt-1">{sentCount} <span className="text-xs font-normal text-stone-400">terkirim</span></div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Konfirmasi Hadir</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{confirmedHadir} <span className="text-xs font-normal text-stone-400">({hadirPax} pax)</span></div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Relationship filter */}
          <select
            value={filterRel}
            onChange={e => setFilterRel(e.target.value)}
            className="px-3.5 py-1.5 bg-stone-100 border border-stone-200 rounded-2xl text-xs font-medium text-stone-700 focus:outline-none"
          >
            <option value="Semua">Semua Hubungan</option>
            {RELATIONSHIPS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {/* Status filter */}
          <div className="flex items-center bg-stone-100 p-1 rounded-2xl text-xs">
            {['Semua', 'Terkirim', 'Belum Dikirim', 'Hadir'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded-xl font-medium transition cursor-pointer ${
                  filterStatus === s
                    ? 'bg-rose-500 text-white shadow-xs font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama tamu / catatan..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>

      </div>

      {/* Table of Guests */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200/80 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Nama Tamu</th>
                <th className="py-3.5 px-4">Hubungan</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Pax</th>
                <th className="py-3.5 px-4">Status Kirim</th>
                <th className="py-3.5 px-4">Konfirmasi RSVP</th>
                <th className="py-3.5 px-4">Catatan</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredGuests.length > 0 ? (
                filteredGuests.map(guest => (
                  <tr key={guest.id} className="hover:bg-stone-50/60 transition group">
                    <td className="py-3 px-4 sm:px-6 font-semibold text-stone-900">
                      {guest.name}
                    </td>

                    <td className="py-3 px-4 text-stone-600">
                      <span className="inline-block bg-stone-100 px-2.5 py-0.5 rounded-lg text-xs font-medium">
                        {guest.relationship}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-semibold ${
                        guest.category === 'VIP' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {guest.category || 'Reguler'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-stone-800">
                      {guest.pax} orang
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleSent(guest)}
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-medium transition cursor-pointer ${
                          guest.statusKirim === 'Terkirim'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                        }`}
                        title="Klik untuk mengubah status kirim"
                      >
                        <span>{guest.statusKirim === 'Terkirim' ? '✉️ Terkirim' : '⏳ Belum'}</span>
                      </button>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-medium ${
                        guest.konfirmasi === 'Hadir'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold'
                          : guest.konfirmasi === 'Tidak Hadir'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-stone-100 text-stone-500'
                      }`}>
                        {guest.konfirmasi || 'Belum'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-stone-400 text-xs max-w-xs truncate">
                      {guest.notes || '-'}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1 opacity-70 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleShareWhatsApp(guest)}
                          className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                          title="Buka template WhatsApp undangan"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(guest)}
                          className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(guest)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">
                    Tidak ada tamu yang cocok dengan pencarian / filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-100 overflow-hidden">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-gradient-to-r from-rose-50 to-amber-50">
              <h3 className="font-serif font-bold text-stone-900 text-lg">
                {editingItem ? 'Edit Tamu Undangan' : 'Tambah Tamu Undangan'}
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
                  Nama Tamu / Keluarga
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bpk. Ahmad & Keluarga, Teman Kuliah..."
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                    Hubungan / Pihak
                  </label>
                  <select
                    value={formData.relationship}
                    onChange={e => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    {RELATIONSHIPS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                    Kategori Tamu
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    <option value="Reguler">Reguler</option>
                    <option value="VIP">VIP</option>
                    <option value="VVIP">VVIP</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                    Estimasi Pax (Orang)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formData.pax}
                    onChange={e => setFormData({ ...formData, pax: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                    Status Kirim
                  </label>
                  <select
                    value={formData.statusKirim}
                    onChange={e => setFormData({ ...formData, statusKirim: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    <option value="Belum Dikirim">Belum Dikirim</option>
                    <option value="Terkirim">Terkirim</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                  Konfirmasi Kehadiran (RSVP)
                </label>
                <select
                  value={formData.konfirmasi}
                  onChange={e => setFormData({ ...formData, konfirmasi: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  <option value="Belum Konfirmasi">Belum Konfirmasi</option>
                  <option value="Hadir">Pasti Hadir</option>
                  <option value="Ragu-ragu">Ragu-ragu</option>
                  <option value="Tidak Hadir">Tidak Hadir</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                  Catatan / Alamat (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Keluarga paman di Bandung, kirim fisik/digital..."
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
                  {submitting ? 'Menyimpan...' : (editingItem ? 'Simpan Perubahan' : 'Tambah Tamu')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
