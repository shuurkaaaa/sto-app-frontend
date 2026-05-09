/**
 * Сервіс відправки email через Resend.
 * Якщо RESEND_API_KEY не заданий — лог у консоль (dev fallback).
 */
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

let resendClient = null;
if (RESEND_API_KEY) {
  try {
    const { Resend } = require('resend');
    resendClient = new Resend(RESEND_API_KEY);
  } catch (e) {
    console.error('[EMAIL] Не вдалося ініціалізувати resend:', e.message);
  }
}

const sendPasswordResetEmail = async (toEmail, token) => {
  const resetUrl = `${APP_URL}/reset-password/${token}`;

  const subject = 'Скидання паролю — СТО Адмін';
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#0f172a;color:#f1f5f9;border-radius:12px;">
      <h2 style="color:#3B82F6;margin-top:0;">Скидання паролю</h2>
      <p>Ви (або хтось інший) запросили скидання паролю для вашого акаунту.</p>
      <p>Натисніть кнопку нижче, щоб встановити новий пароль. Посилання дійсне 1 годину.</p>
      <p style="text-align:center;margin:32px 0;">
        <a href="${resetUrl}"
           style="background:#3B82F6;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;display:inline-block;">
          Встановити новий пароль
        </a>
      </p>
      <p style="font-size:12px;color:#94a3b8;">
        Якщо кнопка не працює, скопіюйте посилання у браузер:<br/>
        <span style="color:#cbd5e1;word-break:break-all;">${resetUrl}</span>
      </p>
      <p style="font-size:12px;color:#94a3b8;margin-top:24px;">
        Якщо ви не запитували скидання — просто ігноруйте цей лист.
      </p>
    </div>`;
  const text = `Скидання паролю\n\nПерейдіть за посиланням, щоб встановити новий пароль (дійсне 1 годину):\n${resetUrl}\n\nЯкщо ви не запитували скидання — ігноруйте лист.`;

  if (!resendClient) {
    console.warn('[EMAIL][DEV] RESEND_API_KEY не заданий. Лист НЕ відправлено.');
    console.log(`[EMAIL][DEV] Кому: ${toEmail}`);
    console.log(`[EMAIL][DEV] Лінк скидання: ${resetUrl}`);
    return { devMode: true, resetUrl };
  }

  try {
    const result = await resendClient.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject,
      html,
      text,
    });
    console.log(`[EMAIL] Лист скидання надіслано на ${toEmail}`, result?.data?.id || '');
    return { sent: true };
  } catch (err) {
    console.error('[EMAIL] Помилка Resend:', err.message);
    throw new Error('Не вдалося надіслати лист');
  }
};

module.exports = { sendPasswordResetEmail };
