import React from 'react';
import { UserProfile } from '../types';

interface SidebarProps {
  isOpen: boolean;
  currentUser: UserProfile;
  activeTab: string;
  routesCount: number;
  favoritesCount: number;
  announcementsCount: number;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
  onOpenAddRoute: () => void;
  onLogout: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  currentUser,
  activeTab,
  routesCount,
  favoritesCount,
  announcementsCount,
  onClose,
  onSelectTab,
  onOpenAddRoute,
  onLogout,
  showToast,
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
        ></div>
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-slate-900 text-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white shadow-lg shadow-red-900/50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h8m-8 4h8m-9 7h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zm1 3v-3m8 3v-3M7 14h.01M17 14h.01" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Smart Bus Route</h2>
              <p className="text-[11px] text-red-400 font-mono">Digital Board System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* User Profile Summary */}
        <div className="p-5 mx-4 my-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
          <img
            src={currentUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.displayName}`}
            alt="Profile"
            className="w-11 h-11 rounded-full object-cover border-2 border-red-500"
          />
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{currentUser.displayName}</p>
            <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
            <span className="inline-block mt-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-red-600/30 text-red-300 border border-red-500/30">
              {currentUser.role}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
          {/* Dashboard */}
          <button
            onClick={() => { onSelectTab('dashboard'); onClose(); }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'dashboard' ? 'bg-red-600 text-white shadow-md shadow-red-700/40' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Dashboard</span>
          </button>

          {/* All Bus Routes */}
          <button
            onClick={() => { onSelectTab('routes'); onClose(); }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'routes' ? 'bg-red-600 text-white shadow-md shadow-red-700/40' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>All Bus Routes</span>
            <span className="ml-auto text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              {routesCount}
            </span>
          </button>

          {/* Search Routes */}
          <button
            onClick={() => {
              onSelectTab('routes');
              onClose();
              setTimeout(() => {
                const el = document.getElementById('route-search-input');
                if (el) el.focus();
              }, 150);
            }}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Search Routes</span>
          </button>

          {/* Add New Route (Role Check: Admin Only) */}
          <button
            onClick={() => {
              if (currentUser.role !== 'admin') {
                showToast('Administrator privilege required to add routes', 'error');
                return;
              }
              onClose();
              onOpenAddRoute();
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              currentUser.role === 'admin'
                ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                : 'text-slate-500 hover:bg-slate-850/50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add New Route</span>
            </div>
            {currentUser.role !== 'admin' && (
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                Admin
              </span>
            )}
          </button>

          {/* Edit Routes (Role Check: Admin Only) */}
          <button
            onClick={() => {
              if (currentUser.role !== 'admin') {
                showToast('Administrator privilege required to edit routes', 'error');
                return;
              }
              onSelectTab('routes');
              onClose();
              showToast('Click the Edit icon on any route card to modify details');
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              currentUser.role === 'admin'
                ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                : 'text-slate-500 hover:bg-slate-850/50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit Routes</span>
            </div>
            {currentUser.role !== 'admin' && (
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                Admin
              </span>
            )}
          </button>

          {/* Favourite Routes */}
          <button
            onClick={() => { onSelectTab('favorites'); onClose(); }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'favorites' ? 'bg-red-600 text-white shadow-md shadow-red-700/40' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5 fill-red-500 text-red-500" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>Favourite Routes</span>
            <span className="ml-auto text-xs px-2 py-0.5 rounded bg-red-950 text-red-300 font-mono">
              {favoritesCount}
            </span>
          </button>

          {/* Profile & Settings */}
          <button
            onClick={() => { onSelectTab('settings'); onClose(); }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'settings' ? 'bg-red-600 text-white shadow-md shadow-red-700/40' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Profile & Settings</span>
          </button>
        </nav>

        {/* Sidebar Footer with Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-950/40 hover:text-red-300 border border-red-900/40 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
