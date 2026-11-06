import React, { useEffect, useRef } from 'react';
import { Heart, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function LoginView({ onLoginSuccess, isLoading, error }) {
  const googleBtnRef = useRef(null);

  // Initialize Google Sign-In button
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    const interval = setInterval(() => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        clearInterval(interval);

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) {
              onLoginSuccess({ type: 'google', credential: response.credential });
            }
          }
        });

        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: 300,
          locale: 'id'
        });
      }
    }, 200);

    return () => clearInterval(interval);
  }, [onLoginSuccess]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdfbf9] via-[#faf6f0] to-[#f4ece1] flex flex-col justify-between items-center p-4 sm:p-8">
      
      {/* Header Brand */}
      <header className="w-full max-w-5xl flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 p-0.5 shadow-xs flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
            </div>
          </div>
          <div>
            <span className="font-serif font-bold text-2xl tracking-tight text-[#2c2420]">
              Siap Nikah
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="w-full max-w-md my-auto py-8">
        <div className="bg-white/90 backdrop-blur-md border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-stone-200/50 text-center">
          
          <div className="inline-flex p-3 rounded-2xl bg-amber-50 text-amber-700 mb-4 border border-amber-200/60 shadow-xs">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2c2420] mb-2 leading-tight">
            Wujudkan Pernikahan Impian Anda
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm mb-6">
            Kelola tabungan berdua, pos anggaran vendor, seserahan, mahar, hingga daftar tamu dalam satu dashboard rapi.
          </p>

          {/* Google Sign In Container (Full & Wajib Akun Google) */}
          <div className="flex flex-col items-center justify-center min-h-[50px] mb-2">
            <div ref={googleBtnRef} className="flex justify-center"></div>
            
            {isLoading && (
              <p className="text-xs text-stone-500 mt-3 animate-pulse">Menghubungkan akun Google...</p>
            )}
            
            {error && (
              <p className="text-xs text-rose-600 mt-3 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                {error}
              </p>
            )}
          </div>

          <p className="text-[11px] text-stone-400 mt-3 mb-6">
            1-Klik masuk langsung tanpa perlu repot menghafal kata sandi
          </p>

          {/* Value Props Bullet */}
          <div className="pt-6 border-t border-stone-100 text-left space-y-3">
            <div className="flex items-start gap-2.5 text-xs text-stone-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Pencatatan setoran tabungan bersama pria & wanita</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-stone-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Checklist pos vendor resepsi, seserahan & mahar</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-stone-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Daftar buku tamu undangan & estimasi porsi pax</span>
            </div>
          </div>

        </div>

        <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-stone-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Autentikasi resmi & aman via Google Identity Services</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-stone-400 py-3">
        &copy; {new Date().getFullYear()} Siap Nikah. Semua hak dilindungi.
      </footer>

    </div>
  );
}
