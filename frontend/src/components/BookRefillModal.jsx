import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Flame,
  CheckCircle2,
  AlertCircle,
  Truck,
  CreditCard,
  Banknote,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function BookRefillModal({ isOpen, onClose, connection, onBooked }) {
  const { t, lang } = useAuth();
  const [cylinderType, setCylinderType] = useState('14.2kg');
  const [paymentMode, setPaymentMode] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookedDetails, setBookedDetails] = useState(null);

  if (!isOpen || !connection) return null;

  const prices = {
    '14.2kg': Number(connection.cylinder_price_14kg || 803.00),
    '5kg': 310.00,
    '19kg': 1740.00,
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.bookRefill({
        connectionId: connection.id,
        cylinderType,
        paymentMode,
        deliveryAddress: connection.delivery_address,
        language: lang,
      });

      if (res.success) {
        setBookedDetails(res.booking);
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
        if (onBooked) onBooked(res.booking);
      }
    } catch (err) {
      setError(err.data?.error || err.message || 'Booking failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {lang === 'ta' ? 'சிலிண்டர் முன்பதிவு' : 'Book LPG Cylinder Refill'}
              </h3>
              <p className="text-xs text-slate-400">
                {connection.provider_name} ({connection.masked_consumer_number || connection.consumer_number})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {bookedDetails ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-slate-900">
                  {lang === 'ta' ? 'முன்பதிவு வெற்றிகரமாக முடிந்தது!' : 'Refill Booking Confirmed!'}
                </h4>
                <p className="text-xs text-slate-600 mt-1 font-mono font-bold text-blue-700">
                  Ref: {bookedDetails.bookingReference}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Payable Amount:</span>
                  <span className="font-bold text-slate-800">₹{bookedDetails.amountPayable}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Expected Delivery:</span>
                  <span className="font-bold text-emerald-700">
                    {new Date(bookedDetails.estimatedDeliveryDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery Handover PIN (OTP):</span>
                  <span className="font-mono font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {bookedDetails.deliveryOtp}
                  </span>
                </div>
                <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-200">
                  📱 Confirmation email sent to to {connection.registered_mobile}.
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleBook} className="space-y-4">
              {/* Cylinder Type Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  {lang === 'ta' ? 'சிலிண்டர் வகை தேர்வு' : 'Select Cylinder Size'}
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: '14.2kg', label: '14.2 kg Domestic', desc: 'Standard', price: prices['14.2kg'] },
                    { id: '5kg', label: '5 kg Chhotu', desc: 'Mini FTL', price: prices['5kg'] },
                    { id: '19kg', label: '19 kg Commercial', desc: 'Business', price: prices['19kg'] },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCylinderType(c.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        cylinderType === c.id
                          ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-900">{c.label}</div>
                      <div className="text-[10px] text-slate-500">{c.desc}</div>
                      <div className="text-xs font-extrabold text-blue-700 mt-2">
                        ₹{c.price.toFixed(2)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Address Review */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('deliveryAddress')}
                </label>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                  {connection.delivery_address || 'Kaveri Towers, Anna Nagar West, Chennai - 600040'}
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  {t('paymentMode')}
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('cod')}
                    className={`p-3 rounded-xl border-2 flex items-center gap-2.5 text-xs font-bold transition-all ${
                      paymentMode === 'cod'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>Cash on Delivery</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode('online_upi')}
                    className={`p-3 rounded-xl border-2 flex items-center gap-2.5 text-xs font-bold transition-all ${
                      paymentMode === 'online_upi'
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>Bharat BillPay / UPI</span>
                  </button>
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-200">
                <span className="text-xs text-slate-600 font-semibold">Total Payable Amount:</span>
                <span className="text-lg font-extrabold text-slate-900">
                  ₹{prices[cylinderType].toFixed(2)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2.5 border border-slate-300 font-bold rounded-xl text-xs text-slate-700 hover:bg-slate-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-transform active:scale-98 flex items-center justify-center gap-2"
                >
                  {loading ? t('loading') : (
                    <>
                      <Truck className="w-4 h-4" />
                      <span>{t('bookNowBtn')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
