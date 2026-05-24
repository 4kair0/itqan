export interface Skill {
  name: string
  level: number // 0-100
  category: 'frontend' | 'backend' | 'ai' | 'tools' | 'design'
  icon?: string
}

export const skills: Skill[] = [
  // Frontend
  { name: 'React', level: 95, category: 'frontend' },
  { name: 'Next.js', level: 92, category: 'frontend' },
  { name: 'TypeScript', level: 90, category: 'frontend' },
  { name: 'Tailwind CSS', level: 95, category: 'frontend' },
  { name: 'Framer Motion', level: 85, category: 'frontend' },
  { name: 'HTML/CSS', level: 98, category: 'frontend' },
  { name: 'JavaScript', level: 95, category: 'frontend' },
  { name: 'shadcn/ui', level: 90, category: 'frontend' },

  // Backend
  { name: 'Node.js', level: 88, category: 'backend' },
  { name: 'Python', level: 85, category: 'backend' },
  { name: 'PostgreSQL', level: 82, category: 'backend' },
  { name: 'Supabase', level: 88, category: 'backend' },
  { name: 'REST APIs', level: 90, category: 'backend' },
  { name: 'Redis', level: 75, category: 'backend' },
  { name: 'FastAPI', level: 78, category: 'backend' },

  // AI/ML
  { name: 'TensorFlow', level: 75, category: 'ai' },
  { name: 'PyTorch', level: 72, category: 'ai' },
  { name: 'OpenCV', level: 70, category: 'ai' },
  { name: 'Computer Vision', level: 68, category: 'ai' },
  { name: 'NLP', level: 72, category: 'ai' },
  { name: 'Hugging Face', level: 70, category: 'ai' },
  { name: 'NumPy/Pandas', level: 80, category: 'ai' },

  // Tools
  { name: 'Git', level: 92, category: 'tools' },
  { name: 'Docker', level: 78, category: 'tools' },
  { name: 'Linux', level: 82, category: 'tools' },
  { name: 'VS Code', level: 95, category: 'tools' },
  { name: 'CI/CD', level: 75, category: 'tools' },
  { name: 'Vercel', level: 88, category: 'tools' },

  // Design
  { name: 'Figma', level: 78, category: 'design' },
  { name: 'UI/UX Design', level: 80, category: 'design' },
  { name: 'Responsive Design', level: 92, category: 'design' },
  { name: 'Animation Design', level: 85, category: 'design' },
]

export const skillCategories = [
  { id: 'frontend', color: '#00d4ff' },
  { id: 'backend', color: '#10b981' },
  { id: 'ai', color: '#8b5cf6' },
  { id: 'tools', color: '#f59e0b' },
  { id: 'design', color: '#ec4899' },
] as const
