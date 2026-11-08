import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Clock,
  User,
  ChevronRight,
  Filter,
  Check
} from 'lucide-react';
import { addTimelineItem, updateTimelineItem, deleteTimelineItem } from '../utils/api';
import { useModalBack } from '../utils/useModalBack';

const PHASES = [
  'Semua',
  'H-12 Bulan',
  'H-6 Bulan',
  'H-3 Bulan',
  'H-1 Bulan',
  'H-2 Minggu',
  'H-1 Minggu',
  'Hari H'
];

const ASSIGNED_OPTIONS = ['Bersama', 'Pria', 'Wanita', 'Keluarga', 'WO'];

export default function TimelineTab({
  timeline = [],
  metadata,
  activeActor,
  onRefresh,
  isPremium = false,
  onRequireVip
}) {
  const [selectedPhase, setSelectedPhase] = useState('Semua');
  const [selectedAssignee, setSelectedAssignee] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useModalBack(isModalOpen, () => setIsModalOpen(false));

  const [formData, setFormData] = useState({
    phase: 'H-1 Bulan',
    title: '',
    assignedTo: 'Bersama',
    dueDate: '',
    notes: ''
  });

  const totalTasks = timeline.length;
  const completedTasks = timeline.filter(t => t.completed).length;
  const percentComplete = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filter items
  const filteredTimeline = timeline.filter(item => {
    const matchPhase = selectedPhase === 'Semua' || item.phase === selectedPhase;
    const matchAssignee = selectedAssignee === 'Semua' || (item.assigned_to || 'Bersama') === selectedAssignee;
    return matchPhase && matchAssignee;
  });

  // Group items by phase for structured display
  const phasesToDisplay = selectedPhase === 'Semua' 
    ? PHASES.filter(p => p !== 'Semua') 
    : [selectedPhase];

  const handleToggle = async (item) => {
    try {
      await updateTimelineItem(item.id, { completed: !item.completed }, activeActor);
      if (onRefresh) onRefresh(true);
    } catch (err) {
      alert('Gagal memperbarui status tugas: ' + err.message);
    }
  };

  const handleOpenAdd = () => {
    if (!isPremium && timeline.length >= 35) {
      if (onRequireVip) {
        onRequireVip('Batas kuota checklist di akun Gratis tercapai. Upgrade ke Siap Nikah VIP untuk menambah tugas kustom tanpa batas!');
      } else {
        alert('Batas kuota tugas kustom tercapai.');
      }
      return;
    }

    setFormData({
      phase: selectedPhase === 'Semua' ? 'H-1 Bulan' : selectedPhase,
      title: '',
      assignedTo: 'Bersama',
      dueDate: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setSubmitting(true);
      const res = await addTimelineItem(formData, activeActor);
      if (res.error) throw new Error(res.error);
      setIsModalOpen(false);
      if (onRefresh) onRefresh(true);
    } catch (err) {
      alert('Gagal menambah tugas: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Hapus tugas checklist ini?')) return;
    try {
      await deleteTimelineItem(id, activeActor);
      if (onRefresh) onRefresh(true);
    } catch (err) {
      alert('Gagal menghapus tugas: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Progress Overview */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-rose-50 text-rose-500">
                <Calendar className="w-5 h-5" />
              </span>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-stone-900">
                Timeline & Checklist Persiapan
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Panduan lengkap langkah demi langkah mulai dari H-12 Bulan hingga Hari Bahagia Anda.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-sm shadow-rose-200 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tugas</span>
            </button>
          </div>
        </div>

        {/* Progress Bar Card */}
        <div className="bg-stone-50/80 rounded-2xl p-4 border border-stone-200/60">
          <div className="flex items-center justify-between text-xs sm:text-sm mb-2 font-medium">
            <span className="text-stone-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Progres Persiapan: <strong className="text-stone-900">{completedTasks}</strong> dari {totalTasks} tugas selesai
            </span>
            <span className="font-bold text-rose-600 font-mono text-sm sm:text-base">
              {percentComplete}%
            </span>
          </div>
          <div className="w-full bg-stone-200/80 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-rose-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Filters Bar */}
      <div className="bg-white rounded-2xl p-3 border border-stone-200/70 shadow-2xs space-y-2.5">
        
        {/* Phase Filter (Horizontal Scroll) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-2 shrink-0">Waktu:</span>
          {PHASES.map(phase => {
            const isActive = selectedPhase === phase;
            const count = phase === 'Semua' 
              ? timeline.length 
              : timeline.filter(t => t.phase === phase).length;

            return (
              <button
                key={phase}
                onClick={() => setSelectedPhase(phase)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-2xs'
                    : 'bg-stone-100/80 text-stone-600 hover:bg-stone-200/60'
                }`}
              >
                <span>{phase}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-white/25 text-white' : 'bg-stone-200 text-stone-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Assignee Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-stone-100 scrollbar-thin">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-2 shrink-0">PIC:</span>
          {['Semua', ...ASSIGNED_OPTIONS].map(assignee => {
            const isActive = selectedAssignee === assignee;
            return (
              <button
                key={assignee}
                onClick={() => setSelectedAssignee(assignee)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-stone-900 text-white font-bold'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
                }`}
              >
                {assignee}
              </button>
            );
          })}
        </div>

      </div>

      {/* 3. Timeline Items Grouped by Phase */}
      <div className="space-y-6">
        {phasesToDisplay.map(phase => {
          const itemsInPhase = filteredTimeline.filter(t => t.phase === phase);
          if (itemsInPhase.length === 0 && selectedPhase !== 'Semua') {
            return (
              <div key={phase} className="bg-white rounded-3xl p-8 text-center border border-stone-200 text-stone-400 text-xs">
                Belum ada checklist untuk tahapan {phase}.
              </div>
            );
          }
          if (itemsInPhase.length === 0) return null;

          const completedInPhase = itemsInPhase.filter(t => t.completed).length;

          return (
            <div key={phase} className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-2xs">
              
              {/* Phase Header */}
              <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900">
                    {phase}
                  </h3>
                </div>
                <span className="text-xs font-semibold text-stone-400 bg-stone-100 px-2.5 py-1 rounded-full">
                  {completedInPhase} / {itemsInPhase.length} Selesai
                </span>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2">
                {itemsInPhase.map(item => {
                  const isDone = Boolean(item.completed);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggle(item)}
                      className={`group flex items-start justify-between p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isDone
                          ? 'bg-stone-50/60 border-stone-200/60 opacity-80'
                          : 'bg-white hover:bg-rose-50/20 border-stone-200 hover:border-rose-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1 mr-2">
                        {/* Custom Animated Checkbox */}
                        <button
                          type="button"
                          className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center transition shrink-0 ${
                            isDone
                              ? 'bg-emerald-500 text-white shadow-2xs shadow-emerald-200'
                              : 'border-2 border-stone-300 hover:border-rose-400 bg-white'
                          }`}
                        >
                          {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <div className="min-w-0 flex-1">
                          <p className={`text-xs sm:text-sm font-semibold transition ${
                            isDone ? 'line-through text-stone-400' : 'text-stone-800'
                          }`}>
                            {item.title}
                          </p>

                          {/* Meta tags: Assigned & Due date & Notes */}
                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-stone-400">
                            {item.assigned_to && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium">
                                <User className="w-3 h-3 text-stone-400" />
                                {item.assigned_to}
                              </span>
                            )}
                            {item.due_date && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60 font-medium">
                                <Clock className="w-3 h-3 text-amber-500" />
                                Target: {item.due_date}
                              </span>
                            )}
                            {item.notes && (
                              <span className="text-stone-400 italic truncate max-w-xs">
                                💬 {item.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Delete Action Button */}
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-stone-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer shrink-0"
                        title="Hapus checklist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

      {/* 4. Modal Tambah Tugas */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-serif font-bold text-lg text-stone-900 mb-1">
              Tambah Tugas Checklist
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Tambahkan agenda persiapan khusus sesuai kebutuhan pernikahan Anda.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Tahapan Waktu</label>
                <select
                  value={formData.phase}
                  onChange={e => setFormData({ ...formData, phase: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-400 bg-white"
                >
                  {PHASES.filter(p => p !== 'Semua').map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Nama Tugas / Agenda</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pesan mobil pengantin, Fitting final"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Penanggung Jawab (PIC)</label>
                  <select
                    value={formData.assignedTo}
                    onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-400 bg-white"
                  >
                    {ASSIGNED_OPTIONS.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Target Tanggal (Opsional)</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Catatan Tambahan (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Vendor Rekomendasi tante / budget max 3jt"
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
                  {submitting ? 'Menyimpan...' : 'Simpan Tugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}