"use client"

import { motion } from 'framer-motion'
import { GraduationCap, Award, BookOpen } from 'lucide-react'
import { educationData } from '../data/education'
import type { PortfolioLang } from '../data/i18n'
import { portfolioTranslations } from '../data/i18n'

interface EducationProps {
  lang: PortfolioLang
}

const typeIcons = {
  degree: GraduationCap,
  certification: Award,
  course: BookOpen,
}

const typeColors = {
  degree: '#00d4ff',
  certification: '#00ff41',
  course: '#8b5cf6',
}

export default function Education({ lang }: EducationProps) {
  const t = portfolioTranslations[lang].education

  return (
    <section id="education" className="relative py-24 md:py-32 bg-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-[#00ff41] mb-4 font-mono drop-shadow-[0_0_15px_rgba(0,255,65,0.3)]">
            {t.title}
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto font-mono">
            {t.subtitle}
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
        >
          {educationData.map(item => {
            const Icon = typeIcons[item.type]
            const color = typeColors[item.type]

            return (
              <motion.div
                key={item.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="group p-5 rounded-lg border border-[#00ff41]/10 bg-black/60 backdrop-blur-sm hover:border-[#00ff41]/30 hover:shadow-[0_0_20px_rgba(0,255,65,0.05)] transition-all duration-300"
                whileHover={{ y: -3 }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="p-2 rounded-lg border"
                    style={{ backgroundColor: `${color}10`, borderColor: `${color}30` }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-base truncate font-mono">
                      {lang === 'ar' ? item.titleAr : item.title}
                    </h3>
                    <p className="text-gray-600 text-sm truncate font-mono">
                      {lang === 'ar' ? item.institutionAr : item.institution}
                    </p>
                  </div>
                </div>

                {item.description && (
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2 font-mono">
                    {lang === 'ar' ? item.descriptionAr : item.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#00ff41]/50">{item.year}</span>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-mono border"
                    style={{ backgroundColor: `${color}10`, color, borderColor: `${color}30` }}
                  >
                    {item.type}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
