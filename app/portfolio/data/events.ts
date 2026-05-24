export interface Event {
  id: string
  title: string
  titleAr: string
  description: string
  descriptionAr: string
  date: string
  location: string
  locationAr: string
  image: string
  role: string
  roleAr: string
  details: string
  detailsAr: string
  impact?: string
  impactAr?: string
}

export const events: Event[] = [
  {
    id: 'nass-tech-summit-2025',
    title: 'NASS Tech Summit 2025',
    titleAr: 'قمة ناس التقنية 2025',
    description: 'Annual technology summit bringing together developers, designers, and entrepreneurs.',
    descriptionAr: 'قمة تقنية سنوية تجمع المطورين والمصممين ورواد الأعمال.',
    date: '2025-03-15',
    location: 'Cairo, Egypt',
    locationAr: 'القاهرة، مصر',
    image: '/portfolio/events/tech-summit.jpg',
    role: 'Event Coordinator & Technical Lead',
    roleAr: 'منسق الفعالية والمسؤول التقني',
    details: 'Managed a team of 15 volunteers, coordinated with 8 speakers, and handled all technical infrastructure including live streaming and registration systems.',
    detailsAr: 'أدرت فريقاً من 15 متطوعاً، نسقت مع 8 متحدثين، وتوليت جميع البنية التقنية بما في ذلك البث المباشر وأنظمة التسجيل.',
    impact: '500+ attendees, 95% satisfaction rate',
    impactAr: 'أكثر من 500 حاضر، معدل رضا 95%',
  },
  {
    id: 'nass-hackathon-2024',
    title: 'NASS Hackathon 2024',
    titleAr: 'هاكاثون ناس 2024',
    description: '48-hour hackathon focused on AI solutions for education.',
    descriptionAr: 'هاكاثون 48 ساعة يركز على حلول الذكاء الاصطناعي للتعليم.',
    date: '2024-11-20',
    location: 'Alexandria, Egypt',
    locationAr: 'الإسكندرية، مصر',
    image: '/portfolio/events/hackathon.jpg',
    role: 'Lead Organizer',
    roleAr: 'المنظم الرئيسي',
    details: 'Organized the entire event from concept to execution. Built the judging platform, managed sponsors, and mentored 12 teams.',
    detailsAr: 'نظمت الفعالية بالكامل من الفكرة إلى التنفيذ. بنيت منصة التحكيم، أدرت الرعاة، ووجهت 12 فريقاً.',
    impact: '120 participants, 12 teams, 3 projects got funded',
    impactAr: '120 مشاركاً، 12 فريقاً، 3 مشاريع حصلت على تمويل',
  },
  {
    id: 'nass-workshop-web',
    title: 'Web Development Workshop Series',
    titleAr: 'سلسلة ورش تطوير الويب',
    description: 'Monthly workshop series teaching modern web development from basics to advanced.',
    descriptionAr: 'سلسلة ورش شهرية لتعليم تطوير الويب الحديث من الأساسيات إلى المتقدم.',
    date: '2024-06-01',
    location: 'Online + Cairo Hub',
    locationAr: 'أونلاين + مركز القاهرة',
    image: '/portfolio/events/workshop.jpg',
    role: 'Instructor & Curriculum Designer',
    roleAr: 'مدرب ومصمم المنهج',
    details: 'Designed and delivered a 6-part workshop series covering React, Next.js, and full-stack development. Created hands-on projects for each session.',
    detailsAr: 'صممت وقدمت سلسلة من 6 ورش تغطي React وNext.js وتطوير Full-stack. أنشأت مشاريع عملية لكل جلسة.',
    impact: '200+ students enrolled, 85% completion rate',
    impactAr: 'أكثر من 200 طالب مسجل، معدل إتمام 85%',
  },
  {
    id: 'nass-ai-conference',
    title: 'AI in MENA Conference',
    titleAr: 'مؤتمر الذكاء الاصطناعي في المنطقة',
    description: 'Regional conference exploring AI applications and opportunities in the Middle East.',
    descriptionAr: 'مؤتمر إقليمي يستكشف تطبيقات وفرص الذكاء الاصطناعي في الشرق الأوسط.',
    date: '2024-09-10',
    location: 'Cairo, Egypt',
    locationAr: 'القاهرة، مصر',
    image: '/portfolio/events/ai-conference.jpg',
    role: 'Technical Program Manager',
    roleAr: 'مدير البرنامج التقني',
    details: 'Curated the technical track, managed speaker selection, and built the conference website and registration system from scratch.',
    detailsAr: 'أشرفت على المسار التقني، أدرت اختيار المتحدثين، وبنيت موقع المؤتمر ونظام التسجيل من الصفر.',
    impact: '300+ attendees from 8 countries',
    impactAr: 'أكثر من 300 حاضر من 8 دول',
  },
]
