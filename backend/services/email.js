const https = require('https');

/**
 * Send email via Brevo REST API (soft-fail — never blocks signup)
 */
function sendEmail({ to, toName, subject, html }) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      sender: { name: 'Pharma Career Hub', email: process.env.FOUNDER_EMAIL },
      to: [{ email: to, name: toName }],
      subject,
      htmlContent: html,
    });

    const options = {
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ Email sent to ${to}`);
          resolve({ success: true });
        } else {
          console.error('Brevo API error:', res.statusCode, data);
          resolve({ success: false });
        }
      });
    });

    req.on('error', (err) => {
      console.error('Email error:', err.message);
      resolve({ success: false });
    });

    req.write(payload);
    req.end();
  });
}

/** Welcome email to user (Arabic) */
function sendWelcomeEmail({ name, email }) {
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
    <body style="margin:0;padding:0;background:#060b14;font-family:'Segoe UI',Tahoma,sans-serif;direction:rtl;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#060b14;padding:40px 16px;">
        <tr><td align="center">
          <table width="100%" style="max-width:560px;background:#0d1a2d;border-radius:20px;border:1px solid rgba(32,84,150,0.3);overflow:hidden;">
            <tr>
              <td style="background:linear-gradient(135deg,#2563eb 0%,#0d9488 100%);padding:36px 32px;text-align:center;">
                <h1 style="margin:0;color:#fff;font-size:24px;font-weight:900;">💊 Pharma Career Hub</h1>
                <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">منصة فرص الصيدلة في مصر</p>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px;">
                <h2 style="margin:0 0 16px;color:#e2eaf5;font-size:22px;font-weight:800;">أهلاً بك يا ${name}! 🎉</h2>
                <p style="margin:0 0 20px;color:#7b9cbf;font-size:16px;line-height:1.8;">تسجيلك وصلنا بنجاح! إنت دلوقتي من أوائل اللي هيعرفوا لما المنصة تطلع.</p>
                <p style="margin:0 0 20px;color:#7b9cbf;font-size:16px;line-height:1.8;">Pharma Career Hub هتجمعلك كل فرص الصيدلة في مصر في مكان واحد — تدريبات، كورسات، وظائف، وبرامج تدريبية.</p>
                <div style="background:rgba(37,99,235,0.1);border:1px solid rgba(37,99,235,0.25);border-radius:12px;padding:20px 24px;margin:24px 0;">
                  <p style="margin:0;color:#93c5fd;font-size:15px;font-weight:700;">⚡ إيه الخطوة الجاية؟</p>
                  <p style="margin:8px 0 0;color:#7b9cbf;font-size:14px;line-height:1.7;">هنتواصل معاك على الواتساب فور ما المنصة تكون جاهزة للإطلاق. ابقى فاتح الرسايل! 📱</p>
                </div>
                <p style="margin:0;color:#7b9cbf;font-size:15px;line-height:1.8;">شكرًا إنك تصدق في الفكرة من البداية 🙏</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid rgba(32,84,150,0.2);text-align:center;">
                <p style="margin:0;color:#3d5a7a;font-size:13px;">Pharma Career Hub © 2026</p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>`;

  return sendEmail({ to: email, toName: name, subject: '🎉 أهلاً بك في Pharma Career Hub!', html });
}

/** Founder notification with stats */
async function sendFounderNotification({ name, whatsapp, email, createdAt }) {
  const Signup = require('../models/Signup');
  const totalSignups = await Signup.countDocuments();
  const totalSeats = 500;
  const remainingSeats = Math.max(0, totalSeats - totalSignups);
  const percent = Math.floor((totalSignups / totalSeats) * 100);

  const formattedDate = new Date(createdAt).toLocaleString('ar-EG', {
    timeZone: 'Africa/Cairo',
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head><meta charset="UTF-8"/></head>
    <body style="margin:0;padding:0;background:#060b14;font-family:'Segoe UI',Tahoma,sans-serif;direction:rtl;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#060b14;padding:40px 16px;">
        <tr><td align="center">
          <table width="100%" style="max-width:560px;background:#0d1a2d;border-radius:20px;border:1px solid rgba(32,84,150,0.3);overflow:hidden;">
            <tr>
              <td style="background:linear-gradient(135deg,#2563eb 0%,#0d9488 100%);padding:28px 32px;text-align:center;">
                <h2 style="margin:0;color:#fff;font-size:20px;font-weight:800;">🚀 New Signup — Pharma Career Hub</h2>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="padding:10px 0;border-bottom:1px solid rgba(32,84,150,0.15);"><span style="color:#3d5a7a;font-size:13px;font-weight:600;">الاسم</span><br/><span style="color:#e2eaf5;font-size:16px;font-weight:700;">${name}</span></td></tr>
                  <tr><td style="padding:10px 0;border-bottom:1px solid rgba(32,84,150,0.15);"><span style="color:#3d5a7a;font-size:13px;font-weight:600;">واتساب</span><br/><span style="color:#e2eaf5;font-size:16px;font-weight:700;">${whatsapp}</span></td></tr>
                  <tr><td style="padding:10px 0;border-bottom:1px solid rgba(32,84,150,0.15);"><span style="color:#3d5a7a;font-size:13px;font-weight:600;">الإيميل</span><br/><span style="color:#e2eaf5;font-size:16px;">${email || '—'}</span></td></tr>
                  <tr><td style="padding:10px 0;"><span style="color:#3d5a7a;font-size:13px;font-weight:600;">تاريخ التسجيل</span><br/><span style="color:#e2eaf5;font-size:14px;">${formattedDate}</span></td></tr>
                </table>
                <div style="background:rgba(13,148,136,0.1);border:1px solid rgba(13,148,136,0.2);border-radius:16px;padding:20px;margin:24px 0;">
                  <h3 style="margin:0 0 12px;color:#14b8a6;font-size:16px;">📊 إحصائيات</h3>
                  <p style="margin:8px 0;color:#e2eaf5;"><strong>✅ إجمالي المسجلين:</strong> ${totalSignups}</p>
                  <p style="margin:8px 0;color:#e2eaf5;"><strong>🎯 المقاعد المتبقية:</strong> ${remainingSeats} من ${totalSeats}</p>
                  <p style="margin:8px 0;color:#e2eaf5;"><strong>📈 نسبة الإكتمال:</strong> ${percent}%</p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px;border-top:1px solid rgba(32,84,150,0.2);text-align:center;">
                <p style="margin:0;color:#3d5a7a;font-size:12px;">Pharma Career Hub — Founder Notifications</p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>`;

  return sendEmail({
    to: process.env.FOUNDER_EMAIL,
    toName: 'Founder',
    subject: `🆕 New Signup: ${name} | Total: ${totalSignups}`,
    html,
  });
}

module.exports = { sendWelcomeEmail, sendFounderNotification };
