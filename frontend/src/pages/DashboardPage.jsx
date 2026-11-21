import React, { useState, useEffect } from 'react';
import {
  Flame,
  PlusCircle,
  Truck,
  ShieldCheck,
  Clock,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Receipt,
  PhoneCall,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import LinkConnectionModal from '../components/LinkConnectionModal';
import BookRefillModal from '../components/BookRefillModal';
import TrackBookingModal from '../components/TrackBookingModal';
import ReceiptModal from '../components/ReceiptModal';

export default function DashboardPage() {
  const { user, t, lang } = useAuth();
  const [connections, setConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [subsidyData, setSubsidyData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [trackRef, setTrackRef] = useState(null);

  // Load Dashboard Data
  const loadDashboard = async () => {
    setLoading(true);
    try {
      // 1. Fetch user connections
      const connRes = await api.getMyConnections();
      if (connRes.success) {
        const conns = connRes.connections || [];
        setConnections(conns);
        if (conns.length > 0) {
          setSelectedConnection(conns[0]);

          // Fetch details for first connection
          const detRes = await api.getConnectionDetails(conns[0].id);
          if (detRes.success) {
            setBookings(detRes.bookings || []);
            setSubsidyData(detRes.subsidy);
            // Check for active booking
            const active = detRes.bookings?.find((b) => ['booking_pending', 'booking_confirmed', 'out_for_delivery'].includes(b.booking_status));
            setActiveBooking(active || null);
          }
        }
      }

      // Check smart refill reminders
      await api.checkReminders().catch(() => {});
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user?.id]);

  // Handle connection selection switch
  const handleSelectConnection = async (conn) => {
    setSelectedConnection(conn);
    try {
      const detRes = await api.getConnectionDetails(conn.id);
      if (detRes.success) {
        setBookings(detRes.bookings || []);
        setSubsidyData(detRes.subsidy);
        const active = detRes.bookings?.find((b) => ['booking_pending', 'booking_confirmed', 'out_for_delivery'].includes(b.booking_status));
        setActiveBooking(active || null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Metrics calculation
  const totalSubsidyAmount = bookings
    .filter((b) => b.subsidy_status === 'credited')
    .reduce((sum, b) => sum + Number(b.subsidy_amount || 0), 0);

  // Calculate days since last refill
  const lastDeliveredBooking = bookings.find((b) => b.booking_status === 'delivered');
  const daysSinceLastRefill = lastDeliveredBooking
    ? Math.floor((Date.now() - new Date(lastDeliveredBooking.actual_delivery_date || lastDeliveredBooking.booking_date).getTime()) / (1000 * 3600 * 24))
    : 24;

  const showPredictorAlert = daysSinceLastRefill >= 25;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 shadow-xl overflow-hidden border border-blue-900/50">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{t('simulatedDataNotice')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t('welcome')}, {user?.full_name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {lang === 'ta'
                ? 'உங்கள் மற்றும் உங்கள் குடும்ப உறுப்பினர்களின் இண்டேன், பாரத் மற்றும் ஹெச்பி கேஸ் நுகர்வோர் விவரங்களை ஒரே இடத்தில் எளிதாக நிர்வகிக்கலாம்.'
                : 'Manage LPG consumer connections for you and your family in one unified portal with instant Email notification alerts and DBTL direct subsidies.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowLinkModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('navLinkConnection')}</span>
            </button>
            {selectedConnection && (
              <button
                onClick={() => setShowBookModal(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <Flame className="w-4 h-4 text-amber-300" />
                <span>{t('bookNowBtn')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Smart Refill Prediction Alert Banner */}
      {showPredictorAlert && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 rounded-2xl p-4.5 bg-white shadow-xs flex items-start gap-4">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-xl flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {t('smartPredictorAlert')}
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {t('smartPredictorMsg')} ({daysSinceLastRefill} {lang === 'ta' ? 'நாட்கள் ஆனது' : 'days elapsed since last delivery'}).
            </p>
          </div>
          <button
            onClick={() => setShowBookModal(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex-shrink-0 shadow-xs"
          >
            {t('bookNowBtn')}
          </button>
        </div>
      )}

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Connections */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('activeConnections')}
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {connections.length}
            </div>
          </div>
        </div>

        {/* Metric 2: Current Booking */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('currentBooking')}
            </span>
            <div className="text-xs font-bold text-slate-900 mt-1">
              {activeBooking ? (
                <span className="inline-block px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-extrabold uppercase text-[10px]">
                  {t(activeBooking.booking_status)}
                </span>
              ) : (
                <span className="text-slate-500 font-normal">
                  {lang === 'ta' ? 'செயலில் முன்பதிவு இல்லை' : 'No active order'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Metric 3: Days Since Refill */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('daysSinceRefill')}
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {daysSinceLastRefill} <span className="text-xs font-semibold text-slate-500">days</span>
            </div>
          </div>
        </div>

        {/* Metric 4: DBTL Subsidy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('dbtlSubsidyCredited')}
            </span>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">
              ₹{totalSubsidyAmount.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Connection Cards Switcher */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{lang === 'ta' ? 'இணைக்கப்பட்ட எரிவாயு கணக்குகள்' : 'Your LPG Connections'}</span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {connections.length}
            </span>
          </h2>
          <button
            onClick={() => setShowLinkModal(true)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{t('addFamilyMemberBtn')}</span>
          </button>
        </div>

        {/* Connection Switcher Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connections.map((conn) => {
            const isSelected = selectedConnection?.id === conn.id;
            const pColor = conn.provider_id === 'indane' ? 'border-orange-500' : conn.provider_id === 'bharat_gas' ? 'border-yellow-500' : 'border-blue-600';
            const badgeBg = conn.provider_id === 'indane' ? 'bg-orange-600 text-white' : conn.provider_id === 'bharat_gas' ? 'bg-yellow-500 text-slate-900' : 'bg-blue-600 text-white';

            return (
              <div
                key={conn.id}
                onClick={() => handleSelectConnection(conn)}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all bg-white shadow-xs relative ${
                  isSelected
                    ? `${pColor} ring-4 ring-blue-500/10 shadow-md`
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Provider Logo Badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase ${badgeBg}`}>
                    {conn.provider_name}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active • {conn.relationship_type.toUpperCase()}
                  </span>
                </div>

                {/* Consumer Number & Holder Name */}
                <div className="space-y-1">
                  <div className="text-lg font-black text-slate-900 font-mono tracking-wide">
                    {conn.masked_consumer_number || conn.consumer_number}
                  </div>
                  <p className="text-xs font-bold text-slate-700">
                    {conn.consumer_name}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {conn.distributor_name}
                  </p>
                </div>

                {/* Footer Controls */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Price: <strong className="text-slate-800">₹{conn.cylinder_price_14kg}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedConnection(conn);
                        setShowBookModal(true);
                      }}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-[11px]"
                    >
                      Book Refill
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Booking Visual Tracker (if order in progress) */}
      {activeBooking && (
        <div className="bg-white rounded-3xl p-6 border border-blue-200 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Truck className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">
                  Live Fulfillment In Progress
                </span>
                <h3 className="text-base font-extrabold text-slate-900">
                  Refill Order: <span className="font-mono text-blue-700">{activeBooking.booking_reference}</span>
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setTrackRef(activeBooking.booking_reference);
                  setShowTrackModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Truck className="w-4 h-4" />
                <span>{t('trackBtn')}</span>
              </button>
            </div>
          </div>

          {/* Handover PIN & Delivery Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100">
              <span className="text-[10px] font-bold text-blue-700 uppercase block mb-1">
                {t('deliveryPin')}
              </span>
              <div className="text-3xl font-black font-mono text-blue-950 tracking-widest">
                {activeBooking.delivery_otp || '8492'}
              </div>
              <p className="text-[10px] text-blue-600 mt-1">Provide to delivery partner upon receipt</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                {t('deliveryAgent')}
              </span>
              <div className="text-sm font-bold text-slate-900">
                {activeBooking.delivery_person_name || 'Murugan Swamy'}
              </div>
              <p className="text-xs text-slate-600 font-mono mt-0.5">
                📞 {activeBooking.delivery_person_phone || '9840192837'}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Payment & Amount
              </span>
              <div className="text-sm font-black text-slate-900">
                ₹{activeBooking.amount_payable}
              </div>
              <p className="text-xs text-slate-600 uppercase mt-0.5">
                Mode: {activeBooking.payment_mode} ({activeBooking.payment_status})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Previous Refill History & DBTL Subsidy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Previous Refills Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{t('refillHistoryTitle')}</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              Showing last {bookings.length} refill orders
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Booking Ref</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Cylinder</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Subsidy</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No previous refill records found for this connection.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-blue-900">
                        {b.booking_reference}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {new Date(b.booking_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        {b.cylinder_type}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900 font-mono">
                        ₹{Number(b.amount_payable).toFixed(2)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                            b.booking_status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : b.booking_status === 'out_for_delivery'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {b.booking_status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {b.subsidy_status === 'credited' ? (
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                            <span>₹{b.subsidy_amount}</span>
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded">DBTL</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Pending</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right space-x-1">
                        <button
                          onClick={() => {
                            setTrackRef(b.booking_reference);
                            setShowTrackModal(true);
                          }}
                          className="px-2 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 rounded-md"
                        >
                          Track
                        </button>
                        <button
                          onClick={() => {
                            setTrackRef(b.booking_reference);
                            setShowReceiptModal(true);
                          }}
                          className="px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 rounded-md"
                        >
                          Receipt
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subsidy Card (1 col) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>PAHAL (DBTL) Subsidy</span>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-800 font-semibold">Subsidy Status:</span>
              <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Aadhaar Linked
              </span>
            </div>

            <div className="text-xs space-y-2 text-slate-700 border-t border-emerald-200/70 pt-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Linked Bank Account</span>
                <p className="font-bold text-slate-900">State Bank of India</p>
                <p className="font-mono text-[11px] text-slate-600">A/C: XXXX-XXXX-4819</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Current Scheme</span>
                <p className="font-medium text-slate-800">DBTL (PAHAL) / PM Ujjwala Yojana</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Subsidy Rate / Cylinder</span>
                <p className="text-lg font-black text-emerald-700 font-mono">₹200.00</p>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Direct Benefit Transfer for LPG ensures subsidy is credited straight to your bank account within 48 hours of delivery clearance.
          </p>
        </div>
      </div>

      {/* Modals */}
      <LinkConnectionModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onLinked={() => loadDashboard()}
      />

      <BookRefillModal
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
        connection={selectedConnection}
        onBooked={() => loadDashboard()}
      />

      <TrackBookingModal
        isOpen={showTrackModal}
        onClose={() => setShowTrackModal(false)}
        bookingRef={trackRef}
        onStatusChanged={() => loadDashboard()}
      />

      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        bookingRef={trackRef}
      />
    </div>
  );
}
