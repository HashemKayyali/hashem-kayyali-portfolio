# Burgundy Warp Background — Fix & Performance Report

## 1. السبب الحقيقي للمشكلة

تم تتبع مسار العرض الفعلي، ولم توجد نسخة مكررة من مكوّن الخلفية داخل مسار آخر. جميع البطاقات البورجندية المطلوبة كانت تستخدم:

- `components/ui/burgundy-warp-background.tsx`

بينما خلفية الموقع العامة وحدها كانت تستخدم Shader حقيقيًا داخل:

- `components/ui/global-burgundy-warp-background.tsx`

المشكلة في النسخة المرفوعة كانت أن خلفيات البطاقات لم تكن Dynamic Warp أصلًا:

1. في النسخة الأصلية من `components/ui/burgundy-warp-background.tsx`، الأسطر 89–95 كانت تعرض `div` باسم `burgundy-warp-texture`.
2. في النسخة الأصلية من `index.css`، الأسطر 87–102 كانت تربط هذا العنصر بصورة ثابتة:
   - `/images/burgundy-warp-surface.webp`
   - الحركة كانت فقط `translate / rotate / scale` للصورة نفسها، وليست حركة Shader داخلية.
3. في النسخة الأصلية من `components/ui/burgundy-warp-background.tsx`، السطر 98 كان يضيف Overlay داكنًا بقيمة `rgba(8, 0, 3, 0.38)` فوق الصورة.
4. العناصر المستهلكة كانت ترسل أيضًا `overlayClassName="bg-black/80"`. هذه الـclass لم تكن تتحكم فعليًا بالقيمة النهائية لأن `style={{ background: ... }}` المضمّن كان أعلى أولوية، لذلك الـhover الخاص بها لم يكن يعمل كما هو متوقع.
5. الخلفية الأساسية `bg-[#300510]` بقيت كـfallback داكن خلف الصورة، ما جعل النتيجة تبدو شبه ثابتة وأكثر قتامة من خلفية الموقع العامة.

الـ`z-index` السلبي لم يكن السبب الرئيسي؛ كل حاوية تستخدم `isolate`، لذلك بقيت الخلفية داخل الـstacking context المحلي وأسفل المحتوى. السبب الأساسي كان استخدام Texture ثابتة مع Overlay داكن بدل مشاركة الـWarp الحقيقي.

## 2. الحل المطبق

تم إنشاء محرك Warp داخلي واحد بدون الاعتماد على مكتبة Shader خارجية:

- `components/ui/global-burgundy-warp-background.tsx`
  - ينشئ WebGL context واحد فقط.
  - يرسم تموجات Burgundy فعلية باستخدام Fragment Shader.
  - الألوان محصورة بدرجات Burgundy/Wine الداكنة والفاتحة، بدون فوشي أو زهري ساطع.
  - سرعة الرسم محددة إلى 30 FPS.
  - دقة الرسم محددة بحد أقصى `devicePixelRatio = 1.25` مع Quality Scale حسب حجم الشاشة.

- `components/ui/burgundy-warp-runtime.ts`
  - يدير المصدر المشترك والمشتركين في الإطارات.
  - لا ينشئ `requestAnimationFrame` إضافيًا لكل بطاقة.

- `components/ui/burgundy-warp-background.tsx`
  - كل بطاقة تستخدم Canvas 2D خفيفًا ينسخ الإطار من مصدر WebGL المشترك.
  - كل بطاقة تحصل على Phase وRotation وDrift مختلف اعتمادًا على `index`.
  - نسخ البطاقات محدد إلى 24 FPS.
  - لا يحدث React render أثناء الحركة؛ الرسم مباشر إلى Canvas.
  - `ResizeObserver` يحفظ الأبعاد ولا يتم تنفيذ `getBoundingClientRect()` داخل كل Frame.
  - `IntersectionObserver` يشغّل الرسم فقط للعناصر الظاهرة أو القريبة من الشاشة.
  - عند خروج العنصر من النطاق يتم إلغاء الاشتراك وتصغير Canvas إلى `1×1` لتحرير الذاكرة.

تم تخفيف طبقة القراءة الداكنة إلى قيم بين `0.14` و`0.20` حسب حجم البطاقة، مع بقاء النص أبيض وواضح.

## 3. العناصر التي أصبحت تستخدم الخلفية المشتركة

