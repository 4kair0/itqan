export interface Education {
  id: string
  title: string
  titleAr: string
  institution: string
  institutionAr: string
  year: string
  type: 'degree' | 'certification' | 'course'
  description?: string
  descriptionAr?: string
  verifyUrl?: string
}

export const educationData: Education[] = [
  {
    id: 'cs-degree',
    title: 'Computer Science',
    titleAr: 'علوم الحاسوب',
    institution: 'University',
    institutionAr: 'الجامعة',
    year: '2020 - Present',
    type: 'degree',
    description: 'Bachelor of Computer Science with focus on AI and Software Engineering.',
    descriptionAr: 'بكالوريوس علوم حاسوب مع تركيز على الذكاء الاصطناعي وهندسة البرمجيات.',
  },
  {
    id: 'meta-frontend',
    title: 'Meta Frontend Developer',
    titleAr: 'مطور واجهات Meta',
    institution: 'Meta (Coursera)',
    institutionAr: 'Meta (كورسيرا)',
    year: '2023',
    type: 'certification',
    description: 'Professional certificate in frontend development covering React, testing, and UX.',
    descriptionAr: 'شهادة مهنية في تطوير الواجهات تغطي React والاختبار وتجربة المستخدم.',
  },
  {
    id: 'deep-learning',
    title: 'Deep Learning Specialization',
    titleAr: 'تخصص التعلم العميق',
    institution: 'DeepLearning.AI (Coursera)',
    institutionAr: 'DeepLearning.AI (كورسيرا)',
    year: '2024',
    type: 'certification',
    description: 'Andrew Ng\'s deep learning specialization covering CNNs, RNNs, and transformers.',
    descriptionAr: 'تخصص التعلم العميق من Andrew Ng يغطي CNNs وRNNs والمحولات.',
  },
  {
    id: 'aws-cloud',
    title: 'AWS Cloud Practitioner',
    titleAr: 'ممارس AWS السحابي',
    institution: 'Amazon Web Services',
    institutionAr: 'أمازون ويب سيرفيسز',
    year: '2024',
    type: 'certification',
    description: 'Foundational cloud computing certification.',
    descriptionAr: 'شهادة أساسية في الحوسبة السحابية.',
  },
  {
    id: 'cv-course',
    title: 'Computer Vision with OpenCV',
    titleAr: 'رؤية الحاسوب مع OpenCV',
    institution: 'OpenCV University',
    institutionAr: 'جامعة OpenCV',
    year: '2025',
    type: 'course',
    description: 'Advanced computer vision techniques including object detection and image segmentation.',
    descriptionAr: 'تقنيات رؤية حاسوب متقدمة تشمل كشف الأجسام وتجزئة الصور.',
  },
]
