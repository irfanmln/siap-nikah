import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Wallet,
  Gift,
  Coins,
  Store,
  Mail,
  Users,
  Home,
  Heart,
  RefreshCw,
  Sparkles,
  Crown
} from 'lucide-react';
import Navbar from './components/Navbar';
import SettingsModal from './components/SettingsModal';
import DashboardTab from './components/DashboardTab';
import TabunganTab from './components/TabunganTab';
import SeserahanTab from './components/SeserahanTab';
import MaharTab from './components/MaharTab';
import WeddingTab from './components/WeddingTab';
import UndanganSouvenirTab from './components/UndanganSouvenirTab';
import TamuTab from './components/TamuTab';
import AfterNikahTab from './components/AfterNikahTab';
import LoginView from './components/LoginView';
import CreateWeddingModal from './components/CreateWeddingModal';
import InvitePartnerModal from './components/InvitePartnerModal';
import UpgradeVipModal from './components/UpgradeVipModal';
import AdminPanel from './components/AdminPanel';
import {
  fetchDb,
  fetchCurrentUserApi,
  loginWithGoogleApi,
  setAuthToken,
  getActiveWeddingId,
  setActiveWeddingId
} from './utils/api';

const TABS = [
  { id: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard },
  { id: 'tabungan', label: 'Tabungan', icon: Wallet },
  { id: 'seserahan', label: 'Seserahan', icon: Gift },
  { id: 'mahar', label: 'Mahar', icon: Coins },
  { id: 'wedding', label: 'Vendor & Resepsi', icon: Store },
  { id: 'undangan', label: 'Undangan & Souvenir', icon: Mail },
  { id: 'tamu', label: 'Daftar Tamu', icon: Users },
  { id: 'afternikah', label: 'After Nikah', icon: Home }
];

