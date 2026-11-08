import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Target, Coins, Heart, Smartphone } from 'lucide-react';
import { updateMetadata } from '../utils/api';

export default function SettingsModal({ metadata, isOpen, onClose, onUpdated, activeActor }) {
  const [formData, setFormData] = useState({
    groom: metadata?.groom || '',
    bride: metadata?.bride || '',
    weddingDate: metadata?.weddingDate || '',
    targetSavings: metadata?.targetSavings || 50000000,
    goldPricePerGram: metadata?.goldPricePerGram || 2700000,
    silverPrice: metadata?.silverPrice || 800000
  });

  const [saving, setSaving] = useState(false);

  // Sync form state when modal opens or metadata updates (Rules of Hooks & resilience)
  useEffect(() => {
    if (isOpen && metadata) {
      setFormData({
        groom: metadata?.groom || '',
        bride: metadata?.bride || '',
        weddingDate: metadata?.weddingDate || '',
        targetSavings: metadata?.targetSavings || 50000000,
        goldPricePerGram: metadata?.goldPricePerGram || 2700000,
        silverPrice: metadata?.silverPrice || 800000
      });
    }
  }, [isOpen, metadata]);

  // Keyboard accessibility: Escape to close modal (R-32)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateMetadata({
        ...formData,
        targetSavings: Number(formData.targetSavings) || 100000000,
        goldPricePerGram: Number(formData.goldPricePerGram) || 2700000,
        silverPrice: Number(formData.silverPrice) || 800000
      }, activeActor);
      if (res.success) {
        onUpdated();
        onClose();
      }
    } catch (err) {
      alert('Gagal menyimpan pengaturan: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-gradient-to-r from-rose-50/60 to-amber-50/60">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h2 className="text-lg font-serif font-bold text-stone-900">Pengaturan Wedding Plan</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                🤵 Nama Pria
              </label>
              <input
                type="text"
                required
                value={formData.groom}
                onChange={e => setFormData({ ...formData, groom: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                👰 Nama Wanita
              </label>
              <input
                type="text"
                required
                value={formData.bride}
                onChange={e => setFormData({ ...formData, bride: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-rose-500" /> Tanggal Pernikahan (Akad & Resepsi)
            </label>
            <input
              type="date"
              required
              value={formData.weddingDate}
              onChange={e => setFormData({ ...formData, weddingDate: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1 flex items-center">
              <Target className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Target Tabungan Bersama (Rp)
            </label>
            <input
              type="number"
              required
              step="500000"
              value={formData.targetSavings}
              onChange={e => setFormData({ ...formData, targetSavings: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 font-semibold"
            />
            <p className="text-[11px] text-stone-500 mt-1">Default target dari spreadsheet: Rp 100.000.000</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1 flex items-center">
                <Coins className="w-3.5 h-3.5 mr-1 text-amber-500" /> Acuan Emas / gr (Rp)
              </label>
              <input
                type="number"
                step="50000"
                value={formData.goldPricePerGram}
                onChange={e => setFormData({ ...formData, goldPricePerGram: e.target.value })}
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1 flex items-center">
                <Coins className="w-3.5 h-3.5 mr-1 text-stone-400" /> Acuan Perak (Rp)
              </label>
              <input
                type="number"
                step="50000"
                value={formData.silverPrice}
                onChange={e => setFormData({ ...formData, silverPrice: e.target.value })}
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>

          {/* Kolaborasi Info */}
          <div className="p-3.5 bg-rose-50/70 border border-rose-200/60 rounded-2xl text-xs text-rose-900 flex items-start space-x-2.5">
            <Smartphone className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Sinkronisasi Cloud Otomatis:</span>
              <p className="text-stone-600 mt-0.5">
                Data Anda tersimpan aman di cloud. Anda dan pasangan bisa mengakses serta mengisi data secara bersamaan dari mana saja via HP atau laptop tanpa batasan lokasi.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-stone-600 hover:text-stone-800 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-1.5 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm rounded-xl shadow-sm transition hover:shadow-md cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
