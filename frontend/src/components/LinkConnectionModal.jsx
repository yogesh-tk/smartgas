import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Flame,
  CheckCircle,
  AlertCircle,
  KeyRound,
  Phone,
  Shield,
  ArrowRight,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function LinkConnectionModal({ isOpen, onClose, onLinked }) {
  const { t, lang } = useAuth();
  const [step, setStep] = useState(1);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('indane');

  // Form State
  const [consumerNumber, setConsumerNumber] = useState('');
  const [registeredMobile, setRegisteredMobile] = useState('');
  const [relationshipType, setRelationshipType] = useState('self');
  const [consumerName, setConsumerName] = useState('');
  const [otp, setOtp] = useState('');

  // UI status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verificationData, setVerificationData] = useState(null);

  // Pre-load providers
  useEffect(() => {
    if (isOpen) {
      api.getProviders().then((res) => {
        if (res.success) setProviders(res.providers || []);
      }).catch(console.error);
      setStep(1);
      setError(null);
      setOtp('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Step 1 -> 2: Send OTP via email
  const handleVerifyAndSendOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.verifyConsumer({
        providerId: selectedProvider,
        consumerNumber: consumerNumber.trim(),
        registeredMobile: registeredMobile.trim(),
        language: lang,
      });

      if (res.success) {
        setVerificationData(res.consumer);
        setConsumerName(res.consumer?.consumerName || '');
        setStep(3); // Go to OTP verification step
      }
    } catch (err) {
      setError(err.data?.error || err.message || 'Consumer verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3 -> 4: Verify OTP & Link Connection
  const handleConfirmLink = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.linkConnection({
        providerId: selectedProvider,
        consumerNumber: consumerNumber.trim(),
        registeredMobile: registeredMobile.trim(),
        otp: otp.trim(),
        relationshipType,
        consumerName: consumerName || verificationData?.consumerName,
        distributorName: verificationData?.distributorName,
        deliveryAddress: verificationData?.deliveryAddress,
      });

      if (res.success) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        if (onLinked) onLinked(res.connectionId);
        onClose();
      }
    } catch (err) {
      setError(err.data?.error || err.message || 'Connection linking failed.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill sample demo values for seamless evaluation
  const setDemoSample = (provider, cNo, mob, rel) => {
    setSelectedProvider(provider);
    setConsumerNumber(cNo);
    setRegisteredMobile(mob);
    setRelationshipType(rel);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-emerald-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
              <Flame className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{t('linkTitle')}</h3>
              <p className="text-xs text-slate-300">{t('linkSubtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Stepper */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className={`font-bold ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
            1. {lang === 'ta' ? 'நிறுவனம்' : 'Provider'}
          </span>
          <span className="text-slate-300">→</span>
          <span className={`font-bold ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
            2. {lang === 'ta' ? 'நுகர்வோர் எண்' : 'Consumer Details'}
          </span>
          <span className="text-slate-300">→</span>
          <span className={`font-bold ${step >= 3 ? 'text-blue-600' : 'text-slate-400'}`}>
            3. {lang === 'ta' ? 'Email OTP' : 'Email OTP Verification'}
          </span>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Pre-fills */}
          {step <= 2 && (
            <div className="mb-5 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                ⚡ {lang === 'ta' ? 'விரைவு சோதனை மாதிரி நுகர்வோர் எண்கள்:' : 'Instant Test Sample Records:'}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setDemoSample('indane', 'IND-7009412', '9876543210', 'self')}
                  className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 rounded-lg text-[11px] font-semibold"
                >
                  🔥 Indane: IND-7009412 (Self)
                </button>
                <button
                  type="button"
                  onClick={() => setDemoSample('bharat_gas', 'BHT-5541908', '9876543211', 'father')}
                  className="px-2.5 py-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-lg text-[11px] font-semibold"
                >
                  🟡 Bharat: BHT-5541908 (Father)
                </button>
                <button
                  type="button"
                  onClick={() => setDemoSample('hp_gas', 'HP-9902184', '9876543212', 'spouse')}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-[11px] font-semibold"
                >
                  🔵 HP Gas: HP-9902184 (Spouse)
                </button>
              </div>
            </div>
          )}

          {/* Step 1 & 2: Select Provider & Enter Consumer Details */}
          {step <= 2 && (
            <form onSubmit={handleVerifyAndSendOtp} className="space-y-4">
              {/* Provider Selection Cards */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  {t('selectProvider')}
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'indane', name: 'Indane Gas', color: 'border-orange-500 bg-orange-50/40 text-orange-700', active: selectedProvider === 'indane' },
                    { id: 'bharat_gas', name: 'Bharat Gas', color: 'border-yellow-500 bg-yellow-50/40 text-yellow-800', active: selectedProvider === 'bharat_gas' },
                    { id: 'hp_gas', name: 'HP Gas', color: 'border-blue-600 bg-blue-50/40 text-blue-700', active: selectedProvider === 'hp_gas' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProvider(p.id)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        p.active
                          ? `${p.color} ring-2 ring-offset-1 ring-blue-500 font-bold scale-[1.02]`
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <Flame className="w-5 h-5 mx-auto mb-1 text-current" />
                      <div className="text-xs font-bold leading-tight">{p.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Consumer Number Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('consumerNo')} *
                </label>
                <input
                  type="text"
                  required
                  value={consumerNumber}
                  onChange={(e) => setConsumerNumber(e.target.value)}
                  placeholder={t('consumerNumberPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs font-mono uppercase"
                />
              </div>

              {/* Registered Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'ta' ? 'பதிவுசெய்த மொபைல் எண்' : 'Registered Mobile Number'} *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-semibold">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={registeredMobile}
                    onChange={(e) => setRegisteredMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Relationship Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'ta' ? 'இணைப்பு யாருடையது?' : 'Whose Connection is This?'}
                </label>
                <select
                  value={relationshipType}
                  onChange={(e) => setRelationshipType(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs"
                >
                  <option value="self">{t('relationshipSelf')}</option>
                  <option value="father">{t('relationshipFather')}</option>
                  <option value="mother">{t('relationshipMother')}</option>
                  <option value="spouse">{t('relationshipSpouse')}</option>
                  <option value="son">Son</option>
                  <option value="daughter">Daughter</option>
                  <option value="sibling">Sibling</option>
                  <option value="other">{t('relationshipOther')}</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-transform active:scale-98"
              >
                {loading ? t('loading') : (
                  <>
                    <span>{t('sendOtpBtn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 3: Email OTP Verification */}
          {step === 3 && (
            <form onSubmit={handleConfirmLink} className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Consumer Record Verified in National Grid</span>
                </div>
                <div className="space-y-0.5 text-[11px] text-emerald-800">
                  <p><strong>Name:</strong> {verificationData?.consumerName}</p>
                  <p><strong>Agency:</strong> {verificationData?.distributorName}</p>
                  <p><strong>Address:</strong> {verificationData?.deliveryAddress}</p>
                </div>
              </div>

              {/* Email notification Dispatch Badge */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-center justify-between">
                <div>
                  <span className="font-bold flex items-center gap-1.5">
                    📱 Email verification sent via Brevo
                  </span>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    Sent to your registered account email
                  </p>
                </div>
              </div>

              {/* OTP Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'ta' ? '6 இலக்க OTP எண்ணை உள்ளிடவும்' : 'Enter 6-Digit Ownership Verification OTP'} *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-center text-lg font-mono tracking-widest font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 py-2.5 px-3 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.length < 4}
                  className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-transform active:scale-98 flex items-center justify-center gap-2"
                >
                  {loading ? t('loading') : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{t('verifyAndLinkBtn')}</span>
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
