import React, { useState, useEffect } from 'react';
import {
  Truck,
  CheckCircle2,
  Clock,
  Phone,
  User,
  Shield,
  KeyRound,
  X,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function TrackBookingModal({ isOpen, onClose, bookingRef, onStatusChanged }) {
  const { t, lang } = useAuth();
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cancellation State
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change in schedule');

  useEffect(() => {
    if (isOpen && bookingRef) {
      setLoading(true);
      setError(null);
      api.trackBooking(bookingRef)
        .then((res) => {
          if (res.success) setTrackingData(res);
        })
        .catch((err) => setError(err.message || 'Tracking failed.'))
        .finally(() => setLoading(false));
    }
  }, [isOpen, bookingRef]);

  if (!isOpen) return null;

  const handleCancelBooking = async () => {
    try {
      await api.cancelBooking(bookingRef, { reason: cancelReason, language: lang });
      setShowCancelConfirm(false);
      if (onStatusChanged) onStatusChanged();
      onClose();
    } catch (e) {
      setError(e.message);
    }
  };

  const booking = trackingData?.booking;
  const stages = trackingData?.stages || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Truck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {lang === 'ta' ? 'சிலிண்டர் முன்பதிவு நேரலைக் கண்காணிப்பு' : 'Live Refill Booking Tracker'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">Ref: {bookingRef}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Connecting to National LPG Grid Tracking Gateway...
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : (
            <>
              {/* Delivery Verification PIN Callout */}
              {booking?.delivery_otp && booking.booking_status !== 'delivered' && booking.booking_status !== 'cancelled' && (
                <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-4 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider block">
                      {t('deliveryPin')}
                    </span>
                    <p className="text-[11px] text-blue-100 mt-0.5">
                      {lang === 'ta'
                        ? 'சிலிண்டர் பெற்ற பிறகு டெலிவரி முகவரிடம் இந்த பின் எண்ணைக் கூறவும்.'
                        : 'Share this PIN with delivery agent only upon receiving cylinder.'}
                    </p>
                  </div>
                  <div className="bg-white text-indigo-950 font-mono text-2xl font-black px-4 py-2 rounded-xl tracking-widest shadow-inner">
                    {booking.delivery_otp}
                  </div>
                </div>
              )}

              {/* Delivery Agent Information Card */}
              {booking?.delivery_person_name && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{t('deliveryAgent')}</span>
                      <p className="font-bold text-slate-900">{booking.delivery_person_name}</p>
                      <p className="text-[11px] text-slate-500">TVS King Cargo (TN-02-AK-9812)</p>
                    </div>
                  </div>
                  {booking.delivery_person_phone && (
                    <a
                      href={`tel:${booking.delivery_person_phone}`}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                  )}
                </div>
              )}

              {/* Multi-Stage Visual Stepper Timeline */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {lang === 'ta' ? 'விநியோக கட்டங்கள்' : 'Fulfillment Milestones'}
                </h4>
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {stages.map((stage, idx) => {
                    const isDone = stage.completed;
                    const isActive = stage.active;
                    return (
                      <div key={idx} className="relative flex items-start gap-3">
                        <div
                          className={`absolute -left-6 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white ${
                            stage.error
                              ? 'bg-red-600'
                              : isDone
                              ? 'bg-emerald-600'
                              : isActive
                              ? 'bg-blue-600 animate-pulse'
                              : 'bg-slate-300'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1">
                          <p className={`text-xs font-bold ${isActive ? 'text-blue-700' : 'text-slate-800'}`}>
                            {lang === 'ta' ? stage.labelTa || stage.label : stage.label}
                          </p>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{stage.time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cancellation Option */}
              {['booking_pending', 'booking_confirmed'].includes(booking?.booking_status) && (
                <div className="pt-2 border-t border-slate-100">
                  {showCancelConfirm ? (
                    <div className="bg-red-50 border border-red-200 p-3 rounded-xl space-y-2">
                      <p className="text-xs text-red-800 font-bold">
                        {lang === 'ta' ? 'முன்பதிவை ரத்து செய்ய உறுதிப்படுத்தவும்:' : 'Confirm Booking Cancellation:'}
                      </p>
                      <input
                        type="text"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Reason for cancellation"
                        className="w-full px-3 py-1.5 rounded-lg border border-red-300 text-xs bg-white"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowCancelConfirm(false)}
                          className="w-1/2 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleCancelBooking}
                          className="w-1/2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold py-1.5"
                        >
                          Confirm Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="text-xs text-red-600 hover:text-red-700 font-semibold underline"
                    >
                      {t('cancelBookingBtn')}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
