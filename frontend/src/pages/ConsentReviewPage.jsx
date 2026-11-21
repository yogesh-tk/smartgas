import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  Flame,
  CheckCircle,
  XCircle,
  ArrowRight,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api';

export default function ConsentReviewPage() {
  const { token } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionDone, setActionDone] = useState(null); // 'granted' | 'rejected'

  useEffect(() => {
    if (token) {
      api.getConsentDetails(token)
        .then((res) => {
          if (res.success) setRequest(res.request);
        })
        .catch((err) => setError(err.data?.error || err.message || 'Invalid or expired consent token.'))
        .finally(() => setLoading(false));
    }
  }, [token]);

  const handleDecision = async (decision) => {
    try {
      const res = await api.respondConsent(token, decision);
      if (res.success) {
        setActionDone(decision);
        if (decision === 'granted') {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }
    } catch (e) {
      setError(e.data?.error || e.message || 'Failed to submit decision.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="gov-tricolor-bar" />
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-700 to-emerald-600 flex items-center justify-center text-white">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-sm">Bharat Scheme</span>
              <p className="text-[10px] text-slate-500">Digital Parivar LPG Consent Gateway</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            Official Consent Verification
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-lg w-full mx-auto p-4 my-8">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <h1 className="text-xl font-black">Family LPG Consent Request</h1>
            <p className="text-xs text-slate-300 mt-1">
              Ministry of Petroleum & Natural Gas Digital Framework
            </p>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Verifying secure consent authorization token...
              </div>
            ) : error ? (
              <div className="p-6 text-center space-y-3">
                <XCircle className="w-12 h-12 text-red-500 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900">Request Not Found</h3>
                <p className="text-xs text-slate-500">{error}</p>
                <Link
                  to="/"
                  className="inline-block mt-3 text-xs font-bold text-blue-600 underline"
                >
                  Return to Home
                </Link>
              </div>
            ) : actionDone ? (
              <div className="py-6 text-center space-y-4">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
                    actionDone === 'granted'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {actionDone === 'granted' ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    {actionDone === 'granted' ? 'Consent Successfully Granted!' : 'Request Declined'}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                    {actionDone === 'granted'
                      ? `${request.inviterName} can now view your refill schedules and book cylinders on your behalf.`
                      : 'You have declined sharing your LPG connection details. No information has been shared.'}
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    to="/"
                    className="inline-block bg-slate-900 text-white font-bold px-6 py-2 rounded-xl text-xs"
                  >
                    Go to Portal Dashboard
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Request Overview */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Inviting Citizen</span>
                    <p className="font-extrabold text-slate-900 text-sm">{request.inviterName}</p>
                    <p className="text-slate-500 font-mono text-[11px]">Mobile: +91 {request.inviterMobile}</p>
                  </div>

                  <div className="border-t border-slate-200 pt-2 grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Relationship</span>
                      <p className="font-bold text-slate-800 capitalize">{request.relationship}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">LPG Provider</span>
                      <p className="font-bold text-blue-900">{request.providerName}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Consumer Number</span>
                    <p className="font-mono font-bold text-slate-900">{request.maskedConsumerNumber}</p>
                  </div>
                </div>

                {/* Permissions being requested */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Permissions Requested:</span>
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5">
                    <li>View cylinder delivery schedule and past refill invoices.</li>
                    <li>Receive automated refill reminders when cylinder level is low.</li>
                    <li>Authorize {request.inviterName} to place cylinder refill bookings on your behalf.</li>
                  </ul>
                </div>

                <div className="text-[11px] text-slate-500 bg-amber-50 border border-amber-200 p-3 rounded-xl">
                  ℹ️ <strong>Note:</strong> You can revoke this consent at any time. Your bank details and passwords are never exposed.
                </div>

                {/* Decisions Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleDecision('rejected')}
                    className="w-1/2 py-2.5 border border-red-300 text-red-600 font-bold rounded-xl text-xs hover:bg-red-50 transition-colors"
                  >
                    Decline Request
                  </button>
                  <button
                    onClick={() => handleDecision('granted')}
                    className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-transform active:scale-95"
                  >
                    Grant Consent
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[10px] text-slate-400 py-4 border-t border-slate-200 bg-white">
        Bharat Scheme • Digital Government Services • Helpline: 1906 (Universal Emergency)
      </footer>
    </div>
  );
}
