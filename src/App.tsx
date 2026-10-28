import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BusRoute, UserProfile, UserRole, ThemeSettings, Announcement } from './types';
import { INITIAL_BUS_ROUTES, INITIAL_ANNOUNCEMENTS } from './data/initialRoutes';
import { getStoredFirebaseConfig, saveFirebaseConfig, FirebaseConfigType } from './firebase';

const DEFAULT_THEME: ThemeSettings = {
  accentColor: '#dc2626',
  backgroundImageUrl: null,
  backgroundPlacement: 'dashboard',
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hueRotate: 0,
  filterPreset: 'none',
  imagePosition: 'center',
  imageFit: 'cover',
  overlayOpacity: 40,
};

export const App: React.FC = () => {
  // Authentication & Role State
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  // Navigation & View State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modals
  const [viewRouteDetails, setViewRouteDetails] = useState<BusRoute | null>(null);
  const [editingRoute, setEditingRoute] = useState<BusRoute | null>(null);
  const [isAddRouteModalOpen, setIsAddRouteModalOpen] = useState<boolean>(false);
  const [routeToDelete, setRouteToDelete] = useState<BusRoute | null>(null);
  const [showAppearanceModal, setShowAppearanceModal] = useState<boolean>(false);
  const [showFirebaseModal, setShowFirebaseModal] = useState<boolean>(false);

  // Collections (Persistent Storage)
  const [routes, setRoutes] = useState<BusRoute[]>(() => {
    const saved = localStorage.getItem('smart_bus_routes');
    return saved ? JSON.parse(saved) : INITIAL_BUS_ROUTES;
  });

  const [announcements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('smart_bus_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('smart_bus_favorites');
    return saved ? JSON.parse(saved) : ['route-12b'];
  });

  const [theme, setTheme] = useState<ThemeSettings>(() => {
    const saved = localStorage.getItem('smart_bus_theme');
    return saved ? JSON.parse(saved) : DEFAULT_THEME;
  });

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Persist State
  useEffect(() => {
    localStorage.setItem('smart_bus_routes', JSON.stringify(routes));
  }, [routes]);

  useEffect(() => {
    localStorage.setItem('smart_bus_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('smart_bus_theme', JSON.stringify(theme));
  }, [theme]);

  // Toast Helper
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Live Digital Clock & IST Date Engine (Asia/Kolkata)
  const calculateISTTime = () => {
    const now = new Date();
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const istHours = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })).getHours();
    let greeting = 'Good Evening';
    if (istHours >= 4 && istHours < 12) greeting = 'Good Morning';
    else if (istHours >= 12 && istHours < 17) greeting = 'Good Afternoon';
    else if (istHours >= 17 && istHours < 22) greeting = 'Good Evening';
    else greeting = 'Good Night';

    return {
      timeStr: timeFormatter.format(now),
      dateStr: dateFormatter.format(now),
      greeting: greeting
    };
  };

  const [timeState, setTimeState] = useState(calculateISTTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeState(calculateISTTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Favorite toggle
  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      showToast(prev.includes(id) ? 'Removed from favourites' : 'Added to favourites ❤️');
      return next;
    });
  };

  // Save Route
  const handleSaveRoute = (routeData: Omit<BusRoute, 'id' | 'lastUpdated'>) => {
    if (editingRoute) {
      setRoutes(prev =>
        prev.map(r =>
          r.id === editingRoute.id
            ? { ...routeData, id: r.id, lastUpdated: new Date().toISOString() }
            : r
        )
      );
      showToast(`Route ${routeData.routeNumber} updated successfully!`);
      setEditingRoute(null);
    } else {
      const newRoute: BusRoute = {
        ...routeData,
        id: 'route-' + Date.now(),
        lastUpdated: new Date().toISOString()
      };
      setRoutes(prev => [newRoute, ...prev]);
      showToast(`Route ${routeData.routeNumber} added to live board!`);
      setIsAddRouteModalOpen(false);
    }
  };

  // Delete Route
  const confirmDeleteRoute = () => {
    if (!routeToDelete) return;
    setRoutes(prev => prev.filter(r => r.id !== routeToDelete.id));
    showToast(`Route ${routeToDelete.routeNumber} deleted`);
    setRouteToDelete(null);
    if (viewRouteDetails?.id === routeToDelete.id) {
      setViewRouteDetails(null);
    }
  };

  // Filtered Routes
  const filteredRoutes = useMemo(() => {
    return routes.filter(route => {
      if (activeTab === 'favorites' && !favorites.includes(route.id)) {
        return false;
      }
      if (selectedCategory !== 'All' && route.category !== selectedCategory) {
        return false;
      }
      if (statusFilter === 'Verified' && !route.isVerified) return false;
      if (statusFilter === 'Unverified' && route.isVerified) return false;
      if (statusFilter === 'On Time' && route.status !== 'On Time') return false;
      if (statusFilter === 'Delayed' && route.status !== 'Delayed') return false;

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchNumber = route.routeNumber.toLowerCase().includes(q);
        const matchName = route.routeName.toLowerCase().includes(q);
        const matchSource = route.source.toLowerCase().includes(q);
        const matchDest = route.destination.toLowerCase().includes(q);
        const matchStops = route.intermediateStops.some(s => s.toLowerCase().includes(q));
        const matchBus = route.busNumber.toLowerCase().includes(q);
        const matchDriver = route.driverName.toLowerCase().includes(q);
        return matchNumber || matchName || matchSource || matchDest || matchStops || matchBus || matchDriver;
      }
      return true;
    });
  }, [routes, favorites, activeTab, selectedCategory, statusFilter, searchQuery]);

  // Dynamic CSS filter string
  const getFilterStyle = () => {
    let filters = `brightness(${theme.brightness}%) contrast(${theme.contrast}%) saturate(${theme.saturation}%) hue-rotate(${theme.hueRotate}deg)`;
    if (theme.filterPreset === 'grayscale') filters += ' grayscale(100%)';
    else if (theme.filterPreset === 'vintage') filters += ' sepia(70%) contrast(110%)';
    else if (theme.filterPreset === 'warm') filters += ' sepia(30%) saturate(140%) hue-rotate(-15deg)';
    else if (theme.filterPreset === 'cool') filters += ' hue-rotate(180deg) saturate(90%)';
    else if (theme.filterPreset === 'high-contrast') filters += ' contrast(160%) brightness(110%)';
    return filters;
  };

  const handleGoogleLogin = (role: UserRole) => {
    setIsAuthenticating(true);
    setLoginError(null);

    // Google Sign-In with configured credentials or realistic demo fallback
    setTimeout(() => {
      setIsAuthenticating(false);
      const user: UserProfile = {
        uid: 'user-' + role + '-' + Math.random().toString(36).substring(7),
        displayName:
          role === 'admin'
            ? 'Dr. Ramesh Sharma (Admin)'
            : role === 'student'
            ? 'Aarav Patel (Student)'
            : 'Prof. Sunita Menon (Faculty)',
        email:
          role === 'admin'
            ? 'admin.transport@university.edu.in'
            : role === 'student'
            ? 'aarav.2024@university.edu.in'
            : 's.menon@university.edu.in',
        photoURL:
          role === 'admin'
            ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
            : role === 'student'
            ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        role: role,
        assignedRouteId: role === 'student' ? 'route-12b' : role === 'teacher' ? 'route-42' : undefined,
        createdAt: new Date().toISOString()
      };
      setCurrentUser(user);
      setShowLoginModal(false);
      showToast(`Welcome back, ${user.displayName}! Signed in as ${role.toUpperCase()}`);
    }, 700);
  };

  const handleQuickLogin = (role: UserRole) => {
    const user: UserProfile = {
      uid: 'user-' + role + '-001',
      displayName:
        role === 'admin'
          ? 'Chief Transport Officer'
          : role === 'student'
          ? 'Rahul Sharma (Roll #409)'
          : 'Prof. Ananya Sen (Dept. Physics)',
      email: `${role}@smartbus.internal`,
      photoURL:
        role === 'admin'
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
          : role === 'student'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      role: role,
      assignedRouteId: role === 'student' ? 'route-12b' : role === 'teacher' ? 'route-42' : undefined,
      createdAt: new Date().toISOString()
    };
    setCurrentUser(user);
    setShowLoginModal(false);
    showToast(`Signed in as ${role.toUpperCase()} • Welcome!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedRole(null);
    setIsSidebarOpen(false);
    showToast('Logged out successfully');
  };

  // --- UN-AUTHENTICATED: ROLE SELECTION SCREEN ("WHO ARE YOU?") ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between relative overflow-hidden font-sans">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-red-800/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header */}
        <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/40">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h8m-8 4h8m-9 7h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zm1 3v-3m8 3v-3M7 14h.01M17 14h.01" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                SMART ROUTE <span className="text-xs px-2 py-0.5 rounded bg-red-600/30 text-red-400 font-mono font-semibold border border-red-500/30">DIGITAL BOARD</span>
              </h1>
              <p className="text-xs text-slate-400">Intelligent Transit & Route Management System</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-4 bg-slate-800/80 backdrop-blur border border-slate-700/60 px-4 py-2 rounded-xl">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">{timeState.dateStr}</div>
              <div className="text-sm font-bold font-mono text-white tracking-wider flex items-center justify-end gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {timeState.timeStr} <span className="text-[10px] text-red-400">IST</span>
              </div>
            </div>
          </div>
        </header>

        {/* Role Selection Content */}
        <main className="w-full max-w-4xl mx-auto px-6 py-8 flex-1 flex flex-col justify-center items-center z-10">
          <div className="text-center max-w-2xl mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold mb-4 tracking-wide uppercase">
              <span>Authorized Transit Access Portal</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
              Who are you?
            </h2>
            <p className="text-slate-300 text-base md:text-lg">
              Welcome to Smart Bus Route Management. Select your portal role to access tailored transit schedules, live boards, and management controls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-10">
            {/* Admin */}
            <div
              onClick={() => setSelectedRole('admin')}
              className={`cursor-pointer rounded-2xl p-6 transition-all duration-300 relative group border ${
                selectedRole === 'admin'
                  ? 'bg-gradient-to-b from-red-950/80 to-slate-900 border-red-500 shadow-xl shadow-red-950/50 scale-[1.02] ring-2 ring-red-500/50'
                  : 'bg-slate-800/50 hover:bg-slate-800/90 border-slate-700/70 hover:border-slate-500'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-red-600/20 text-red-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-between">
                Administrator
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30">Control</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Add, edit, or delete official bus routes, verify physical board records, publish notices, and manage theme branding.
              </p>
            </div>

            {/* Student */}
            <div
              onClick={() => setSelectedRole('student')}
              className={`cursor-pointer rounded-2xl p-6 transition-all duration-300 relative group border ${
                selectedRole === 'student'
                  ? 'bg-gradient-to-b from-blue-950/80 to-slate-900 border-blue-500 shadow-xl shadow-blue-950/50 scale-[1.02] ring-2 ring-blue-500/50'
                  : 'bg-slate-800/50 hover:bg-slate-800/90 border-slate-700/70 hover:border-slate-500'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14v7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-between">
                Student
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30">Commuter</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Access campus shuttles, view assigned hostel buses, star favorite routes, and view transit alerts.
              </p>
            </div>

            {/* Teacher */}
            <div
              onClick={() => setSelectedRole('teacher')}
              className={`cursor-pointer rounded-2xl p-6 transition-all duration-300 relative group border ${
                selectedRole === 'teacher'
                  ? 'bg-gradient-to-b from-emerald-950/80 to-slate-900 border-emerald-500 shadow-xl shadow-emerald-950/50 scale-[1.02] ring-2 ring-emerald-500/50'
                  : 'bg-slate-800/50 hover:bg-slate-800/90 border-slate-700/70 hover:border-slate-500'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-between">
                Teacher / Faculty
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">Faculty</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Staff quarters priority shuttle schedules, emergency transport contacts, and institutional advisories.
              </p>
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
            <button
              disabled={!selectedRole}
              onClick={() => {
                setLoginError(null);
                setShowLoginModal(true);
              }}
              className={`w-full py-4 px-6 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                selectedRole
                  ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-red-700/40 scale-100 hover:scale-[1.01] active:scale-[0.98]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <span>Continue to {selectedRole ? selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1) : ''} Portal</span>
              <span>→</span>
            </button>
          </div>

          <div className="mt-6 flex items-center gap-4 text-xs text-slate-400">
            <button
              onClick={() => setShowFirebaseModal(true)}
              className="hover:text-red-400 underline underline-offset-4 transition-colors"
            >
              Configure Firebase Credentials
            </button>
            <span>•</span>
            <span>Asia/Kolkata (IST) Live Synchronization</span>
          </div>
        </main>

        <footer className="w-full text-center py-6 text-xs text-slate-400 border-t border-slate-800/80">
          Smart Bus Route Management System • Built with React, Tailwind CSS & Firebase
        </footer>

        {/* Login Modal */}
        {showLoginModal && selectedRole && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <span>←</span> Back to Role Selection
                </button>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  {selectedRole} Portal
                </span>
              </div>

              <div className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white capitalize">
                    {selectedRole === 'admin' ? 'Administrator Login' : selectedRole === 'student' ? 'Student Commuter Login' : 'Teacher / Faculty Login'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Sign in with your authorized Google Account or institutional credentials
                  </p>
                </div>

                {loginError && (
                  <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs">
                    {loginError}
                  </div>
                )}

                <button
                  disabled={isAuthenticating}
                  onClick={() => handleGoogleLogin(selectedRole)}
                  className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all duration-200 shadow-md mb-4"
                >
                  <span>{isAuthenticating ? 'Connecting to Google...' : 'Continue with Google'}</span>
                </button>

                <div className="flex items-center my-6">
                  <div className="flex-1 border-t border-slate-800"></div>
                  <span className="px-3 text-[11px] uppercase tracking-wider text-slate-400 font-mono">or quick access</span>
                  <div className="flex-1 border-t border-slate-800"></div>
                </div>

                <button
                  onClick={() => handleQuickLogin(selectedRole)}
                  className="w-full py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-between border bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700 transition-all"
                >
                  <span>Quick Sign In as Verified {selectedRole.toUpperCase()}</span>
                  <span>Enter Dashboard →</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {showFirebaseModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4">Firebase Credentials</h3>
              <p className="text-xs text-slate-400 mb-4">Credentials can be entered in .env or configured dynamically.</p>
              <button
                onClick={() => setShowFirebaseModal(false)}
                className="px-4 py-2 bg-red-600 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- AUTHENTICATED: DASHBOARD VIEW ---
  return (
    <div
      className="min-h-screen flex flex-col font-sans transition-colors relative selection:bg-red-600 selection:text-white"
      style={{
        backgroundColor: '#F8FAFC',
        backgroundImage:
          theme.backgroundImageUrl && theme.backgroundPlacement === 'dashboard'
            ? `url(${theme.backgroundImageUrl})`
            : 'none',
        backgroundPosition: theme.imagePosition,
        backgroundSize: theme.imageFit,
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Readability Overlay */}
      {theme.backgroundImageUrl && theme.backgroundPlacement === 'dashboard' && (
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundColor: '#0F172A',
            opacity: theme.overlayOpacity / 100,
            backdropFilter: getFilterStyle(),
          }}
        ></div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-semibold border bg-slate-900/95 text-white border-slate-700">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Header
        currentUser={currentUser}
        theme={theme}
        timeState={timeState}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenSettings={() => setActiveTab('settings')}
        onOpenAddRoute={() => {
          setEditingRoute(null);
          setIsAddRouteModalOpen(true);
        }}
      />

      {/* Animated Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        currentUser={currentUser}
        activeTab={activeTab}
        routesCount={routes.length}
        favoritesCount={favorites.length}
        announcementsCount={announcements.length}
        onClose={() => setIsSidebarOpen(false)}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenAddRoute={() => {
          setEditingRoute(null);
          setIsAddRouteModalOpen(true);
        }}
        onLogout={handleLogout}
        showToast={showToast}
      />

      {/* Dashboard Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full relative z-10">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1">
            <input
              id="route-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search routes by route number, destination, stop, bus no, or driver..."
              className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 text-sm placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {['All', 'Campus & University', 'City Express', 'Metro Feeder', 'Suburban / Outstation', 'Night Service'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Route Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoutes.map(route => {
            const isFav = favorites.includes(route.id);
            return (
              <div
                key={route.id}
                onClick={() => setViewRouteDetails(route)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-red-400 custom-shadow-card hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                <div className="px-5 pt-5 pb-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="px-3.5 py-1.5 rounded-lg bg-red-600 text-white font-mono font-black text-xl tracking-tight shadow-md shadow-red-600/30">
                        {route.routeNumber}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
                          {route.category}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-semibold border ${
                            route.isVerified ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'
                          }`}>
                            {route.isVerified ? '✓ Verified Board' : '⚠ Needs Verification'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => toggleFavorite(route.id, e)}
                      className="p-2 rounded-lg hover:bg-slate-100"
                    >
                      <span className={isFav ? "text-red-600" : "text-slate-400"}>♥</span>
                    </button>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mt-3 leading-snug">
                    {route.routeName}
                  </h4>
                </div>

                <div className="px-5 py-3 bg-white">
                  <div className="flex flex-wrap gap-1.5 max-h-16 overflow-hidden">
                    {route.intermediateStops.slice(0, 4).map((stop, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium"
                      >
                        {stop}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="text-slate-500 font-medium">
                      {route.morningTiming.split(' - ')[0]} • {route.frequency}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Bus: <span className="text-slate-700 font-semibold">{route.busNumber}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    {route.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default App;
