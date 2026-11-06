import React, { useState } from 'react';
import { Heart, Calendar, DollarSign, Sparkles, CheckCircle2 } from 'lucide-react';
import { getAuthToken } from '../utils/api';

export default function CreateWeddingModal({ user, onWeddingCreated }) {
  const [groomName, setGroomName] = useState('');
  const [brideName, setBrideName] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [targetSavings, setTargetSavings] = useState(50000000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groomName.trim() || !brideName.trim()) {
      setError('Nama mempelai pria dan wanita wajib diisi');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      const res = await fetch('/api/weddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          groomName: groomName.trim(),
          brideName: brideName.trim(),
          weddingDate,
          targetSavings: Number(targetSavings) || 0
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal membuat rencana pernikahan');
      }

      onWeddingCreated(data.wedding);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdfbf9] via-[#faf6f0] to-[#f4ece1] flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-lg bg-white/90 backdrop-blur-md border border-stone-200/80 rounded-3xl p-6 sm:p-10 shadow-2xl text-center">
        
        {/* Welcome Avatar / Icon */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-amber-400 p-0.5 mx-auto mb-4 shadow-md flex items-center justify-center">
          <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500 animate-pulse" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold mb-3 border border-rose-200/60">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Selamat Datang, {user?.name || 'Teman'}!
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
          Mulai Rencana Pernikahan Anda
        </h1>
        <p className="text-stone-500 text-xs sm:text-sm mb-6">
          Isi detail dasar pernikahan Anda. Sistem akan langsung menyiapkan template checklist & pos anggaran otomatis.
        </p>

        {error && (
          <div className="p-3 mb-5 text-xs text-rose-600 bg-rose-50 rounded-xl border border-rose-200 text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          
          {/* Couple Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Mempelai Pria 🤵
              </label>
              <input
                type="text"
                required
                placeholder="Nama Panggilan Pria"
                value={groomName}
                onChange={(e) => setGroomName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Mempelai Wanita 👰
              </label>
              <input
                type="text"
                required
                placeholder="Nama Panggilan Wanita"
                value={brideName}
                onChange={(e) => setBrideName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
              />
            </div>
          </div>

          {/* Wedding Date */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-stone-400" /> Rencana Tanggal Pernikahan
            </label>
            <input
              type="date"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
            />
          </div>

          {/* Target Savings / Budget */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-stone-400" /> Target Tabungan / Total Budget (Rp)
            </label>
            <input
              type="number"
              step="1000000"
              value={targetSavings}
              onChange={(e) => setTargetSavings(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              Bisa diubah kapan saja di menu Pengaturan.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Menyiapkan Rencana...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Buat Rencana Pernikahan ✨</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-center gap-2 text-xs text-stone-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Checklist & pos vendor terisi otomatis</span>
        </div>

      </div>
    </div>
  );
}
