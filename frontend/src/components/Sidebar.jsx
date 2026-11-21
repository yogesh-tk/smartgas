import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Truck,
  Users,
  ShieldCheck,
  AlertTriangle,
  Settings,
  Flame,
  Phone,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, t, lang } = useAuth();

  const navItems = [
    { to: '/', label: t('navDashboard'), icon: LayoutDashboard },
    { to: '/link', label: t('navLinkConnection'), icon: PlusCircle },
    { to: '/bookings', label: t('navBookings'), icon: Truck },
    { to: '/family', label: t('navFamilyHub'), icon: Users },
    { to: '/subsidy', label: t('navSubsidy'), icon: ShieldCheck },
    { to: '/support', label: t('navEmergency'), icon: AlertTriangle },
  ];

  if (user?.role === 'admin') {
    navItems.push({ to: '/admin', label: t('navAdmin'), icon: Settings, adminOnly: true });
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 mt-10 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation Items */}
        <div className="p-4 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {lang === 'ta' ? 'முதன்மை சேவைகள்' : 'Core Services'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? item.adminOnly
                        ? 'bg-slate-900 text-white shadow-xs font-bold'
                        : 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className={`w-4 h-4 ${item.adminOnly ? 'text-amber-400' : ''}`} />
                <span>{item.label}</span>
                {item.adminOnly && (
                  <span className="ml-auto bg-amber-400/20 text-amber-700 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded">
                    Admin
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom OMC Provider Badges & Helpline */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 space-y-3">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            {lang === 'ta' ? 'அங்கீகரிக்கப்பட்ட வழங்குநர்கள்' : 'Supported LPG Grids'}
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold">
            <div className="bg-orange-50 text-orange-700 border border-orange-200 py-1.5 rounded-lg">
              Indane
            </div>
            <div className="bg-yellow-50 text-yellow-800 border border-yellow-200 py-1.5 rounded-lg">
              Bharat
            </div>
            <div className="bg-blue-50 text-blue-700 border border-blue-200 py-1.5 rounded-lg">
              HP Gas
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 flex items-center gap-2 text-red-700">
            <Phone className="w-4 h-4 flex-shrink-0 animate-pulse" />
            <div className="text-[10px] leading-tight">
              <span className="font-bold">1906 Toll-Free:</span>
              <p className="text-red-600">24x7 Gas Leak Helpline</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