- قسم المعلومات أسفل صور Project Cards — 9 بطاقات.
- بطاقة About / Target Roles.
- بطاقة Selected Products.
- بطاقة Download Resume الرئيسية.
- بطاقة Contact.
- زر Download Resume في Sidebar.
- العنصر النشط في Sidebar.

الصور وأحجام البطاقات والمسافات وBorder Radius والنصوص والسيكشنات البيضاء لم تتغير.

## 4. الأداء

### عدد WebGL canvases

- النسخة التاريخية الثقيلة المذكورة في تقرير المشروع السابق: حتى 16 WebGL surfaces محتملة.
- النسخة المرفوعة مباشرة قبل هذا الإصلاح: 1 WebGL canvas للخلفية العامة، و0 WebGL داخل البطاقات؛ البطاقات كانت تستخدم صورة WebP ثابتة.
- بعد الإصلاح: 1 WebGL canvas مشترك للموقع والبطاقات، و0 WebGL contexts إضافية للبطاقات.

توجد Canvas 2D داخل كل سطح Burgundy، لكن الرسم الفعلي يعمل فقط للأسطح الظاهرة أو القريبة من الشاشة، ويتم تحرير Buffer عند الخروج.

### ما تم إيقافه أو تقييده

- لا توجد حلقة RAF مستقلة لكل بطاقة.
- مصدر WebGL يتوقف عندما يصبح التبويب غير نشط عبر `visibilitychange`.
- عند `prefers-reduced-motion: reduce` يتم رسم Frame واحد فقط وتتوقف الحركة.
- البطاقات خارج نطاق `IntersectionObserver` لا تنسخ Frames.
- دقة المصدر والبطاقات محددة لتجنب Buffers عالية الدقة بلا حاجة.
- Lazy loading و`decoding="async"` للصور بقي كما هو.

## 5. التحقق المنفذ

### نجح

- فحص كامل لمسارات الاستيراد والمكوّنات الفعلية.
- لا توجد نسخة مكررة من مكوّن الخلفية.
- فحص Syntax/Transpile لجميع ملفات TypeScript/TSX: نجح لـ20 ملفًا.
- فحص TypeScript للمصدر باستخدام Compiler الموجود في البيئة وتعريفات تحقق مؤقتة: نجح بدون أخطاء.
- فحص اتساق `package.json` و`package-lock.json` عبر:
  - `npm install --package-lock-only --ignore-scripts --offline`
  - النتيجة: نجح، 0 vulnerabilities.
- اختبار Shader فعلي في Chromium:
  - WebGL initialized: نعم.
  - WebGL error code: 0.
  - الاختبار استخدم 1 WebGL canvas + 6 Canvas 2D.
  - تم التقاط إطارين بفاصل ثانية؛ تغيّر 39.46% من البكسلات، ما يؤكد أن الحركة فعلية وليست صورة ثابتة.
  - البطاقات ظهرت بدرجات ومواضع مختلفة.

### تعذر داخل بيئة التنفيذ الحالية

تم تنفيذ `npm ci` فعليًا، لكنه فشل قبل تثبيت الحزم بسبب Registry داخلي يعيد HTTP 404 لحزمة انتقالية `yallist-3.1.1.tgz`.

بسبب عدم إنشاء `node_modules`، كانت نتيجة `npm run build`:

- `vite: not found`

لذلك لا يتم الادعاء بأن Build الكامل نجح داخل هذه البيئة. المشكلة ليست خطأ TypeScript مكتشفًا في التعديلات، بل فشل تنزيل Dependencies من Registry المتاح داخل بيئة التنفيذ. يجب تشغيل `npm ci && npm run build` على جهاز يملك وصولًا سليمًا إلى npm registry لإتمام فحص Vite النهائي.

## 6. الملفات المعدلة

1. `components/Sidebar.tsx`
2. `components/ui/burgundy-warp-background.tsx`
3. `components/ui/burgundy-warp-runtime.ts` — ملف جديد
4. `components/ui/feature-shader-cards.tsx`
5. `components/ui/global-burgundy-warp-background.tsx`
6. `sections/About.tsx`
7. `sections/Resume.tsx`
8. `sections/Contact.tsx`
9. `index.css`
10. `package.json`
11. `package-lock.json`
12. `PERFORMANCE-REPORT.md`
