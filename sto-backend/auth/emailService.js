const RESEND_API_KEY = (process.env.RESEND_API_KEY || '').trim();
const FROM_EMAIL = (process.env.FROM_EMAIL || '').trim();
const APP_URL = (process.env.APP_URL || 'http://localhost:3000').trim();

let resendClient = null;

const getEmailServiceStatus = () => {
  const missing = [];
  if (!RESEND_API_KEY) missing.push('RESEND_API_KEY');
  if (!FROM_EMAIL) missing.push('FROM_EMAIL');

  return {
    provider: 'resend',
    configured: missing.length === 0,
    missing,
    fromEmail: FROM_EMAIL || null,
    appUrl: APP_URL,
  };
};

const getResendClient = () => {
  if (resendClient) return resendClient;

  const status = getEmailServiceStatus();
  if (!status.configured) {
    return null;
  }

  try {
    const { Resend } = require('resend');
    resendClient = new Resend(RESEND_API_KEY);
    return resendClient;
  } catch (e) {
    console.error('[EMAIL] Не вдалося ініціалізувати resend:', e.message);
    return null;
  }
};

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
      <p style="font-size:12px;color:#94a3b8;margin-top:24px;">
        Якщо ви не запитували скидання — просто ігноруйте цей лист.
      </p>
    </div>`;
  const text = `Скидання паролю\n\nПерейдіть за посиланням, щоб встановити новий пароль (дійсне 1 годину):\n${resetUrl}\n\nЯкщо ви не запитували скидання — ігноруйте лист.`;

  const client = getResendClient();
  const status = getEmailServiceStatus();

  if (!client) {
    console.warn('[EMAIL][DEV] Email provider не налаштований. Лист НЕ відправлено.');
    console.log(`[EMAIL][DEV] Кому: ${toEmail}`);
    console.log(`[EMAIL][DEV] Лінк скидання: ${resetUrl}`);
    return {
      sent: false,
      deliveryMode: 'disabled',
      provider: 'resend',
      resetUrl,
      config: status,
    };
  }

  try {
    const result = await client.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject,
      html,
      text,
    });

    if (result?.error) {
      console.error('[EMAIL][RESEND_ERROR]', JSON.stringify(result.error));
      throw new Error(result.error.message || 'Resend повернув помилку');
    }

    const messageId = result?.data?.id || result?.id || null;
    if (!messageId) {
      console.warn('[EMAIL][NO_ID] Resend повернув успіх без id. Повна відповідь:', JSON.stringify(result));
    }
    console.log(`[EMAIL] Лист скидання надіслано на ${toEmail}`, messageId || '(no id)');

    return {
      sent: true,
      deliveryMode: 'email',
      provider: 'resend',
      messageId,
    };
  } catch (err) {
    console.error('[EMAIL] Помилка Resend:', err.message);
    if (err.response) {
      console.error('[EMAIL] Resend response data:', JSON.stringify(err.response?.data || {}));
    }
    throw new Error('Не вдалося надіслати лист');
  }
};

module.exports = { sendPasswordResetEmail, getEmailServiceStatus };
