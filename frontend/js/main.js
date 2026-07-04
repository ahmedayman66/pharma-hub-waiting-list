// ============================================================
//  Pharma Career Hub — main.js (v3)
//  Fixes: duplicate fetchStats, API URL, email validation bug
// ============================================================

// ── Config ──────────────────────────────────────────────────
// بدّل ده لـ URL الـ production بتاعك لما ترفع السيرفر
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : 'https://YOUR_PRODUCTION_DOMAIN.com';

const TOTAL_SEATS = 500;
const FALLBACK_COUNT = 47; // رقم احتياطي لو السيرفر ما ردش

// ── State ────────────────────────────────────────────────────
let registeredCount = FALLBACK_COUNT;

// ── DOM refs ─────────────────────────────────────────────────
const liveCounterEl   = document.getElementById('liveCounter');
const remainingEl     = document.getElementById('remainingSeats');
const progressFillEl  = document.getElementById('progressFill');
const progressTextEl  = document.getElementById('progressText');
const ctaCountEl      = document.getElementById('ctaCount');

const formCard        = document.getElementById('formCard');
const successCard     = document.getElementById('successCard');
const successNameSpan = document.getElementById('successName');
const signupForm      = document.getElementById('signupForm');
const submitBtn       = document.getElementById('submitBtn');

const nameInput       = document.getElementById('name');
const whatsappInput   = document.getElementById('whatsapp');
const emailInput      = document.getElementById('email');

// ── Stats ────────────────────────────────────────────────────
async function fetchStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/stats`, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    if (data.success) {
      registeredCount = data.totalSignups;
      updateCounters();
    }
  } catch {
    // سيرفر ما ردش — نفضل على الـ fallback بدون ما نبين صفر
  }
}

function updateCounters() {
  const remaining = Math.max(0, TOTAL_SEATS - registeredCount);
  const percent   = Math.min(100, Math.floor((registeredCount / TOTAL_SEATS) * 100));

  if (liveCounterEl)   liveCounterEl.innerText  = registeredCount;
  if (remainingEl)     remainingEl.innerText     = remaining;
  if (ctaCountEl)      ctaCountEl.innerText      = registeredCount;
  if (progressFillEl)  progressFillEl.style.width = percent + '%';
  if (progressTextEl) {
    progressTextEl.innerHTML = `<i class="fas fa-fire"></i> ${percent}% من المقاعد اكتملت`;
  }
}

// بادئ تشغيل — مرة واحدة بس
fetchStats();
setInterval(fetchStats, 30000);

// ── Validation ───────────────────────────────────────────────
function validateName(v) {
  if (!v.trim()) return 'الاسم مطلوب';
  if (v.trim().length < 3) return 'أدخل اسمك الكامل (3 أحرف على الأقل)';
  return null;
}

function validateWhatsapp(v) {
  const c = v.trim().replace(/\s/g, '');
  if (!c) return 'رقم الواتساب مطلوب';
  if (!/^01[0-2,5]{1}[0-9]{8}$/.test(c)) return 'رقم مصري صحيح (01xxxxxxxxx)';
  return null;
}

function validateEmail(v) {
  if (!v.trim()) return null; // اختياري
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : 'إيميل غير صحيح';
}

function setFieldError(fieldId, message) {
  const input    = document.getElementById(fieldId);
  const errorEl  = document.getElementById(fieldId + 'Error');

  if (errorEl) errorEl.innerText = message || '';

  if (input) {
    const wrapper = input.closest('.input-wrapper');
    if (wrapper) wrapper.classList.toggle('is-error', !!message);
  }
}

// Real-time clear on input
[nameInput, whatsappInput].forEach(el => {
  if (!el) return;
  el.addEventListener('input', () => setFieldError(el.id, null));
});
if (emailInput) {
  emailInput.addEventListener('input', () => {
    const w = emailInput.closest('.input-wrapper');
    if (w) w.classList.remove('is-error');
  });
}

// WhatsApp: numbers only
if (whatsappInput) {
  whatsappInput.addEventListener('input', function () {
    this.value = this.value.replace(/[^0-9]/g, '');
  });
}

// ── Form submit ──────────────────────────────────────────────
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name     = nameInput?.value || '';
    const whatsapp = whatsappInput?.value || '';
    const email    = emailInput?.value || '';

    const nameErr     = validateName(name);
    const waErr       = validateWhatsapp(whatsapp);
    const emailErr    = validateEmail(email);

    setFieldError('name', nameErr);
    setFieldError('whatsapp', waErr);
    if (emailErr && emailInput) {
      const w = emailInput.closest('.input-wrapper');
      if (w) w.classList.add('is-error');
    }

    // FIX: توقف لو أي حاجة غلط — بما فيها الإيميل
    if (nameErr || waErr || emailErr) return;

    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    try {
      const res = await fetch(`${API_BASE_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          whatsapp: whatsapp.trim().replace(/\s/g, ''),
          email: email.trim() || null,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (successNameSpan) successNameSpan.innerText = name.trim().split(' ')[0];
        if (formCard)     formCard.style.display = 'none';
        if (successCard)  successCard.classList.add('visible');
        await fetchStats();
      } else if (res.status === 409) {
        setFieldError('whatsapp', data.message || 'الرقم ده مسجل بالفعل');
      } else {
        setFieldError('name', data.message || 'حصلت مشكلة، حاول تاني');
      }
    } catch {
      setFieldError('name', 'تعذر الاتصال بالسيرفر. حاول تاني بعد شوية.');
    } finally {
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
    }
  });
}

// ── Add another signup ───────────────────────────────────────
window.addAnotherSignup = function () {
  if (successCard) successCard.classList.remove('visible');
  if (formCard) formCard.style.display = 'block';
  if (signupForm) signupForm.reset();
  setFieldError('name', null);
  setFieldError('whatsapp', null);
  if (submitBtn) {
    submitBtn.classList.remove('is-loading');
    submitBtn.disabled = false;
  }
  formCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

// ── Share ────────────────────────────────────────────────────
window.shareNow = function () {
  if (navigator.share) {
    navigator.share({
      title: 'Pharma Career Hub',
      text: 'أول منصة فرص متخصصة للصيادلة في مصر — تدريبات، كورسات، ووظائف في مكان واحد!',
      url: window.location.href,
    });
  } else {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('✅ تم نسخ الرابط! شاركه مع زملائك 💊');
    });
  }
};

// ── FAQ accordion ─────────────────────────────────────────────
window.toggleFaq = function (btn) {
  const item   = btn.closest('.faq-item');
  const answer = item.querySelector('.faq-answer');
  const arrow  = btn.querySelector('.faq-arrow');
  const isOpen = answer.classList.contains('open');

  // Close all others
  document.querySelectorAll('.faq-answer.open').forEach(el => {
    el.classList.remove('open');
    el.closest('.faq-item').querySelector('.faq-arrow').classList.remove('open');
  });

  if (!isOpen) {
    answer.classList.add('open');
    arrow.classList.add('open');
  }
};

// ── Mobile nav ───────────────────────────────────────────────
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('nav-mobile');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
}

document.querySelectorAll('.nav-mobile a').forEach(link => {
  link.addEventListener('click', () => mobileMenu?.classList.remove('open'));
});

// ── Scroll navbar ────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });
