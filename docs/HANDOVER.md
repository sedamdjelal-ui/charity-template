# دليل تجهيز موقع لجمعية جديدة

قالب charity-template — Djellal Design Studio

لكل جمعية: مشروع Supabase مستقل + مشروع Vercel مستقل، وكلاهما من نفس المستودع.

---

## 1. ما تطلبه من الجمعية قبل البدء

- بريد إلكتروني رسمي للجمعية (يُستعمل لحساب Supabase)
- اسم الرئيس وبريده
- الاسم الكامل والمختصر، رقم الاعتماد والجهة المانحة
- العنوان: الولاية، الدائرة، البلدية، الشارع
- الهاتف، واتساب، البريد، رابط فيسبوك
- الحساب البريدي CCP و RIP واسم صاحب الحساب
- قصة الجمعية، الرؤية، الرسالة، سنة التأسيس
- النشاطات، والحملات الجارية إن وُجدت
- الشعار (اختياري) والنطاق المطلوب (اختياري)

---

## 2. قاعدة البيانات (Supabase)

### 2.1 حساب مستقل
- supabase.com ← Sign up ← **بالبريد الإلكتروني** (وليس عبر Vercel)
- يُفضّل بريد الجمعية، أو بريد خاص بك لكل عميل يُنقل لاحقاً
- الحساب المستقل يعني: بيانات معزولة، فواتير منفصلة، ونقل ملكية سهل

### 2.2 المشروع
- New project
- Name: اسم مختصر للجمعية بالإنجليزية
- Database Password: Generate ← احفظها
- Region: Europe (الأقرب للجزائر)
- Security:
  - ✅ Enable Data API
  - ⬜ Automatically expose new tables (مُطفأ)
  - ✅ Enable automatic RLS

### 2.3 الجداول
- SQL Editor ← New query
- الصق محتوى `supabase/setup.sql` كاملاً ← Run
- يجب أن تظهر: Success

### 2.4 الحماية
- Authentication ← Sign In / Providers ← أطفئ **Allow new users to sign up** ← Save

### 2.5 حساب الرئيس
- Authentication ← Users ← Add user ← Create new user
- بريد الرئيس + كلمة سر مؤقتة + ✅ Auto Confirm User
- SQL Editor:

    insert into public.members (user_id, full_name, role)
    select id, 'اسم الرئيس', 'president'
    from auth.users where email = 'بريد_الرئيس';

- تحقق: Table Editor ← members فيه سطر واحد بدور president

### 2.6 المفاتيح
من Project Settings ← API Keys انسخ (بأيقونة النسخ):
- Project URL
- Publishable key (sb_publishable_)
- Secret key (sb_secret_) ← سري، لا يُرسل لأحد

---

## 3. النشر (Vercel)

- Add New ← Project ← Import المستودع charity-template
- Project Name: اسم الجمعية بالإنجليزية
- **قبل Deploy** افتح Environment Variables وأضف:

| Key | النوع |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | عادي |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | عادي |
| SUPABASE_SECRET_KEY | Sensitive |

- Deploy
- افتح الرابط وتأكد أن الموقع يعمل

### رابط الموقع في Supabase
- Supabase ← Authentication ← URL Configuration
- Site URL: رابط موقع الجمعية

---

## 4. النطاق (اختياري)

- نطاق .com أو .org: يُشترى من أي مسجّل نطاقات
- نطاق .dz: عبر NIC.dz ويتطلب وثائق الجمعية
- Vercel ← Settings ← Domains ← أضف النطاق واتبع تعليمات DNS
- حدّث Site URL في Supabase بالنطاق الجديد

---

## 5. ملء المحتوى

- ادخل `/admin/login` بحساب الرئيس
- الإعدادات: كل بيانات الجمعية
- النشاطات: عدّل أو أضف
- الحملات والأخبار: أضف الجارية منها
- تحقق من الموقع العام على الهاتف

---

## 6. التسليم للجمعية

- أعطِ الرئيس: رابط الدخول، البريد، كلمة السر المؤقتة
- اطلب منه تغيير كلمة السر فوراً من «حسابي»
- اشرح له: إضافة الأعضاء، طلبات المساعدة، المستفيدين، تسجيل المساعدات
- سلّمه دليل الاستعمال
- اتفق على: الصيانة، التحديثات، من يملك حساب Supabase والنطاق

---

## 7. بعد التسليم

### تحديث الكود
- أي `git push` على المستودع يُحدّث كل مواقع الجمعيات تلقائياً

### تحديث قاعدة البيانات
- أي تعديل على الجداول يُكتب في ملف جديد داخل `supabase/migrations/`
- ويُنفَّذ يدوياً في SQL Editor لكل جمعية
- وتُحدّث `supabase/setup.sql` به للجمعيات القادمة

### النسخ الاحتياطي
- الخطة المجانية في Supabase محدودة في النسخ الاحتياطي
- صدّر البيانات دورياً، أو انتقل لخطة مدفوعة للجمعيات الكبيرة

### الخطة المجانية في Supabase
- يتوقف المشروع مؤقتاً بعد فترة طويلة دون استعمال
- استعمال الجمعية المنتظم للوحة يمنع ذلك