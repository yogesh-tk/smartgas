import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Flame, Mail, Lock, User, Phone, ShieldCheck, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function LoginPage() {
  const { login, switchDemoUser, lang } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault(); setError(''); setNotice(''); setLoading(true);
    try {
      const result = await api.login({ identifier: email.trim(), password });
      login(result.token, result.user); navigate('/');
    } catch (err) { setError(err.message || 'Login failed.'); }
    finally { setLoading(false); }
  };

  const handleSendOtp = async (event) => {
    event.preventDefault(); setError(''); setNotice(''); setLoading(true);
    try {
      const result = await api.sendEmailOtp({ fullName: fullName.trim(), email: email.trim() });
      setOtpSent(true); setNotice(result.message || 'Verification code sent to your email.');
    } catch (err) { setError(err.message || 'Could not send email verification code.'); }
    finally { setLoading(false); }
  };

  const handleVerifyAndRegister = async (event) => {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      const result = await api.verifyEmailOtp({
        fullName: fullName.trim(), email: email.trim(), mobileNumber: mobileNumber.trim(),
        password, otp: otp.trim(), language: lang,
      });
      login(result.token, result.user); navigate('/');
    } catch (err) { setError(err.message || 'Email verification failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      <header className="bg-white border-b border-slate-200">
        <div className="gov-tricolor-bar" />
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-sky-600 to-emerald-600 flex items-center justify-center text-white"><Flame className="w-5 h-5" /></div>
            <div><span className="font-extrabold text-slate-900">Bharat Scheme</span><p className="text-[10px] text-slate-500">Smart LPG Gas Management System</p></div>
          </Link>
        </div>
      </header>

      <main className="max-w-md w-full mx-auto p-4 my-8">
        <div className="mb-4 rounded-2xl border border-blue-200 bg-white p-4 shadow-sm">
          <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-blue-900"><ShieldCheck size={16} /> Demo access</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button onClick={() => { switchDemoUser('citizen'); navigate('/'); }} className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-left font-bold text-blue-900">Citizen Profile<span className="block text-[10px] font-normal text-slate-500">Demo user</span></button>
            <button onClick={() => { switchDemoUser('admin'); navigate('/'); }} className="rounded-xl border border-slate-700 bg-slate-900 p-3 text-left font-bold text-white">Admin Profile<span className="block text-[10px] font-normal text-slate-300">Demo officer</span></button>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          <div className="bg-slate-900 p-6 text-center text-white">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-amber-400"><Flame size={24} /></div>
            <h2 className="text-xl font-black">{mode === 'register' ? 'Create Citizen Account' : 'Welcome Back'}</h2>
            <p className="text-xs text-slate-300">Email-based secure access</p>
          </div>
          <div className="flex border-b bg-slate-50 text-xs font-bold">
            <button onClick={() => { setMode('login'); setError(''); setNotice(''); }} className={`flex-1 border-b-2 py-3 ${mode === 'login' ? 'border-blue-600 bg-white text-blue-700' : 'border-transparent text-slate-500'}`}>Email Login</button>
            <button onClick={() => { setMode('register'); setError(''); setNotice(''); }} className={`flex-1 border-b-2 py-3 ${mode === 'register' ? 'border-blue-600 bg-white text-blue-700' : 'border-transparent text-slate-500'}`}>Register</button>
          </div>
          <div className="space-y-4 p-6">
            {error && <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700"><AlertCircle size={16} />{error}</div>}
            {notice && <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800"><CheckCircle size={16} />{notice}</div>}

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                <label className="block font-bold text-slate-700">Email Address
                  <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-300 px-3"><Mail size={16} className="text-slate-400" /><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full py-3 outline-none" /></div>
                </label>
                <label className="block font-bold text-slate-700">Password
                  <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-300 px-3"><Lock size={16} className="text-slate-400" /><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" className="w-full py-3 outline-none" /></div>
                </label>
                <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-60">{loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={16} /></button>
              </form>
            ) : (
              <form onSubmit={otpSent ? handleVerifyAndRegister : handleSendOtp} className="space-y-3 text-xs">
                <label className="block font-bold text-slate-700">Full Name
                  <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-300 px-3"><User size={16} className="text-slate-400" /><input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" className="w-full py-3 outline-none" /></div>
                </label>
                <label className="block font-bold text-slate-700">Email Address
                  <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-300 px-3"><Mail size={16} className="text-slate-400" /><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full py-3 outline-none" /></div>
                </label>
                <label className="block font-bold text-slate-700">Mobile Number <span className="font-normal text-slate-400">(optional, no OTP)</span>
                  <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-300 px-3"><Phone size={16} className="text-slate-400" /><input type="tel" maxLength={10} value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))} placeholder="10-digit number" className="w-full py-3 outline-none" /></div>
                </label>
                <label className="block font-bold text-slate-700">Create Password
                  <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-300 px-3"><Lock size={16} className="text-slate-400" /><input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className="w-full py-3 outline-none" /></div>
                </label>
                {otpSent && <label className="block font-bold text-slate-700">Email Verification Code
                  <input required inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="Enter 6-digit code from email" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3 text-center font-mono text-lg tracking-[0.3em] outline-none focus:border-blue-500" />
                </label>}
                <button disabled={loading || (otpSent && otp.length !== 6)} className="w-full rounded-xl bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700 disabled:opacity-60">{loading ? 'Please wait...' : otpSent ? 'Verify Email & Create Account' : 'Send Email Verification Code'}</button>
                {otpSent && <button type="button" onClick={() => { setOtpSent(false); setOtp(''); setNotice(''); }} className="w-full py-1 text-xs font-semibold text-blue-700">Change email / resend code</button>}
              </form>
            )}
            <p className="text-center text-[10px] text-slate-400">No mobile OTP. Email verification is sent securely through Brevo.</p>
          </div>
        </div>
      </main>
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-[10px] text-slate-400">Bharat Scheme • LPG Emergency Helpline 1906</footer>
    </div>
  );
}