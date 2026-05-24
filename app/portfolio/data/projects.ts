export interface Project {
  id: string
  title: string
  titleAr: string
  description: string
  descriptionAr: string
  category: 'web' | 'ai'
  technologies: string[]
  image: string
  liveUrl?: string
  githubUrl?: string
  challenges: string[]
  challengesAr: string[]
  solutions: string[]
  solutionsAr: string[]
}

export const projects: Project[] = [
  {
    id: 'itqan-platform',
    title: 'Itqan Educational Platform',
    titleAr: 'منصة إتقان التعليمية',
    description: 'A comprehensive Islamic educational platform with Quran recitation assessment, course management, and real-time audio evaluation.',
    descriptionAr: 'منصة تعليمية إسلامية شاملة مع تقييم تلاوة القرآن وإدارة الدورات والتقييم الصوتي في الوقت الفعلي.',
    category: 'web',
    technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Framer Motion'],
    image: '/portfolio/projects/itqan.png',
    challenges: [
      'Real-time audio streaming and processing',
      'Complex role-based access control',
      'Bilingual RTL/LTR support',
    ],
    challengesAr: [
      'بث ومعالجة الصوت في الوقت الفعلي',
      'نظام صلاحيات معقد',
      'دعم ثنائي اللغة RTL/LTR',
    ],
    solutions: [
      'WebRTC + custom audio pipeline',
      'JWT-based middleware with role hierarchy',
      'Context-driven i18n with layout switching',
    ],
    solutionsAr: [
      'WebRTC مع خط أنابيب صوتي مخصص',
      'وسيط JWT مع تسلسل الأدوار',
      'ترجمة مبنية على السياق مع تبديل التخطيط',
    ],
  },
  {
    id: 'cv-object-detection',
    title: 'Real-time Object Detection System',
    titleAr: 'نظام كشف الأجسام في الوقت الفعلي',
    description: 'Computer vision system for real-time object detection and tracking using deep learning models.',
    descriptionAr: 'نظام رؤية حاسوبية لكشف وتتبع الأجسام في الوقت الفعلي باستخدام نماذج التعلم العميق.',
    category: 'ai',
    technologies: ['Python', 'OpenCV', 'TensorFlow', 'YOLO', 'NumPy'],
    image: '/portfolio/projects/cv-detection.png',
    challenges: [
      'Achieving real-time inference speed',
      'Handling varying lighting conditions',
      'Multi-object tracking across frames',
    ],
    challengesAr: [
      'تحقيق سرعة استدلال في الوقت الفعلي',
      'التعامل مع ظروف إضاءة متغيرة',
      'تتبع أجسام متعددة عبر الإطارات',
    ],
    solutions: [
      'Model quantization and TensorRT optimization',
      'Data augmentation with lighting variations',
      'DeepSORT tracking algorithm integration',
    ],
    solutionsAr: [
      'تكميم النموذج وتحسين TensorRT',
      'تعزيز البيانات مع تغيرات الإضاءة',
      'دمج خوارزمية تتبع DeepSORT',
    ],
  },
  {
    id: 'ecommerce-platform',
    title: 'E-Commerce Platform',
    titleAr: 'منصة تجارة إلكترونية',
    description: 'Full-stack e-commerce solution with payment integration, inventory management, and analytics dashboard.',
    descriptionAr: 'حل تجارة إلكترونية متكامل مع تكامل الدفع وإدارة المخزون ولوحة تحليلات.',
    category: 'web',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'Redis', 'Docker'],
    image: '/portfolio/projects/ecommerce.png',
    liveUrl: '#',
    githubUrl: '#',
    challenges: [
      'High-concurrency cart operations',
      'Payment webhook reliability',
      'Inventory race conditions',
    ],
    challengesAr: [
      'عمليات سلة التسوق عالية التزامن',
      'موثوقية webhook الدفع',
      'حالات سباق المخزون',
    ],
    solutions: [
      'Redis-based session and cart caching',
      'Idempotent webhook handlers with retry logic',
      'Optimistic locking with PostgreSQL advisory locks',
    ],
    solutionsAr: [
      'تخزين مؤقت للجلسة والسلة مبني على Redis',
      'معالجات webhook متساوية القوة مع منطق إعادة المحاولة',
      'قفل متفائل مع أقفال استشارية PostgreSQL',
    ],
  },
  {
    id: 'nlp-sentiment',
    title: 'Arabic Sentiment Analysis',
    titleAr: 'تحليل المشاعر العربية',
    description: 'NLP model for Arabic text sentiment analysis using transformer-based architecture.',
    descriptionAr: 'نموذج معالجة لغات طبيعية لتحليل مشاعر النصوص العربية باستخدام بنية المحولات.',
    category: 'ai',
    technologies: ['Python', 'PyTorch', 'Hugging Face', 'BERT', 'FastAPI'],
    image: '/portfolio/projects/nlp-sentiment.png',
    challenges: [
      'Limited Arabic training data',
      'Dialectal variation handling',
      'Model serving latency',
    ],
    challengesAr: [
      'بيانات تدريب عربية محدودة',
      'التعامل مع تنوع اللهجات',
      'زمن استجابة خدمة النموذج',
    ],
    solutions: [
      'Transfer learning from AraBERT pre-trained model',
      'Multi-dialect data augmentation pipeline',
      'ONNX export with dynamic batching',
    ],
    solutionsAr: [
      'نقل التعلم من نموذج AraBERT المدرب مسبقاً',
      'خط أنابيب تعزيز بيانات متعدد اللهجات',
      'تصدير ONNX مع التجميع الديناميكي',
    ],
  },
]

export const technologies = [
  'Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion',
  'Node.js', 'Python', 'PostgreSQL', 'Supabase', 'Redis',
  'Docker', 'TensorFlow', 'PyTorch', 'OpenCV', 'YOLO',
  'Hugging Face', 'FastAPI', 'Stripe', 'NumPy', 'BERT',
]
