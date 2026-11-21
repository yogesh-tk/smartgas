import React, { useState, useEffect } from 'react';
import {
  Truck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import TrackBookingModal from '../components/TrackBookingModal';
import ReceiptModal from '../components/ReceiptModal';

export default function BookingsPage() {
  const { user, t, lang } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedRef, setSelectedRef] = useState(null);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await api.getMyBookings();
      if (res.success) {
        setBookings(res.bookings || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user?.id]);

  const filteredBookings = bookings.filter((b) => {
    const matchesFilter = filterStatus === 'all'
      ? true
      : filterStatus === 'active'
      ? ['booking_pending', 'booking_confirmed', 'out_for_delivery'].includes(b.booking_status)
      : b.booking_status === filterStatus;

    const matchesSearch = searchTerm
      ? b.booking_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.consumer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.provider_name?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {lang === 'ta' ? 'எரிவாயு முன்பதிவுகள் & நேரலைக் கண்காணிப்பு' : 'Refill Orders & Live Tracking'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status tracking for all your linked LPG domestic & commercial cylinders
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 text-xs shadow-2xs">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'active', label: 'In Progress' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterStatus === f.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Booking Reference (e.g. BK-IND-2026-88102), Consumer Name or Provider..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
        />
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">
          Fetching booking registry from National LPG Grid...
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Truck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Orders Found</h3>
          <p className="text-xs text-slate-500">
            No bookings match the selected criteria or search term.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const isDelivered = b.booking_status === 'delivered';
            const isOutForDelivery = b.booking_status === 'out_for_delivery';
            const isCancelled = b.booking_status === 'cancelled';

            return (
              <div
                key={b.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left: Provider Badge & Ref */}
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs ${
                      b.provider_id === 'indane'
                        ? 'bg-orange-600'
                        : b.provider_id === 'bharat_gas'
                        ? 'bg-yellow-500 text-slate-900'
                        : 'bg-blue-600'
                    }`}
                  >
                    <Truck className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-blue-900">
                        {b.booking_reference}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isDelivered
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isOutForDelivery
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                            : isCancelled
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {isDelivered && <CheckCircle2 className="w-3 h-3" />}
                        {isOutForDelivery && <Clock className="w-3 h-3" />}
                        {isCancelled && <XCircle className="w-3 h-3" />}
                        <span>{t(b.booking_status)}</span>
                      </span>
                    </div>

                    <p className="text-xs font-extrabold text-slate-900">
                      {b.provider_name} • {b.cylinder_type} Refill
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Consumer: {b.consumer_name} ({b.masked_consumer_number})
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Booked on: {new Date(b.booking_date).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Center: Financials & Subsidy */}
                <div className="flex items-center gap-6 border-y md:border-y-0 md:border-x border-slate-100 py-3 md:py-0 md:px-6">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Amount</span>
                    <p className="text-base font-black text-slate-900 font-mono">
                      ₹{Number(b.amount_payable).toFixed(2)}
                    </p>
                    <span className="text-[10px] text-slate-500 uppercase">{b.payment_mode}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">DBTL Subsidy</span>
                    {b.subsidy_status === 'credited' ? (
                      <div>
                        <p className="text-sm font-bold text-emerald-700 font-mono">
                          ₹{b.subsidy_amount} Credited
                        </p>
                        <span className="text-[9px] text-slate-400 font-mono">{b.subsidy_utr_no}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Pending Delivery</span>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedRef(b.booking_reference);
                      setShowTrackModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Track Order</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedRef(b.booking_reference);
                      setShowReceiptModal(true);
                    }}
                    className="border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Receipt</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <TrackBookingModal
        isOpen={showTrackModal}
        onClose={() => setShowTrackModal(false)}
        bookingRef={selectedRef}
        onStatusChanged={() => loadBookings()}
      />

      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        bookingRef={selectedRef}
      />
    </div>
  );
}