export default function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [weddings, setWeddings] = useState([]);
  const [activeWeddingId, setActiveWeddingIdState] = useState(getActiveWeddingId);

  // App data state
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Actor selection
  const [activeActor, setActiveActorState] = useState(() => {
    return localStorage.getItem('wedding_active_actor') || 'Pria';
  });

  const setActiveActor = (actor) => {
    setActiveActorState(actor);
    localStorage.setItem('wedding_active_actor', actor);
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [vipFeaturePrompt, setVipFeaturePrompt] = useState('');

  // Admin access check
  const ADMIN_EMAILS = ['irfanm991@gmail.com', 'halo.weddingplan@gmail.com'];
  const isAdmin = ADMIN_EMAILS.includes(user?.email?.toLowerCase());
  const [isAdminView, setIsAdminView] = useState(() => {
    return window.location.pathname === '/admin' || window.location.search.includes('admin=true');
  });

  const isPremium = Boolean(db?.metadata?.isPremium);

  const handleOpenInvite = () => {
    if (!isPremium) {
      setVipFeaturePrompt('Fitur Kolaborasi Pasangan memerlukan status Siap Nikah VIP');
      setIsVipModalOpen(true);
    } else {
      setIsInviteOpen(true);
    }
  };

  const handleDownloadExcel = () => {
    if (!isPremium) {
      setVipFeaturePrompt('Fitur Unduh Backup Spreadsheet Excel memerlukan status Siap Nikah VIP');
      setIsVipModalOpen(true);
    } else {
      const token = localStorage.getItem('nikahplan_token');
      window.open(`/api/export-excel?wedding_id=${activeWeddingId}&token=${token}`, '_blank');
    }
  };

  const handleToggleVipTest = async () => {
    try {
      const token = localStorage.getItem('nikahplan_token');
      const res = await fetch('/api/test/toggle-vip', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-wedding-id': activeWeddingId
        }
      });
      const data = await res.json();
      if (data.success) {
        await loadData(true);
      }
    } catch (err) {
      alert('Gagal toggle VIP: ' + err.message);
    }
  };

  // Auto-join if user accesses via ?join=wedding_id
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    if (joinCode && user) {
      const token = localStorage.getItem('nikahplan_token');
      fetch('/api/weddings/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: joinCode })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.wedding) {
            setActiveWeddingId(data.wedding.id);
            setActiveWeddingIdState(data.wedding.id);
            setWeddings(prev => [...prev.filter(w => w.id !== data.wedding.id), data.wedding]);
            window.history.replaceState({}, document.title, window.location.pathname);
            alert(`Selamat! Anda berhasil terhubung ke rencana pernikahan ${data.wedding.groom_name} & ${data.wedding.bride_name} 💕`);
          }
        })
        .catch(err => console.error('Join error', err));
    }
  }, [user]);

  // 1. Initial Auth Check
  useEffect(() => {
    async function initAuth() {
      try {
        setAuthLoading(true);
        const authData = await fetchCurrentUserApi();
        if (authData?.user) {
          setUser(authData.user);
          setWeddings(authData.weddings || []);
          if (authData.weddings?.length > 0) {
            const savedWeddingId = getActiveWeddingId();
            const validId = authData.weddings.find(w => w.id === savedWeddingId)?.id || authData.weddings[0].id;
            setActiveWeddingId(validId);
            setActiveWeddingIdState(validId);
          }
        }
      } catch (err) {
        console.error('Auth init error', err);
      } finally {
        setAuthLoading(false);
      }
    }
    initAuth();
  }, []);

  // 2. Load Data when Wedding ID is available (supports silent background sync)
  const loadData = async (silent = false) => {
    if (!activeWeddingId) return;
    try {
      if (!silent) setLoading(true);
      const data = await fetchDb();
      setDb(data);
      if (data?.metadata?.groom && !localStorage.getItem('wedding_active_actor')) {
        setActiveActorState(data.metadata.groom);
      }
      setError(null);
    } catch (err) {
      if (!silent) setError(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (activeWeddingId) {
      loadData();
    }
  }, [activeWeddingId]);

  // 3. Smart On-Focus & Active Background Sync (15s interval + Idle Pause)
  useEffect(() => {
    if (!activeWeddingId || !user) return;

    let lastInteraction = Date.now();
    const IDLE_TIMEOUT_MS = 2 * 60 * 1000; // 2 menit idle
    const SYNC_INTERVAL_MS = 15 * 1000; // 15 detik

    // Event listener untuk reset waktu interaksi
    const recordActivity = () => {
      const wasIdle = (Date.now() - lastInteraction) > IDLE_TIMEOUT_MS;
      lastInteraction = Date.now();
      // Jika sebelumnya idle lalu user berinteraksi lagi, sync langsung
      if (wasIdle && document.visibilityState === 'visible') {
        loadData(true);
      }
    };

    window.addEventListener('touchstart', recordActivity, { passive: true });
    window.addEventListener('click', recordActivity, { passive: true });
    window.addEventListener('keydown', recordActivity, { passive: true });
    window.addEventListener('scroll', recordActivity, { passive: true });

    // Sync saat tab/layar dibuka kembali (Visibility Change & Window Focus)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        lastInteraction = Date.now();
        loadData(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    // Interval sync berkala (hanya jika layar sedang aktif & tidak idle)
    const intervalId = setInterval(() => {
      const isVisible = document.visibilityState === 'visible';
      const isNotIdle = (Date.now() - lastInteraction) < IDLE_TIMEOUT_MS;

      if (isVisible && isNotIdle) {
        loadData(true);
      }
    }, SYNC_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('touchstart', recordActivity);
      window.removeEventListener('click', recordActivity);
      window.removeEventListener('keydown', recordActivity);
      window.removeEventListener('scroll', recordActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [activeWeddingId, user]);

  // Auth Success Handler (Google & Email)
  const handleAuthSuccess = async (payload) => {
    try {
      setAuthLoading(true);
      setAuthError(null);
      let result;
      if (payload.type === 'google') {
        result = await loginWithGoogleApi(payload.credential);
      } else {
        result = payload.data;
      }

      setAuthToken(result.token);
      setUser(result.user);
      setWeddings(result.weddings || []);
      if (result.weddings?.length > 0) {
        const firstId = result.weddings[0].id;
        setActiveWeddingId(firstId);
        setActiveWeddingIdState(firstId);
      }
    } catch (err) {
      setAuthError(err.message || 'Gagal masuk ke akun');
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    setAuthToken(null);
    setActiveWeddingId(null);
    setActiveWeddingIdState('');
    setUser(null);
    setDb(null);
    setWeddings([]);
  };

  // Wedding Created Handler
  const handleWeddingCreated = (newWedding) => {
    setWeddings([newWedding]);
    setActiveWeddingId(newWedding.id);
    setActiveWeddingIdState(newWedding.id);
  };

  // If checking authentication
  if (authLoading && !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf8f5] text-stone-700">
        <div className="relative mb-4">
          <Heart className="w-12 h-12 text-rose-500 fill-rose-500 animate-pulse" />
          <Sparkles className="w-6 h-6 text-amber-400 absolute -top-1 -right-1 animate-spin" />
        </div>
        <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">Siap Nikah</h2>
        <p className="text-xs text-stone-400 mt-1">Memeriksa sesi login...</p>
      </div>
    );
  }

  // If NOT logged in, show Login View
  if (!user) {
    return (
      <LoginView
        onLoginSuccess={handleAuthSuccess}
        isLoading={authLoading}
        error={authError}
      />
    );
  }

  // If user is Admin and in Admin View
  if (isAdmin && isAdminView) {
    return (
      <AdminPanel
        onBack={() => {
          setIsAdminView(false);
          if (window.location.pathname === '/admin') {
            window.history.replaceState({}, document.title, '/');
          }
          loadData(true);
        }}
        adminUser={user}
      />
    );
  }

  // If logged in but has NO wedding yet, show Onboarding
  if (weddings.length === 0) {
    return (
      <CreateWeddingModal
        user={user}
        onWeddingCreated={handleWeddingCreated}
      />
    );
  }

  if (loading && !db) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf8f5] text-stone-700">
        <div className="relative mb-4">
          <Heart className="w-12 h-12 text-rose-500 fill-rose-500 animate-pulse" />
          <Sparkles className="w-6 h-6 text-amber-400 absolute -top-1 -right-1 animate-spin" />
        </div>
        <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">Memuat Wedding Plan...</h2>
        <p className="text-xs text-stone-400 mt-1">Menyiapkan rencana pernikahan impian Anda 💕</p>
      </div>
    );
  }

  if (error && !db) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf8f5] p-4 text-center">
        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xl max-w-md w-full">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-stone-900">Gagal Memuat Data</h2>
          <p className="text-xs text-stone-500 mt-2">{error}</p>
          <button
            onClick={loadData}
            className="mt-5 w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] w-full max-w-[100vw] overflow-x-hidden">
      
      {/* Top Navbar */}
      <Navbar
        metadata={db?.metadata}
        activeActor={activeActor}
        setActiveActor={setActiveActor}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenInvite={handleOpenInvite}
        onOpenUpgradeVip={() => {
          setVipFeaturePrompt('');
          setIsVipModalOpen(true);
        }}
        onDownloadExcel={handleDownloadExcel}
        isAdmin={isAdmin}
        onOpenAdmin={() => setIsAdminView(true)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Tab Navigation Bar */}
      <div className="sticky top-14 sm:top-20 z-20 bg-white/95 backdrop-blur-md border-b border-stone-200/60 shadow-2xs w-full max-w-full">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 sm:py-2.5 scrollbar-thin">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              // Optional badge counts
              let badge = null;
              if (tab.id === 'tabungan') badge = db?.tabungan?.length;
              if (tab.id === 'seserahan') badge = `${db?.seserahan?.filter(s => s.purchased)?.length || 0}/${db?.seserahan?.length || 0}`;
              if (tab.id === 'wedding') badge = db?.wedding?.length;
              if (tab.id === 'tamu') badge = db?.tamuUndangan?.length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-200/60 font-semibold scale-102'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                  <span>{tab.label}</span>
                  {badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/25 text-white' : 'bg-stone-100 text-stone-500'
                    }`}>
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1 w-full overflow-x-hidden">
        {activeTab === 'dashboard' && (
          <DashboardTab
            db={db}
            onSwitchTab={(t) => setActiveTab(t)}
            onQuickAddTabungan={() => setActiveTab('tabungan')}
            onQuickAddSeserahan={() => setActiveTab('seserahan')}
            onOpenInvite={handleOpenInvite}
            onOpenUpgradeVip={() => {
              setVipFeaturePrompt('');
              setIsVipModalOpen(true);
            }}
          />
        )}

        {activeTab === 'tabungan' && (
          <TabunganTab
            tabungan={db?.tabungan}
            metadata={db?.metadata}
            activeActor={activeActor}
            onRefresh={loadData}
            isPremium={isPremium}
            onRequireVip={(msg) => {
              setVipFeaturePrompt(msg);
              setIsVipModalOpen(true);
            }}
          />
        )}

        {activeTab === 'seserahan' && (
          <SeserahanTab
            seserahan={db?.seserahan}
            metadata={db?.metadata}
            activeActor={activeActor}
            onRefresh={loadData}
            isPremium={isPremium}
            onRequireVip={(msg) => {
              setVipFeaturePrompt(msg);
              setIsVipModalOpen(true);
            }}
          />
        )}

        {activeTab === 'mahar' && (
          <MaharTab
            mahar={db?.mahar}
            metadata={db?.metadata}
            activeActor={activeActor}
            onRefresh={loadData}
            isPremium={isPremium}
            onRequireVip={(msg) => {
              setVipFeaturePrompt(msg);
              setIsVipModalOpen(true);
            }}
          />
        )}

        {activeTab === 'wedding' && (
          <WeddingTab
            wedding={db?.wedding}
            activeActor={activeActor}
            onRefresh={loadData}
            isPremium={isPremium}
            onRequireVip={(msg) => {
              setVipFeaturePrompt(msg);
              setIsVipModalOpen(true);
            }}
          />
        )}

        {activeTab === 'undangan' && (
          <UndanganSouvenirTab
            undanganSouvenir={db?.undanganSouvenir}
            activeActor={activeActor}
            onRefresh={loadData}
            isPremium={isPremium}
            onRequireVip={(msg) => {
              setVipFeaturePrompt(msg);
              setIsVipModalOpen(true);
            }}
          />
        )}

        {activeTab === 'tamu' && (
          <TamuTab
            tamuUndangan={db?.tamuUndangan}
            metadata={db?.metadata}
            activeActor={activeActor}
            onRefresh={loadData}
            isPremium={isPremium}
            onRequireVip={(msg) => {
              setVipFeaturePrompt(msg);
              setIsVipModalOpen(true);
            }}
          />
        )}

        {activeTab === 'afternikah' && (
          <AfterNikahTab
            afterNikah={db?.afterNikah}
            activeActor={activeActor}
            onRefresh={loadData}
            isPremium={isPremium}
            onRequireVip={(msg) => {
              setVipFeaturePrompt(msg);
              setIsVipModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200/80 py-5 text-center text-xs text-stone-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span className="font-serif font-bold text-stone-800">Siap Nikah</span>
            <span>• Platform Perencanaan Anggaran & Persiapan Pernikahan Impian</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} Siap Nikah. Semua hak dilindungi.
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        metadata={db?.metadata}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onUpdated={loadData}
        activeActor={activeActor}
      />

      {/* Invite Partner Modal */}
      <InvitePartnerModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        weddingId={activeWeddingId}
        metadata={db?.metadata}
      />

      {/* Upgrade VIP Modal */}
      <UpgradeVipModal
        isOpen={isVipModalOpen}
        onClose={() => {
          setIsVipModalOpen(false);
          setVipFeaturePrompt('');
        }}
        isPremium={isPremium}
        onToggleVipTest={handleToggleVipTest}
        featureMessage={vipFeaturePrompt}
      />

    </div>
  );
}
