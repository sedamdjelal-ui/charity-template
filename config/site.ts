export const siteConfig = {
  // الهوية
  name: "يد العون",
  type: "جمعية خيرية",
  fullName: "جمعية يد العون الخيرية",
  tagline: "معاً نصنع الفرق في حياة العائلات المحتاجة",
  intro:
    "جمعية خيرية تعمل على مساعدة العائلات المعوزة والأيتام والمرضى، بالتعاون مع المحسنين والمتطوعين من أبناء المنطقة.",
  logo: null as string | null, // ضع مسار الشعار مثل "/logo.png" أو اتركه null ليظهر الاسم

  // الاعتماد الرسمي
  approval: {
    number: "00/2026",
    authority: "مصالح الولاية",
  },

  // العنوان
  address: {
    wilaya: "اسم الولاية",
    daira: "اسم الدائرة",
    commune: "اسم البلدية",
    street: "اسم الشارع ورقم المقر",
  },

  // التواصل
  contact: {
    phone: "0550 00 00 00",
    whatsapp: "213550000000",
    email: "contact@example.com",
    facebook: "",
  },

  // التبرع
  donation: {
    ccp: "0000000000 مفتاح 00",
    rip: "00799999000000000000",
    accountName: "جمعية يد العون الخيرية",
  },

  // أرقام الأثر
  stats: [
    { value: "1200+", label: "عائلة مستفيدة" },
    { value: "35", label: "حملة تضامنية" },
    { value: "150", label: "متطوع" },
    { value: "12", label: "سنة من العطاء" },
  ],

  // النشاطات (enabled: false يخفي النشاط)
  activities: [
    {
      id: "ramadan",
      title: "قفة رمضان",
      description: "توزيع المواد الغذائية على العائلات المحتاجة خلال شهر رمضان.",
      enabled: true,
    },
    {
      id: "orphans",
      title: "كفالة الأيتام",
      description: "كفالة شهرية للأيتام ومتابعة احتياجاتهم الدراسية والصحية.",
      enabled: true,
    },
    {
      id: "patients",
      title: "مساعدة المرضى",
      description: "المساهمة في شراء الأدوية وتكاليف العمليات والفحوصات.",
      enabled: true,
    },
    {
      id: "school",
      title: "الدخول المدرسي",
      description: "توفير الأدوات المدرسية والملابس للتلاميذ مع بداية كل عام.",
      enabled: true,
    },
  ],

  // الحملات الجارية (المبالغ بالدينار، enabled: false يخفي الحملة)
  campaigns: [
    {
      id: "winter-2026",
      title: "حملة الشتاء الدافئ",
      description: "توفير الأغطية والملابس الشتوية ووسائل التدفئة لـ 200 عائلة.",
      goal: 1500000,
      raised: 920000,
      enabled: true,
    },
    {
      id: "surgery-help",
      title: "صندوق العمليات الجراحية",
      description: "المساهمة في تكاليف العمليات للمرضى غير القادرين على الدفع.",
      goal: 2000000,
      raised: 640000,
      enabled: true,
    },
    {
      id: "orphans-2026",
      title: "كفالة 50 يتيماً",
      description: "كفالة شهرية تغطي الغذاء والدراسة والعلاج لمدة سنة كاملة.",
      goal: 3000000,
      raised: 2310000,
      enabled: true,
    },
  ],

  // القائمة
  nav: [
    { label: "الرئيسية", href: "/" },
    { label: "من نحن", href: "#about" },
    { label: "نشاطاتنا", href: "#activities" },
    { label: "الحملات", href: "#campaigns" },
    { label: "تواصل معنا", href: "#contact" },
  ],
};