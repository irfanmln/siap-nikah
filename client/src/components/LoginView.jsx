import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Heart, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function LoginView({ onLoginSuccess, isLoading, error }) {
  const googleBtnRef = useRef(null);
  const [gsiButtonRendered, setGsiButtonRendered] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '477773891287-2o9sf30sf4kuvsboud6r9oouotvumcak.apps.googleusercontent.com';

  // Clear any stale Google cooldown on mount
  useEffect(() => {
    try {
      localStorage.removeItem('g_state');
    } catch (e) {}
  }, []);

  // Initialize Google Sign-In button
  useEffect(() => {
    let checkTimer;
    const interval = setInterval(() => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        clearInterval(interval);

        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            auto_select: false,
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

          checkTimer = setTimeout(() => {
            if (googleBtnRef.current && googleBtnRef.current.children.length > 0) {
              setGsiButtonRendered(true);
            }
          }, 600);
        } catch (e) {
          console.warn('Google renderButton error:', e);
        }
      }
    }, 200);

    return () => {
      clearInterval(interval);
      if (checkTimer) clearTimeout(checkTimer);
    };
  }, [clientId, onLoginSuccess]);

  const handleCustomGoogleLogin = useCallback(() => {
    try {
      localStorage.removeItem('g_state');
    } catch (e) {}

    // Option 1: Try Google OAuth2 Token Client (opens Google popup without FedCM/cooldown)
    if (window.google?.accounts?.oauth2) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: (resp) => {
            if (resp.access_token) {
              onLoginSuccess({ type: 'google_token', accessToken: resp.access_token });
            } else if (resp.error) {
              console.warn('Google token error:', resp);
            }
          }
        });
        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (e) {
        console.warn('initTokenClient failed, falling back:', e);
      }
    }

    // Option 2: Try Google Identity Services One Tap prompt
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
        return;
      } catch (e) {
        console.warn('GIS prompt failed, falling back:', e);
      }
    }

    // Option 3: Full browser redirect to Google OAuth2 (100% foolproof on any mobile browser)
    const redirectUri = window.location.origin;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=email%20profile%20openid&prompt=select_account`;
    window.location.href = authUrl;
  }, [clientId, onLoginSuccess]);

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col justify-between items-center p-4 sm:p-8">
      
      {/* Header Brand */}
      <header className="w-full max-w-5xl flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 p-0.5 shadow-xs flex items-center justify-center">
            <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
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
        <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-xl text-center">
          
          <div className="inline-flex p-3 rounded-2xl bg-rose-50 text-rose-700 mb-4 border border-rose-200/60 shadow-xs">
            <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2c2420] mb-2 leading-tight">
            Wujudkan Pernikahan Impian Anda
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm mb-6">
            Kelola tabungan berdua, pos anggaran vendor, seserahan, mahar, hingga daftar tamu dalam satu dashboard rapi.
          </p>

          {/* Google Sign In Container (Full & Wajib Akun Google) */}
          <div className="flex flex-col items-center justify-center min-h-[50px] mb-2 w-full">
            {/* Official GSI iframe container */}
            <div ref={googleBtnRef} className={`flex justify-center ${gsiButtonRendered ? 'block' : 'hidden'}`}></div>

            {/* Fallback Custom Google Button (Always visible if GSI didn't render or as backup) */}
            {!gsiButtonRendered && (
              <button
                type="button"
                onClick={handleCustomGoogleLogin}
                className="w-full max-w-[300px] flex items-center justify-center gap-3 px-5 py-3 rounded-full border border-stone-300 bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-700 font-semibold text-sm shadow-xs transition cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Lanjutkan dengan Google</span>
              </button>
            )}
            
            {isLoading && (
              <p className="text-xs text-stone-600 mt-3 animate-pulse">Menghubungkan akun Google...</p>
            )}
            
            {error && (
              <p className="text-xs text-rose-600 mt-3 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                {error}
              </p>
            )}
          </div>

          <p className="text-xs text-stone-500 mt-3 mb-6">
            Masuk dengan aman dan instan menggunakan akun Google
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

        <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-stone-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Autentikasi resmi & aman via Google Identity Services</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-stone-500 py-3">
        &copy; 2026 Siap Nikah. Semua hak dilindungi.
      </footer>

    </div>
  );
}
