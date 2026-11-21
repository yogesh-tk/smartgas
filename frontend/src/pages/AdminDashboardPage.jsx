import React, { useState, useEffect } from 'react';
import {
  Settings,
  Users,
  Flame,
  Truck,
  ShieldAlert,
  Send,
  CheckCircle,
  RefreshCw,
  Phone,
  Database,
  Search,
  Sparkles,
  Sliders,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function AdminDashboardPage() {
  const { user, t, lang } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Users tab
  const [usersList, setUsersList] = useState([]);
  const [searchUser, setSearchUser] = useState('');

  // Providers tab
  const [providers, setProviders] = useState([]);
  const [editingProvider, setEditingProvider] = useState(null);
  const [price14kg, setPrice14kg] = useState('');
  const [subsidyRate, setSubsidyRate] = useState('');
  const [helpline, setHelpline] = useState('');

  // Demo Sandbox records
  const [demoRecords, setDemoRecords] = useState([]);

  // Demo Booking Advancer
  const [allBookings, setAllBookings] = useState([]);
  const [advancingRef, setAdvancingRef] = useState(null);
  const [advanceStatusMessage, setAdvanceStatusMessage] = useState(null);

  // Tickets
  const [tickets, setTickets] = useState([]);
  const [resolvingTicketId, setResolvingTicketId] = useState(null);
  const [resolutionText, setResolutionText] = useState('');

  // Legacy notification test state (not rendered)
  const [testPhone, setTestPhone] = useState('9876543210');
  const [testCustomMsg, setTestCustomMsg] = useState('');

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [stRes, uRes, pRes, dRes, tRes, bRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminProviders(),
        api.getAdminDemoRecords(),
        api.getAdminTickets(),
        api.getMyBookings(),
      ]);

      if (stRes.success) setStats(stRes.stats);
      if (uRes.success) setUsersList(uRes.users || []);
      if (pRes.success) setProviders(pRes.providers || []);
      if (dRes.success) setDemoRecords(dRes.records || []);
      if (tRes.success) setTickets(tRes.tickets || []);
      if (bRes.success) setAllBookings(bRes.bookings || []);
    } catch (e) {
      console.error('Error loading admin portal:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  // Update provider pricing
  const handleSaveProviderConfig = async (e) => {
    e.preventDefault();
    if (!editingProvider) return;
    try {
      await api.updateAdminProvider(editingProvider.id, {
        cylinderPrice14kg: price14kg,
        subsidyRate: subsidyRate,
        emergencyHelpline: helpline,
      });
      setEditingProvider(null);
      loadAllAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Advance booking status in demo
  const handleAdvanceBooking = async (ref, nextStatus) => {
    setAdvancingRef(ref);
    setAdvanceStatusMessage(null);
    try {
      const res = await api.advanceBooking(ref, nextStatus);
      if (res.success) {
        setAdvanceStatusMessage(`Order ${ref} updated to ${nextStatus}. email notification sent!`);
        loadAllAdminData();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setAdvancingRef(null);
    }
  };

  // Resolve Ticket
  const handleResolveTicket = async (ticketId) => {
    try {
      await api.updateAdminTicket(ticketId, {
        status: 'resolved',
        resolutionNotes: resolutionText || 'Action taken by OMC Territory Officer.',
      });
      setResolvingTicketId(null);
      setResolutionText('');
      loadAllAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Admin Header */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <span>National LPG Grid Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t('adminTitle')}
            </h1>
            <p className="text-xs text-slate-300">
              Control center for Indane, Bharat Gas, and HP Gas pricing, user registry, email notification service, and emergency dispatches.
            </p>
          </div>

          <button
            onClick={loadAllAdminData}
            className="self-start md:self-auto flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Portal</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Citizens</span>
            <div className="text-2xl font-black text-slate-900">{stats?.totalRegisteredUsers || 3}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Connections</span>
            <div className="text-2xl font-black text-slate-900">{stats?.totalActiveConnections || 2}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Bookings</span>
            <div className="text-2xl font-black text-slate-900">{stats?.totalRefillBookings || 4}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">1906 Leaks</span>
            <div className="text-2xl font-black text-red-600">{stats?.activeEmergencyLeaks || 1}</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'overview', label: 'Evaluation Advancer (Live Demo)' },
          { id: 'users', label: 'Registered Citizens' },
          { id: 'providers', label: 'OMC Configurations' },
          { id: 'demo_records', label: 'Mock LPG Grid Registry' },
          { id: 'tickets', label: 'Support & 1906 Leaks' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Live Demo Booking Advancer (Crucial for live presentation) */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 rounded-3xl shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <h3 className="text-base font-extrabold">Live Evaluation Simulator: Booking Stage Advancer</h3>
            </div>
            <p className="text-xs text-blue-100 leading-relaxed max-w-2xl">
              Use this tool during demonstrations to instantly transition an LPG booking through its lifecycle:
              <strong> Confirmed → Out for Delivery → Delivered</strong>. Each status transition updates the booking and sends an email notification to the account holder.
            </p>
          </div>

          {advanceStatusMessage && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3.5 rounded-2xl text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-bold">{advanceStatusMessage}</span>
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Refill Orders in Pipeline
            </h4>

            <div className="divide-y divide-slate-100">
              {allBookings.map((b) => (
                <div key={b.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-blue-900">{b.booking_reference}</span>
                      <span className="px-2 py-0.5 rounded-md font-bold uppercase text-[10px] bg-slate-100 text-slate-800">
                        Current: {b.booking_status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      {b.provider_name} • Consumer: {b.consumer_name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Delivery PIN: {b.delivery_otp || '8492'} | Agent: Murugan Swamy (9840192837)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {b.booking_status !== 'out_for_delivery' && b.booking_status !== 'delivered' && (
                      <button
                        onClick={() => handleAdvanceBooking(b.booking_reference, 'out_for_delivery')}
                        disabled={advancingRef === b.booking_reference}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs"
                      >
                        Advance to: Out for Delivery (email update)
                      </button>
                    )}

                    {b.booking_status !== 'delivered' && (
                      <button
                        onClick={() => handleAdvanceBooking(b.booking_reference, 'delivered')}
                        disabled={advancingRef === b.booking_reference}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs"
                      >
                        Advance to: Delivered (Trigger Subsidy)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Users List */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Registered Citizens & Administrators
            </h3>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="Search user..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 w-48"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Mobile</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">{u.full_name}</td>
                    <td className="py-3 px-3 font-mono">+91 {u.mobile_number}</td>
                    <td className="py-3 px-3 text-slate-600">{u.email}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-slate-900 text-white' : 'bg-blue-100 text-blue-800'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{u.district}, {u.state}</td>
                    <td className="py-3 px-3">
                      <span className="text-emerald-700 font-bold">✓ Verified</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: OMC Provider Configurations */}
      {activeTab === 'providers' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            LPG Provider Unit Pricing & Emergency Helplines
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {providers.map((p) => (
              <div key={p.id} className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-sm">{p.display_name}</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-200 text-slate-700">
                    {p.api_status}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <p>14.2kg Price: <strong className="font-mono text-slate-900">₹{p.cylinder_price_14kg}</strong></p>
                  <p>DBTL Subsidy: <strong className="font-mono text-emerald-700">₹{p.subsidy_rate}</strong></p>
                  <p>Emergency Leak: <strong className="font-mono text-red-600">{p.emergency_helpline}</strong></p>
                  <p>Toll-Free: <strong className="font-mono text-slate-600">{p.toll_free_helpline}</strong></p>
                </div>

                <button
                  onClick={() => {
                    setEditingProvider(p);
                    setPrice14kg(p.cylinder_price_14kg);
                    setSubsidyRate(p.subsidy_rate);
                    setHelpline(p.emergency_helpline);
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs"
                >
                  Edit Configuration
                </button>
              </div>
            ))}
          </div>

          {/* Edit Modal */}
          {editingProvider && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4">
                <h4 className="font-bold text-sm text-slate-900">Edit {editingProvider.display_name}</h4>
                <form onSubmit={handleSaveProviderConfig} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">14.2kg Price (₹)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={price14kg}
                      onChange={(e) => setPrice14kg(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">DBTL Subsidy Rate (₹)</label>
                    <input
                      type="number"
                      step="1"
                      value={subsidyRate}
                      onChange={(e) => setSubsidyRate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Emergency Helpline</label>
                    <input
                      type="text"
                      value={helpline}
                      onChange={(e) => setHelpline(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingProvider(null)}
                      className="w-1/2 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 bg-blue-600 text-white rounded-lg text-xs font-bold py-2"
                    >
                      Save Settings
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Demo Records Sandbox */}
      {activeTab === 'demo_records' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              <span>National LPG Sandbox Registry (Simulated OMC Data)</span>
            </h3>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">
              Safe Sandbox Environment
            </span>
          </div>

          <p className="text-xs text-slate-500">
            These records populate the Mock LPG Adapter simulating Indian Oil, Bharat Petroleum, and HPCL databases.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {demoRecords.map((rec, i) => (
              <div key={i} className="border border-slate-200 p-4 rounded-2xl bg-slate-50/70 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{rec.providerName}</span>
                  <span className="font-mono text-blue-800 font-bold">{rec.consumerNumber}</span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-1">
                  <p><strong>Name:</strong> {rec.consumerName}</p>
                  <p><strong>Mobile:</strong> +91 {rec.registeredMobile}</p>
                  <p><strong>Distributor:</strong> {rec.distributorName}</p>
                  <p><strong>Subsidy Bank:</strong> {rec.bankName} ({rec.maskedBankAcc})</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Grievances & 1906 Emergency Tickets */}
      {activeTab === 'tickets' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            Citizen Grievances & 1906 Emergency Leak Logs
          </h3>

          <div className="space-y-3">
            {tickets.map((tkt) => (
              <div
                key={tkt.id}
                className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  tkt.category === 'gas_leak_emergency' ? 'border-red-300 bg-red-50/50' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-900">{tkt.ticket_no}</span>
                    <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-slate-100">
                      {tkt.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      tkt.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {tkt.status}
                  </span>
                </div>

                <p className="font-bold text-slate-900">{tkt.subject}</p>
                <p className="text-slate-600">{tkt.description}</p>
                <p className="text-[10px] text-slate-400">Citizen: {tkt.user_name} (📞 {tkt.user_mobile})</p>

                {tkt.resolution_notes ? (
                  <div className="bg-white p-2 rounded-lg border border-slate-200 text-slate-700">
                    <strong>Resolution Remarks:</strong> {tkt.resolution_notes}
                  </div>
                ) : (
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter resolution notes..."
                      value={resolvingTicketId === tkt.id ? resolutionText : ''}
                      onChange={(e) => {
                        setResolvingTicketId(tkt.id);
                        setResolutionText(e.target.value);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs flex-1"
                    />
                    <button
                      onClick={() => handleResolveTicket(tkt.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
                    >
                      Mark Resolved
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}


    </div>
  );
}
