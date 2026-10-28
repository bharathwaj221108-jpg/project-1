import React from 'react';
import { UserProfile, ThemeSettings } from '../types';

interface HeaderProps {
  currentUser: UserProfile;
  theme: ThemeSettings;
  timeState: {
    timeStr: string;
    dateStr: string;
    greeting: string;
  };
  onOpenSidebar: () => void;
  onOpenSettings: () => void;
  onOpenAddRoute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  theme,
  timeState,
  onOpenSidebar,
  onOpenSettings,
  onOpenAddRoute,
}) => {
  return (
    <header
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm transition-all"
      style={{
        backgroundImage:
          theme.backgroundImageUrl && theme.backgroundPlacement === 'header'
            ? `url(${theme.backgroundImageUrl})`
            : 'none',
        backgroundPosition: theme.imagePosition,
        backgroundSize: theme.imageFit,
      }}
    >
      {theme.backgroundImageUrl && theme.backgroundPlacement === 'header' && (
        <div
          className="absolute inset-0 pointer-events-none z-0 bg-slate-950"
          style={{ opacity: theme.overlayOpacity / 100 }}
        ></div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between relative z-10">
        {/* Left Side: Three-dot menu, Profile Icon, Name, Date Underneath */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Three-dot hamburger icon */}
          <button
            onClick={onOpenSidebar}
            aria-label="Open Navigation Menu"
            className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-700 hover:text-red-600 transition-colors border border-transparent hover:border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/30"
            title="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5" fill="currentColor" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              <circle cx="12" cy="19" r="1.5" fill="currentColor" />
            </svg>
          </button>

          {/* Circular Profile Avatar */}
          <div
            className="relative group cursor-pointer"
            onClick={onOpenSettings}
            title="Profile & Appearance Settings"
          >
            <img
              src={
                currentUser.photoURL ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.displayName}`
              }
              alt={currentUser.displayName}
              className="w-10 h-10 rounded-full object-cover border-2 border-red-600 shadow-sm transition-transform group-hover:scale-105"
            />
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                currentUser.role === 'admin'
                  ? 'bg-red-600'
                  : currentUser.role === 'student'
                  ? 'bg-blue-600'
                  : 'bg-emerald-600'
              }`}
            ></span>
          </div>

          {/* Profile Name & Current Date Underneath */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-none">
                {currentUser.displayName}
              </span>
              <span
                className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                  currentUser.role === 'admin'
                    ? 'bg-red-100 text-red-700 border border-red-300'
                    : currentUser.role === 'student'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                }`}
              >
                {currentUser.role}
              </span>
            </div>

            {/* Below Profile: Automatic Current Date & Greeting */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500 font-medium">
                {timeState.dateStr}
              </span>
              <span className="hidden md:inline-block text-[11px] text-slate-400">•</span>
              <span className="hidden md:inline-block text-[11px] font-medium text-red-600">
                {timeState.greeting}!
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Live Digital Clock with Seconds (12h format with AM/PM, Asia/Kolkata IST) */}
        <div className="flex items-center space-x-3">
          <div className="bg-slate-900 text-white px-3 sm:px-4 py-2 rounded-xl shadow-md border border-slate-800 flex items-center space-x-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <div className="text-right">
              <div className="text-xs sm:text-sm font-bold font-mono tracking-wider">
                {timeState.timeStr}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-slate-400 font-medium leading-none">
                Asia/Kolkata (IST)
              </div>
            </div>
          </div>

          {/* Admin Action Button */}
          {currentUser.role === 'admin' && (
            <button
              onClick={onOpenAddRoute}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/30 transition-all active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>New Route</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
