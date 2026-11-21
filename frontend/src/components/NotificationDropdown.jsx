import React from 'react';
import { Bell, Check, Clock, Flame, ShieldCheck, Truck, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function NotificationDropdown({ isOpen, onClose }) {
  const { notifications, unreadNotifsCount, refreshNotifications, lang } = useAuth();

  if (!isOpen) return null;

  const handleMarkRead = async (id) => {
    try {
      await api.markNotifRead(id);
      refreshNotifications();
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotifsRead();
      refreshNotifications();
    } catch (e) {}
  };

  const getIcon = (type) => {
    switch (type) {
      case 'delivery_update':
        return <Truck className="w-4 h-4 text-emerald-600" />;
      case 'refill_reminder':
        return <Flame className="w-4 h-4 text-amber-500" />;
      case 'subsidy_alert':
        return <ShieldCheck className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="absolute right-0 top-12 mt-2 w-96 max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" />
          <h4 className="text-sm font-bold">
            {lang === 'ta' ? 'அறிவிப்புகள்' : 'Notifications & Email Updates'}
          </h4>
          {unreadNotifsCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {unreadNotifsCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadNotifsCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] text-slate-300 hover:text-white underline"
            >
              {lang === 'ta' ? 'அனைத்தும் படித்தவை' : 'Mark all read'}
            </button>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            {lang === 'ta' ? 'புதிய அறிவிப்புகள் எதுவும் இல்லை.' : 'No notifications currently.'}
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && handleMarkRead(n.id)}
              className={`p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3 cursor-pointer ${
                !n.is_read ? 'bg-blue-50/50' : ''
              }`}
            >
              <div className="mt-0.5 p-1.5 rounded-lg bg-white shadow-xs border border-slate-200 flex-shrink-0">
                {getIcon(n.notification_type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h5 className="text-xs font-bold text-slate-800 truncate">
                    {lang === 'ta' ? n.title_ta || n.title : n.title}
                  </h5>
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0"></span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {lang === 'ta' ? n.message_ta || n.message : n.message}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="uppercase text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                    {n.channel}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-500">
        Connected to Email notification & Firebase Push Notification Service
      </div>
    </div>
  );
}
