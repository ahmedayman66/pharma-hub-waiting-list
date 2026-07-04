# Pharma Career Hub v3 🚀

منصة متخصصة للمسار المهني للصيادلة في مصر.

## هيكل المشروع

```
pharma-career-hub-v3/
├── frontend/
│   ├── index.html
│   ├── css/style.css
│   └── js/main.js
└── backend/
    ├── server.js
    ├── models/Signup.js
    ├── routes/signup.js
    ├── services/email.js
    ├── .env.example      ← انسخه وسميه .env وحط بياناتك
    └── package.json
```

## خطوات التشغيل

### 1. إعداد الـ Backend

```bash
cd backend
cp .env.example .env
# عدّل .env وحط بياناتك الحقيقية
npm install
node server.js
```

### 2. إعداد الـ Frontend

- افتح `frontend/index.html` في المتصفح
- أو ارفعه على أي hosting (Netlify, Vercel, etc.)
- عدّل `API_BASE_URL` في `frontend/js/main.js` بـ URL السيرفر الحقيقي

### 3. إعداد الـ .env

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pharma_career_hub
BREVO_API_KEY=مفتاح Brevo API بتاعك
FOUNDER_EMAIL=إيميلك
FRONTEND_URL=https://رابط-الفرونتيند.com
```

## التغييرات في v3

### أمان (Security)
- ✅ حذف الـ API Key الحقيقي من .env
- ✅ أضيف .gitignore يستثني .env و node_modules
- ✅ Rate limiting (5 requests / 15 دقيقة) على signup
- ✅ Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- ✅ Request body size limit (10kb)

### إصلاح أخطاء (Bug Fixes)
- ✅ إصلاح API URL (كان hard-coded على IP محلي)
- ✅ إصلاح fetchStats تتنادى مرتين عند التحميل
- ✅ إصلاح email validation bug (كانت بتتجاهل لو الإيميل غلط)
- ✅ Fallback counter (مش هيبقى 0 لو السيرفر ما ردش)

### تحسينات الكود
- ✅ حذف كل الـ commented code القديم من email.js و routes/signup.js
- ✅ تنظيف server.js وإضافة rate limiting مدمج
- ✅ node_modules مش متحمل في الـ ZIP

### UI/UX
- ✅ خط Cairo/Tajawal (أنسب لعربي من Inter)
- ✅ Phone mockup تفاعلي بدل الـ browser mockup
- ✅ قسم Testimonials (آراء الطلاب)
- ✅ قسم FAQ (5 أسئلة شائعة مع accordion)
- ✅ Social proof (avatars stack + proof text)
- ✅ Form labels واضحة فوق كل input
- ✅ Hero stats في card مرتبة بـ dividers
- ✅ Progress bar بـ shimmer animation
- ✅ CTA section نهاية الصفحة بـ glow effect
- ✅ Section eyebrow tags لكل section
- ✅ Benefit cards بألوان أيقونات مختلفة
- ✅ تحسين الـ mobile responsive
