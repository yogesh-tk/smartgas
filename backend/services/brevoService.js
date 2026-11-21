const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

async function sendEmail({ to, subject, htmlContent, textContent }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || 'Bharat Scheme';

  if (!apiKey || !senderEmail) {
    throw new Error('Brevo is not configured. Add BREVO_API_KEY and BREVO_SENDER_EMAIL to backend/.env.');
  }

  const response = await fetch(BREVO_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent,
      textContent,
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || `Brevo email failed (${response.status})`);
  }
  return result;
}

async function sendVerificationOtp({ email, name, otp }) {
  return sendEmail({
    to: email,
    subject: 'Your Bharat Scheme email verification code',
    textContent: `Hello ${name}, your Bharat Scheme verification code is ${otp}. It expires in 10 minutes. Do not share this code.`,
    htmlContent: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#172033"><h2>Bharat Scheme</h2><p>Hello ${String(name).replace(/[<>&"]/g, '')},</p><p>Use this code to verify your email address:</p><div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:16px;background:#f1f5f9;text-align:center;border-radius:12px">${otp}</div><p>This code expires in <b>10 minutes</b>. Do not share it with anyone.</p></div>`,
  });
}

module.exports = { sendEmail, sendVerificationOtp };