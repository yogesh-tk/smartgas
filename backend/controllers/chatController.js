const SYSTEM_PROMPT = `You are Bharat Scheme's helpful LPG portal assistant.
Answer questions about using this portal: LPG connections, refill booking, booking tracking,
subsidy information, family consent, profile and support. Be concise, friendly, and accurate.
Reply in Tamil when the user writes Tamil/Tanglish; otherwise use English.
Never claim to access a user's private account, book a refill, change a record, or check live LPG
provider systems. Explain that account-specific actions must be completed in the portal.
For emergencies involving an LPG leak, tell the user to move to a safe open area, avoid flames
and electrical switches, and call India's LPG emergency helpline 1906.`;

async function chat(req, res) {
  try {
    const { message, history = [] } = req.body;
    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Please enter a message.' });
    }
    if (message.length > 4000) return res.status(413).json({ success: false, error: 'Message is too long.' });
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    if (!apiKey) return res.status(503).json({ success: false, error: 'AI assistant is not configured. Add GEMINI_API_KEY to backend/.env.' });

    const contents = [];
    for (const item of history.slice(-10)) {
      if (!['user', 'model'].includes(item.role) || typeof item.text !== 'string') continue;
      contents.push({ role: item.role, parts: [{ text: item.text.slice(0, 3000) }] });
    }
    contents.push({ role: 'user', parts: [{ text: message.trim() }] });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { temperature: 0.6, maxOutputTokens: 700 },
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('Gemini API error:', result.error?.message || response.status);
      return res.status(response.status === 429 ? 429 : 502).json({
        success: false,
        error: response.status === 429 ? 'AI free-tier limit reached. Please try again later.' : 'AI assistant could not respond right now.',
      });
    }
    const reply = result.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
    if (!reply) return res.status(502).json({ success: false, error: 'The AI returned an empty response. Please try again.' });
    return res.json({ success: true, reply });
  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ success: false, error: 'Unable to contact the AI assistant.' });
  }
}

module.exports = { chat };