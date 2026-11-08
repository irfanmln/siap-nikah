import React, { useState, useEffect } from 'react';
import { X, Copy, Check, MessageCircle, Heart, Share2 } from 'lucide-react';

export default function InvitePartnerModal({ isOpen, onClose, weddingId, metadata }) {
  const [copied, setCopied] = useState(false);

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

  const groom = metadata?.groom || 'Pria';
  const bride = metadata?.bride || 'Wanita';

  const inviteUrl = `${window.location.origin}/?join=${weddingId}`;
  const whatsappMessage = encodeURIComponent(
    `Bismillah, yuk kita rencanakan dan kelola budget pernikahan kita bareng di Siap Nikah 💕\n\nBuka link ini ya:\n${inviteUrl}`
  );
  const whatsappUrl = `https://api.whatsapp.com/send?text=${whatsappMessage}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-100 overflow-hidden text-center">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-gradient-to-r from-rose-50 to-amber-50">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h2 className="text-base font-serif font-bold text-stone-900">Undang Pasangan</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-white rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Share2 className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-serif font-bold text-stone-900 mb-1">
            Kelola Pernikahan Berdua
          </h3>
          <p className="text-xs text-stone-600 mb-6 leading-relaxed">
            Kirimkan tautan ini ke calon suami atau calon istri Anda. Begitu pasangan masuk menggunakan akun Google-nya, data pernikahan <strong className="text-stone-800">{groom} & {bride}</strong> akan otomatis tersinkronisasi di kedua perangkat.
          </p>

          {/* Link Box */}
          <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-2.5 flex items-center justify-between gap-2 mb-4">
            <span className="text-xs text-stone-700 truncate select-all pl-1 font-medium">
              {inviteUrl}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-200 hover:bg-stone-300 text-stone-800'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin</span>
                </>
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Kirim Undangan via WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-stone-600 hover:text-stone-900 text-xs font-medium transition cursor-pointer"
            >
              Tutup
            </button>
          </div>

          <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-center gap-1.5 text-xs text-stone-500">
            <span>Kolaborasi otomatis tanpa batas perangkat</span>
          </div>

        </div>

      </div>
    </div>
  );
}
