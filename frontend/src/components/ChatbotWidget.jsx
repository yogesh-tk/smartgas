import React, { useState } from 'react';
import { Bot, X, Send, Sparkles, LoaderCircle } from 'lucide-react';
import { api } from '../api';

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: 'வணக்கம்! I’m your Bharat Scheme assistant. Ask me about LPG booking, connections, subsidy or portal support.' },
  ]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || loading) return;
    const next = [...messages, { role: 'user', text: message }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const history = next.slice(-10).map(({ role, text }) => ({ role, text }));
      const result = await api.chat({ message, history: history.slice(0, -1) });
      setMessages((current) => [...current, { role: 'model', text: result.reply }]);
    } catch (error) {
      setMessages((current) => [...current, { role: 'model', text: error.message || 'Sorry, I could not connect. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[100]">
      {open && (
        <section className="mb-3 flex h-[min(620px,75vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <header className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-white/10 p-2"><Bot className="h-5 w-5 text-amber-300" /></span>
              <div><p className="text-sm font-bold">Bharat AI Assistant</p><p className="text-[11px] text-slate-300">Powered by Gemini AI</p></div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chatbot" className="rounded-lg p-2 hover:bg-white/10"><X size={18} /></button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3">
            {messages.map((item, index) => (
              <div key={`${index}-${item.role}`} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3 py-2.5 text-sm leading-relaxed ${item.role === 'user' ? 'rounded-br-sm bg-blue-600 text-white' : 'rounded-bl-sm border border-slate-200 bg-white text-slate-800'}`}>
                  {item.text}
                </div>
              </div>
            ))}
            {loading && <div className="flex items-center gap-2 text-xs text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" /> Thinking...</div>}
          </div>
          <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-slate-200 bg-white p-3">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything..." maxLength={4000} className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
            <button disabled={loading || !input.trim()} aria-label="Send message" className="rounded-xl bg-blue-600 p-3 text-white hover:bg-blue-700 disabled:opacity-50"><Send size={17} /></button>
          </form>
          <p className="px-3 pb-2 text-center text-[10px] text-slate-400">AI responses may be inaccurate. Do not share OTPs or passwords.</p>
        </section>
      )}
      <button onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close AI assistant' : 'Open AI assistant'} className="ml-auto flex items-center gap-2 rounded-full bg-blue-700 px-5 py-3.5 text-sm font-bold text-white shadow-xl transition hover:bg-blue-800">
        {open ? <X size={19} /> : <><Sparkles size={18} /> Ask AI</>}
      </button>
    </div>
  );
}