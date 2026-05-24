export interface TimelineItem {
  id: string
  year: string
  title: string
  titleAr: string
  description: string
  descriptionAr: string
  type: 'education' | 'work' | 'achievement' | 'milestone'
  icon: string
}

export const timelineData: TimelineItem[] = [
  {
    id: 'start-coding',
    year: '2020',
    title: 'Started Programming Journey',
    titleAr: 'بدأت رحلة البرمجة',
    description: 'Wrote my first lines of code and fell in love with problem solving.',
    descriptionAr: 'كتبت أول سطور برمجة وأحببت حل المشكلات.',
    type: 'milestone',
    icon: '🚀',
  },
  {
    id: 'web-dev-basics',
    year: '2021',
    title: 'Mastered Web Fundamentals',
    titleAr: 'أتقنت أساسيات الويب',
    description: 'Learned HTML, CSS, JavaScript, and built my first websites.',
    descriptionAr: 'تعلمت HTML وCSS وJavaScript وبنيت أول مواقعي.',
    type: 'education',
    icon: '📚',
  },
  {
    id: 'react-nextjs',
    year: '2022',
    title: 'React & Next.js Deep Dive',
    titleAr: 'تعمقت في React و Next.js',
    description: 'Built full-stack applications with React, Next.js, and Node.js. Started freelancing.',
    descriptionAr: 'بنيت تطبيقات full-stack مع React وNext.js وNode.js. بدأت العمل الحر.',
    type: 'work',
    icon: '⚛️',
  },
  {
    id: 'nass-academy',
    year: '2023',
    title: 'Joined NASS Academy',
    titleAr: 'انضممت لأكاديمية ناس',
    description: 'Started leading event management and technical operations at NASS Academy.',
    descriptionAr: 'بدأت قيادة إدارة الفعاليات والعمليات التقنية في أكاديمية ناس.',
    type: 'work',
    icon: '🎯',
  },
  {
    id: 'ai-engineering',
    year: '2024',
    title: 'AI Engineering Path',
    titleAr: 'مسار هندسة الذكاء الاصطناعي',
    description: 'Expanded into AI/ML. Built models with TensorFlow and PyTorch. Started NLP projects.',
    descriptionAr: 'توسعت في الذكاء الاصطناعي. بنيت نماذج مع TensorFlow وPyTorch. بدأت مشاريع NLP.',
    type: 'achievement',
    icon: '🤖',
  },
  {
    id: 'itqan-platform',
    year: '2025',
    title: 'Built Itqan Platform',
    titleAr: 'بنيت منصة إتقان',
    description: 'Designed and developed a full educational platform for Quran learning with real-time assessment.',
    descriptionAr: 'صممت وطورت منصة تعليمية كاملة لتعلم القرآن مع تقييم في الوقت الفعلي.',
    type: 'achievement',
    icon: '🏆',
  },
  {
    id: 'computer-vision',
    year: '2026',
    title: 'Computer Vision Focus',
    titleAr: 'التركيز على رؤية الحاسوب',
    description: 'Diving deep into computer vision — object detection, image segmentation, and real-time processing.',
    descriptionAr: 'أتعمق في رؤية الحاسوب — كشف الأجسام وتجزئة الصور والمعالجة في الوقت الفعلي.',
    type: 'milestone',
    icon: '👁️',
  },
]
