import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  PhoneCall,
  Bell,
  Globe,
  User,
  Shield,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import EmergencyModal from './EmergencyModal';

export default function Navbar({ onToggleSidebar }) {
  const { user, token, logout, switchDemoUser, lang, setLang, t, unreadNotifsCount } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        {/* Government Tri-Color Top Accent Bar */}
        <div className="gov-tricolor-bar" />

        {/* Top Government Micro-Bar */}
        <div className="bg-slate-900 text-white text-[11px] px-4 py-1 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold tracking-wide text-amber-400">
              {t('nationalEmblem')}
            </span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="hidden sm:inline text-slate-300">
              Ministry of Petroleum & Natural Gas (MoPNG)
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="hidden md:inline">{t('tollFree')}</span>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-slate-800 rounded-md p-0.5 border border-slate-700">
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  lang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLang('ta')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  lang === 'ta' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                தமிழ்
              </button>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Mobile hamburger & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-sky-600 to-emerald-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                    {t('portalTitle')}
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                    Smart Gas
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  {t('portalSubtitle')}
                </p>
              </div>
            </Link>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 1906 Emergency Helpline Button */}
            <button
              onClick={() => setShowEmergencyModal(true)}
              className="emergency-pulse flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <PhoneCall className="w-4 h-4 animate-bounce" />
              <span className="hidden sm:inline">1906</span>
              <span className="text-[11px] font-semibold hidden md:inline">
                {lang === 'ta' ? 'அவசர உதவி' : 'Emergency'}
              </span>
            </button>

            {/* Quick Demo Switcher (Judges / Evaluators helper) */}
            
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>
              <NotificationDropdown isOpen={showNotifs} onClose={() => setShowNotifs(false)} />
            </div>

            {/* Profile Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {user.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                      {user.full_name}
                    </p>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 top-12 mt-1 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in duration-100">
                    <div className="p-3 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.full_name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        📱 +91 {user.mobile_number}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-blue-50 text-blue-700">
                        {user.role === 'admin' ? t('admin') : t('citizen')}
                      </span>
                    </div>

                    <div className="p-1 space-y-1">
                      <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-500">
                        {lang === 'ta' ? 'சுயவிவரம் மாற்று:' : 'Quick Demo Switch:'}
                      </div>
                      <button
                        onClick={() => {
                          switchDemoUser('citizen');
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs rounded-lg hover:bg-slate-100 flex items-center justify-between"
                      >
                        <span>Citizen (Anandan Selvaraj)</span>
                        {user.role === 'citizen' && <span className="text-blue-600 font-bold">✓</span>}
                      </button>
                      <button
                        onClick={() => {
                          switchDemoUser('admin');
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs rounded-lg hover:bg-slate-100 flex items-center justify-between"
                      >
                        <span>Admin (Officer Rajesh Kumar)</span>
                        {user.role === 'admin' && <span className="text-blue-600 font-bold">✓</span>}
                      </button>
                    </div>

                    <div className="p-1 border-t border-slate-100 mt-1">
                      <button
                        onClick={() => {
                          logout();
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg font-semibold flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors"
              >
                {t('login')}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Emergency Leak Modal */}
      <EmergencyModal isOpen={showEmergencyModal} onClose={() => setShowEmergencyModal(false)} />
    </>
  );
}
