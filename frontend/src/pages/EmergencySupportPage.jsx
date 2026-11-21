import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  PhoneCall,
  ShieldAlert,
  Send,
  CheckCircle2,
  Clock,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function EmergencySupportPage() {
  const { user, t, lang } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('delayed_delivery');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const loadTickets = async () => {
    try {
      const res = await api.getMyTickets();
      if (res.success) setTickets(res.tickets || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [user?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await api.createTicket({
        subject,
        category,
        description,
      });

      if (res.success) {
        setSuccessMsg(res.message);
        setSubject('');
        setDescription('');
        loadTickets();
      }
    } catch (err) {
      setErrorMsg(err.data?.error || err.message || 'Failed to submit ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Red Alert Emergency Card */}
      <div className="rounded-3xl bg-gradient-to-r from-red-700 via-rose-800 to-red-900 text-white p-6 sm:p-8 shadow-xl border-4 border-red-500 overflow-hidden relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 animate-ping" />
              <span>National 24x7 Gas Leak Emergency Response</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              {t('emergencyTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-red-100 leading-relaxed font-medium">
              {t('emergencyWarning')}
            </p>
          </div>

          <div className="text-center bg-white text-red-700 p-6 rounded-3xl shadow-2xl flex-shrink-0 border-2 border-red-300">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Universal Toll-Free Emergency Helpline
            </span>
            <div className="text-4xl sm:text-5xl font-black tracking-widest my-1 text-red-600">
              1906
            </div>
            <a
              href="tel:1906"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-md transition-transform active:scale-95"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{t('call1906Btn')}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Grid: Submit Grievance & Past Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Support Ticket Submission Form */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-extrabold text-slate-900">
              {t('submitTicketTitle')}
            </h2>
          </div>

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Category */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t('ticketCategory')} *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs"
              >
                <option value="delayed_delivery">Delayed Refill Delivery (டெலிவரி தாமதம்)</option>
                <option value="gas_leak_emergency">Gas Leak / Valve Issue (அவசர கசிவு)</option>
                <option value="subsidy_issue">DBTL Subsidy Not Credited (மானியம் வரவில்லை)</option>
                <option value="kyc_verification">KYC / Connection Transfer (KYC சரிபார்ப்பு)</option>
                <option value="meter_cylinder_defect">Cylinder Weight / Seal Defect (எடை குறைபாடு)</option>
                <option value="general">General Inquiry (பொதுவான சந்தேகம்)</option>
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t('ticketSubject')} *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your grievance..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs"
              >
              </input>
            </div>

            {/* Description */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t('ticketDescription')} *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide detailed description including booking reference or cylinder details..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : t('submitTicketBtn')}</span>
            </button>
          </form>
        </div>

        {/* Existing Tickets List */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-600" />
              <span>My Grievance Tickets</span>
            </h2>
            <span className="text-xs text-slate-400 font-bold">{tickets.length} total</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {tickets.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No active tickets registered.
              </div>
            ) : (
              tickets.map((tkt) => (
                <div
                  key={tkt.id}
                  className={`p-4 rounded-2xl border text-xs space-y-2 ${
                    tkt.category === 'gas_leak_emergency'
                      ? 'border-red-300 bg-red-50/40'
                      : 'border-slate-200 bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-900">{tkt.ticket_no}</span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                        tkt.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tkt.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {tkt.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900">{tkt.subject}</h4>
                  <p className="text-slate-600 leading-relaxed text-[11px]">{tkt.description}</p>

                  {tkt.resolution_notes && (
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-800">
                      <strong className="text-emerald-700">OMC Officer Response:</strong> {tkt.resolution_notes}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Priority: {tkt.priority.toUpperCase()}</span>
                    <span>{new Date(tkt.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
