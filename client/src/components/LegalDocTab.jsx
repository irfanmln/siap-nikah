import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  BookOpen,
  Info,
  Building2,
  Sparkles,
  ExternalLink,
  Edit2
} from 'lucide-react';
import { addLegalDocument, updateLegalDocument, deleteLegalDocument } from '../utils/api';

export default function LegalDocTab({
  legalDocuments = [],
  activeActor,
  onRefresh,
  isPremium = false,
  onRequireVip
}) {
  const [selectedCategory, setSelectedCategory] = useState('kua'); // 'kua' | 'sipil'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    category: 'kua',
    name: '',
    description: '',
    notes: ''
  });

  const docs = legalDocuments.filter(d => d.category === selectedCategory);
  const totalDocs = docs.length;
  const completeDocs = docs.filter(d => d.status === 'Lengkap').length;
  const inProgressDocs = docs.filter(d => d.status === 'Proses').length;
  const percentComplete = totalDocs > 0 ? Math.round((completeDocs / totalDocs) * 100) : 0;

  const handleUpdateStatus = async (item, newStatus) => {
    try {
      await updateLegalDocument(item.id, { status: newStatus }, activeActor);
      if (onRefresh) onRefresh(true);
    } catch (err) {
      alert('Gagal memperbarui status: ' + err.message);
    }
  };

  const handleSaveNotes = async (item, notes) => {
    try {
      await updateLegalDocument(item.id, { notes }, activeActor);
      if (onRefresh) onRefresh(true);
    } catch (err) {
      alert('Gagal menyimpan catatan: ' + err.message);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      category: selectedCategory,
      name: '',
      description: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setSubmitting(true);
      const res = await addLegalDocument(formData, activeActor);
      if (res.error) throw new Error(res.error);
      setIsModalOpen(false);
      if (onRefresh) onRefresh(true);
    } catch (err) {
      alert('Gagal menambah dokumen: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus checklist dokumen ini?')) return;
    try {
      await deleteLegalDocument(id, activeActor);
      if (onRefresh) onRefresh(true);
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Progress Overview */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-blue-50 text-blue-600">
                <Building2 className="w-5 h-5" />
              </span>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-stone-900">
                Panduan & Dokumen Legalitas Nikah
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Checklist resmi persyaratan berkas hukum pernikahan KUA (Muslim) dan Catatan Sipil (Non-Muslim).
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-sm shadow-rose-200 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Berkas</span>
            </button>
          </div>
        </div>

        {/* Progress & Stats Bar */}
        <div className="bg-stone-50/80 rounded-2xl p-4 border border-stone-200/60">
          <div className="flex items-center justify-between text-xs sm:text-sm mb-2 font-medium">
            <span className="text-stone-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Kelengkapan Dokumen: <strong className="text-stone-900">{completeDocs}</strong> dari {totalDocs} berkas siap
              {inProgressDocs > 0 && <span className="text-amber-600 text-xs">({inProgressDocs} sedang diproses)</span>}
            </span>
            <span className="font-bold text-blue-600 font-mono text-sm sm:text-base">
              {percentComplete}%
            </span>
          </div>
          <div className="w-full bg-stone-200/80 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Category Switcher: KUA vs Catatan Sipil */}
      <div className="flex items-center gap-2 bg-stone-100/80 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setSelectedCategory('kua')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            selectedCategory === 'kua'
              ? 'bg-white text-stone-900 shadow-2xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <span>🕌 KUA (Pernikahan Islam)</span>
          <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded-full">
            {legalDocuments.filter(d => d.category === 'kua').length}
          </span>
        </button>

        <button
          onClick={() => setSelectedCategory('sipil')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            selectedCategory === 'sipil'
              ? 'bg-white text-stone-900 shadow-2xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <span>🏛️ Disdukcapil (Non-Muslim)</span>
          <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded-full">
            {legalDocuments.filter(d => d.category === 'sipil').length}
          </span>
        </button>
      </div>

      {/* 3. Official Practical Guide Box */}
      {selectedCategory === 'kua' ? (
        <div className="bg-emerald-50/70 rounded-3xl p-5 border border-emerald-200/70 shadow-2xs text-xs space-y-2 text-emerald-950">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
            <Info className="w-4 h-4 text-emerald-600" />
            <span>Alur & Aturan Resmi Pendaftaran KUA (Simkah Kemenag)</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-emerald-800/90 leading-relaxed pl-1">
            <li><strong>Waktu Pendaftaran:</strong> Paling lambat <strong>10 hari kerja</strong> sebelum akad nikah. Jika kurang dari 10 hari, diperlukan surat dispensasi dari Kantor Kecamatan.</li>
            <li><strong>Biaya Resmi PNBP:</strong> <strong>Rp 0 (Gratis)</strong> jika akad di kantor KUA pada hari & jam kerja (Senin-Jumat 07.30 - 16.00). Biaya resmi <strong>Rp 600.000</strong> disetor via bank/kode billing jika akad di luar kantor KUA (di rumah/gedung) atau di akhir pekan.</li>
            <li><strong>Pemeriksaan Kesehatan:</strong> Lakukan tes kesehatan di Puskesmas untuk mendapatkan <strong>Sertifikat Elsimil (BKKBN)</strong> dan imunisasi TT minimal 1 bulan sebelum hari H.</li>
          </ul>
        </div>
      ) : (
        <div className="bg-blue-50/70 rounded-3xl p-5 border border-blue-200/70 shadow-2xs text-xs space-y-2 text-blue-950">
          <div className="flex items-center gap-2 font-bold text-sm text-blue-900">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Alur Resmi Pencatatan Perkawinan Disdukcapil</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-blue-800/90 leading-relaxed pl-1">
            <li>Pencatatan di Dinas Kependudukan dan Pencatatan Sipil dilakukan <strong>setelah</strong> prosesi pemberkatan/perkawinan sah secara agama (Kristen, Katolik, Hindu, Buddha, Khonghucu).</li>
            <li>Siapkan fotokopi KTP dari 2 orang saksi perkawinan yang telah berusia di atas 21 tahun.</li>
            <li>Setelah pencatatan selesai, kedua mempelai akan diterbitkan <strong>Akta Perkawinan Resmi</strong> dan Kartu Keluarga (KK) baru.</li>
          </ul>
        </div>
      )}

      {/* 4. Document Checklist Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {docs.map(item => {
          const isLengkap = item.status === 'Lengkap';
          const isProses = item.status === 'Proses';

          return (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                isLengkap
                  ? 'bg-emerald-50/30 border-emerald-200/80'
                  : isProses
                  ? 'bg-amber-50/30 border-amber-200/80'
                  : 'bg-white border-stone-200/80'
              } shadow-2xs flex flex-col justify-between gap-3`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 leading-snug">
                    {item.name}
                  </h3>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-stone-300 hover:text-rose-500 p-1 transition cursor-pointer shrink-0"
                    title="Hapus berkas"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {item.description && (
                  <p className="text-xs text-stone-500 leading-relaxed mb-3">
                    {item.description}
                  </p>
                )}

                {/* Status Switcher Buttons */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mr-1">Status:</span>
                  {[
                    { key: 'Belum', label: 'Belum Ada', color: 'bg-stone-100 text-stone-600 border-stone-200' },
                    { key: 'Proses', label: 'Sedang Diurus', color: 'bg-amber-100 text-amber-900 border-amber-300 font-bold' },
                    { key: 'Lengkap', label: 'Lengkap / Siap', color: 'bg-emerald-500 text-white border-emerald-600 font-bold shadow-2xs' }
                  ].map(s => {
                    const isCurrent = (item.status || 'Belum') === s.key;
                    return (
                      <button
                        key={s.key}
                        onClick={() => handleUpdateStatus(item, s.key)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] transition cursor-pointer border ${
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

              {/* Notes Input */}
              <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Catatan berkas (contoh: minta ttd Pak RT)"
                  defaultValue={item.notes || ''}
                  onBlur={e => {
                    if (e.target.value !== item.notes) {
                      handleSaveNotes(item, e.target.value);
                    }
                  }}
                  className="w-full text-xs bg-stone-50/70 hover:bg-stone-50 focus:bg-white px-2.5 py-1.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-blue-400 text-stone-700"
                />
              </div>

            </div>
          );
        })}
      </div>

      {/* 5. Modal Tambah Dokumen */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-serif font-bold text-lg text-stone-900 mb-1">
              Tambah Berkas Legalitas
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Tambahkan persyaratan khusus dari KUA atau Disdukcapil domisili Anda.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Kategori Instansi</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-400 bg-white"
                >
                  <option value="kua">KUA (Muslim)</option>
                  <option value="sipil">Disdukcapil (Non-Muslim)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Nama Berkas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Surat Izin Komandan (TNI/Polri), Surat Wali Hakim"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Keterangan / Persyaratan</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Surat resmi bertanda tangan dari kesatuan"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  placeholder="Contoh: Jadwal pengurusan hari rabu"
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
                  {submitting ? 'Menyimpan...' : 'Simpan Berkas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}