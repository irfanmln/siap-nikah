import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  Edit2,
  MapPin,
  User,
  Copy,
  Check
} from 'lucide-react';
import { addRundownItem, updateRundownItem, deleteRundownItem } from '../utils/api';

export default function RundownTab({
  rundown = [],
  metadata,
  activeActor,
  onRefresh,
  isPremium = false,
  onRequireVip
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    timeStart: '08:00',
    timeEnd: '09:00',
    title: '',
    location: '',
    pic: '',
    notes: '',
    sortOrder: 0
  });

  const sortedRundown = [...rundown].sort((a, b) => {
    return (a.time_start || '').localeCompare(b.time_start || '');
  });

  const handleOpenAdd = () => {
    if (!isPremium && rundown.length >= 12) {
      if (onRequireVip) {
        onRequireVip('Batas kuota 12 agenda rundown di akun Gratis tercapai. Upgrade ke Siap Nikah VIP untuk susunan rundown hari H tanpa batas!');
      } else {
        alert('Batas kuota rundown tercapai.');
      }
      return;
    }

    setEditingItem(null);
    setFormData({
      timeStart: '08:00',
      timeEnd: '09:00',
      title: '',
      location: '',
      pic: '',
      notes: '',
      sortOrder: sortedRundown.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      timeStart: item.time_start || '08:00',
      timeEnd: item.time_end || '',
      title: item.title || '',
      location: item.location || '',
      pic: item.pic || '',
      notes: item.notes || '',
      sortOrder: item.sort_order || 0
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.timeStart) return;

    try {
      setSubmitting(true);
      if (editingItem) {
        await updateRundownItem(editingItem.id, formData, activeActor);
      } else {
        const res = await addRundownItem(formData, activeActor);
        if (res.error) throw new Error(res.error);
      }
      setIsModalOpen(false);
      if (onRefresh) onRefresh(true);
    } catch (err) {
      alert('Gagal menyimpan agenda: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus sesi agenda rundown ini?')) return;
    try {
      await deleteRundownItem(id, activeActor);
      if (onRefresh) onRefresh(true);
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    }
  };

  // Salin rundown terformat ke clipboard untuk dibagikan ke WhatsApp Keluarga / Panitia
  const handleCopyForWhatsApp = () => {
    const groomName = metadata?.groom || 'Pria';
    const brideName = metadata?.bride || 'Wanita';
    let text = `📋 *SUSUNAN ACARA & RUNDOWN HARI H*\n`;
    text += `*Pernikahan ${groomName} & ${brideName}*\n`;
    text += `Tanggal: ${metadata?.weddingDate || 'Hari H'}\n`;
    text += `--------------------------------------\n\n`;

    sortedRundown.forEach((item, idx) => {
      const timeStr = item.time_end ? `${item.time_start} - ${item.time_end}` : item.time_start;
      text += `⏱️ *${timeStr}*\n`;
      text += `📌 *${item.title}*\n`;
      if (item.location) text += `📍 Lokasi: ${item.location}\n`;
      if (item.pic) text += `👤 PIC: ${item.pic}\n`;
      if (item.notes) text += `💬 Catatan: ${item.notes}\n`;
      text += `\n`;
    });

    text += `_Disusun otomatis melalui Siap Nikah (Wedding Planning Suite)_`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-amber-50 text-amber-600">
                <Clock className="w-5 h-5" />
              </span>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-stone-900">
                Susunan Acara (Rundown Hari H)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Panduan jadwal menit demi menit akad nikah & resepsi untuk panitia, keluarga, dan seluruh vendor.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopyForWhatsApp}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer shadow-2xs"
              title="Salin teks lengkap siap kirim ke grup WhatsApp panitia / keluarga"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin format WhatsApp'}</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-sm shadow-rose-200 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Sesi</span>
            </button>
          </div>
        </div>

        {/* Quota counter for free tier */}
        {!isPremium && (
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Batas Kuota Akun Gratis: {sortedRundown.length}/12 Agenda</span>
            <span className="text-[11px] text-amber-600 font-semibold">Upgrade VIP untuk agenda tanpa batas</span>
          </div>
        )}
      </div>

      {/* 2. Timeline List */}
      <div className="space-y-3">
        {sortedRundown.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 text-stone-400 text-xs sm:text-sm">
            Belum ada jadwal rundown. Klik tombol "Tambah Sesi" untuk memulai susunan acara.
          </div>
        ) : (
          sortedRundown.map((item, idx) => {
            const timeDisplay = item.time_end ? `${item.time_start} - ${item.time_end}` : item.time_start;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-2xs hover:shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                
                {/* Left: Time Badge & Title */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  
                  {/* Time Chip */}
                  <div className="px-3 py-1.5 rounded-xl bg-stone-900 text-white font-mono text-xs font-bold shrink-0 tracking-tight flex items-center gap-1 shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-rose-400" />
                    <span>{timeDisplay}</span>
                  </div>

                  {/* Main Details */}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 mb-1">
                      {item.title}
                    </h3>

                    {/* Metadata tags: Location & PIC */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                      {item.location && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                          <MapPin className="w-3 h-3 text-rose-400" />
                          {item.location}
                        </span>
                      )}
                      {item.pic && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/50 font-medium">
                          <User className="w-3 h-3 text-amber-500" />
                          PIC: {item.pic}
                        </span>
                      )}
                      {item.notes && (
                        <span className="text-stone-400 italic text-[11px] truncate max-w-md">
                          💬 {item.notes}
                        </span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 shrink-0 self-end md:self-center border-t md:border-t-0 pt-2 md:pt-0 w-full md:w-auto justify-end">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                    title="Ubah agenda"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    title="Hapus agenda"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* 3. Modal Tambah / Edit Sesi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-serif font-bold text-lg text-stone-900 mb-1">
              {editingItem ? 'Ubah Agenda Rundown' : 'Tambah Sesi Acara Baru'}
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Atur waktu, kegiatan, lokasi, serta penanggung jawab sesi.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    required
                    value={formData.timeStart}
                    onChange={e => setFormData({ ...formData, timeStart: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={formData.timeEnd}
                    onChange={e => setFormData({ ...formData, timeEnd: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Nama Agenda / Kegiatan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Prosesi Akad Nikah & Ijab Qabul"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Lokasi</label>
                  <input
                    type="text"
                    placeholder="Contoh: Meja Akad / Kamar Rias"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">PIC / Penanggung Jawab</label>
                  <input
                    type="text"
                    placeholder="Contoh: MC, WO, Pak Budi"
                    value={formData.pic}
                    onChange={e => setFormData({ ...formData, pic: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Catatan / Perlengkapan Khusus</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Siapkan mic wireless, musik instrumental syahdu"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-400"
                />
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
                  {submitting ? 'Menyimpan...' : 'Simpan Agenda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}