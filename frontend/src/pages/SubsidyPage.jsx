import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ExternalLink,
  Info,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function SubsidyPage() {
  const { user, t, lang } = useAuth();
  const [subsidy, setSubsidy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch subsidy for first connection
    api.getMyConnections().then(async (res) => {
      if (res.success && res.connections?.length > 0) {
        const det = await api.getConnectionDetails(res.connections[0].id);
        if (det.success) {
          setSubsidy(det.subsidy);
        }
      }
    }).finally(() => setLoading(false));
  }, [user?.id]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Header */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 sm:p-8 shadow-xl border border-emerald-900/40">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>DBTL PAHAL (Direct Benefit Transfer for LPG)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('subsidyTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {lang === 'ta'
              ? 'மத்திய அரசின் பஹல் (DBTL) திட்டத்தின் கீழ் நீங்கள் வாங்கும் ஒவ்வொரு சமையல் எரிவாயு சிலிண்டருக்கும் உரிய மானியத் தொகை உங்கள் ஆதார் இணைக்கப்பட்ட வங்கிக் கணக்கில் நேரடியாக வரவு வைக்கப்படும்.'
              : 'Under the Direct Benefit Transfer for LPG (DBTL / PAHAL) scheme, government subsidies are credited straight to your bank account without intermediaries.'}
          </p>
        </div>
      </div>

      {/* Main Grid: Status & Linked Bank */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Aadhaar & NPCI Mapping Status */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Aadhaar Seeding Status</span>
            </h3>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
              NPCI Verified
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Citizen Name:</span>
              <span className="font-bold text-slate-900">{user?.full_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Masked Aadhaar:</span>
              <span className="font-mono font-bold text-blue-900">XXXX-XXXX-5521</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">NPCI Aadhaar Payment Bridge:</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Active & Seeded</span>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Eligible Scheme:</span>
              <span className="font-bold text-slate-800">PAHAL / PM Ujjwala Yojana</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Your connection is compliant with Cash Transfer Compliance (CTC). All LPG subsidies will automatically reach your primary bank account.
          </p>
        </div>

        {/* Card 2: Linked Bank Details */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              <span>{t('linkedBank')}</span>
            </h3>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
              Primary A/C
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Bank Name:</span>
              <span className="font-bold text-slate-900">{subsidy?.linkedBankName || 'State Bank of India'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Account Number:</span>
              <span className="font-mono font-bold text-slate-900">{subsidy?.maskedAccountNumber || 'XXXX-XXXX-4819'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">IFSC Code:</span>
              <span className="font-mono font-bold text-slate-700">{subsidy?.ifscCode || 'SBIN0004128'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Subsidy Per Cylinder:</span>
              <span className="text-sm font-black text-emerald-700 font-mono">₹200.00</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500">Total Subsidies Received (FY 2026-27):</span>
            <span className="font-mono font-black text-emerald-700 text-sm">
              ₹{subsidy?.totalSubsidyReceivedThisFinancialYear || '1200.00'}
            </span>
          </div>
        </div>
      </div>

      {/* Last Subsidy Disbursement Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Latest Subsidy Disbursement Receipt
        </h3>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              ₹
            </div>
            <div>
              <span className="text-[10px] text-emerald-800 font-bold uppercase">Direct Bank Credit</span>
              <h4 className="text-base font-extrabold text-emerald-950">
                ₹200.00 Transferred to SBI Account (4819)
              </h4>
              <p className="text-[11px] text-emerald-700 font-mono">
                Bank UTR: UTR-SBI-2026-991829 • Date: 2026-10-21
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-xl self-start sm:self-auto">
            Credited Successfully
          </span>
        </div>
      </div>
    </div>
  );
}
