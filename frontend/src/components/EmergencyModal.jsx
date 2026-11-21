import React, { useState } from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function EmergencyModal({ isOpen, onClose }) {
  const { t, lang } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [ticketCreated, setTicketCreated] = useState(null);

  if (!isOpen) return null;

  const handleReportEmergency = async () => {
    setSubmitting(true);
    try {
      const res = await api.createTicket({
        subject: 'EMERGENCY: Gas Leak Reported Near Cylinder',
        category: 'gas_leak_emergency',
        priority: 'critical',
        description: 'Citizen triggered immediate emergency protocol for suspected gas leak via Bharat Scheme emergency button.',
      });
      if (res.success) {
        setTicketCreated(res.ticketNo);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border-4 border-red-500 overflow-hidden">
        {/* Header */}
        <div className="bg-red-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white text-red-600 p-2 rounded-xl">
              <ShieldAlert className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold">
                {lang === 'ta' ? 'அவசர எரிவாயுக் கசிவு நெறிமுறை' : '24x7 Emergency LPG Leak Response'}
              </h3>
              <p className="text-xs text-red-100">National LPG Emergency Network (All OMCs)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-red-700 p-1.5 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Main 1906 Hotline Action */}
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-700">
              {lang === 'ta' ? 'உடனடி உதவி எண்' : 'National 24x7 Emergency Toll-Free'}
            </span>
            <div className="text-4xl font-extrabold text-red-600 my-1 tracking-wider">
              1906
            </div>
            <p className="text-xs text-red-800 font-medium">
              {lang === 'ta'
                ? 'அனைத்து எரிவாயு நிறுவனங்களுக்கும் (இண்டேன், பாரத், ஹெச்பி) பொதுவான கட்டணமில்லா அவசர உதவி எண்.'
                : 'Universal toll-free emergency number across India for Indane, Bharat Gas, and HP Gas.'}
            </p>
            <a
              href="tel:1906"
              className="mt-3 inline-flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-transform active:scale-95"
            >
              <PhoneCall className="w-5 h-5" />
              {lang === 'ta' ? 'இப்போதே 1906 ஐ அழைக்கவும்' : 'Call 1906 Immediately'}
            </a>
          </div>

          {/* Golden Safety Rules */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              {lang === 'ta' ? 'முக்கிய பாதுகாப்பு முன்னெச்சரிக்கைகள்:' : 'Mandatory Life-Safety Steps:'}
            </h4>
            <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-5">
              <li>{lang === 'ta' ? 'உடனடியாக சிலிண்டர் ரெகுலேட்டர் குமிழியை (Regulator Knob) அணைக்கவும்.' : 'Immediately turn off the cylinder regulator knob.'}</li>
              <li>{lang === 'ta' ? 'மின்சார சுவிட்சுகள், மின்விசிறிகள் எதையும் ஆன்/ஆஃப் செய்யாதீர்கள்.' : 'Do NOT operate any electric switches, lights, or exhaust fans.'}</li>
              <li>{lang === 'ta' ? 'அனைத்து கதவுகள் மற்றும் ஜன்னல்களை திறந்து வைக்கவும்.' : 'Open all windows and doors to let fresh air circulate.'}</li>
              <li>{lang === 'ta' ? 'தீக்குச்சிகள், மெழுகுவர்த்தி அல்லது ஊதுபத்திகளை எரிக்காதீர்கள்.' : 'Extinguish all open flames, stoves, and incense sticks.'}</li>
              <li>{lang === 'ta' ? 'வீட்டிற்கு வெளியே வந்து 1906 அவசர உதவி எண்ணை அழைக்கவும்.' : 'Evacuate family outside the premises and dial 1906.'}</li>
            </ul>
          </div>

          {/* Quick Ticket Response */}
          {ticketCreated ? (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold">Emergency Incident Logged:</span> {ticketCreated}. Regional distributor emergency van alert dispatched.
              </div>
            </div>
          ) : (
            <button
              onClick={handleReportEmergency}
              disabled={submitting}
              className="w-full border-2 border-red-600 text-red-600 hover:bg-red-50 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              {submitting
                ? 'Dispatching Alert...'
                : lang === 'ta'
                ? 'அவசர சம்பவத்தை ஆன்லைனில் பதிவு செய்'
                : 'Log Critical Emergency Ticket on Portal'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
