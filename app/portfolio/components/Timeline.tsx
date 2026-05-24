"use client"

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { timelineData } from '../data/timeline'
import type { PortfolioLang } from '../data/i18n'
import { portfolioTranslations } from '../data/i18n'

interface TimelineProps {
  lang: PortfolioLang
}

function TimelineCard({ item, index, lang }: { item: typeof timelineData[0]; index: number; lang: PortfolioLang }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const isLeft = index % 2 === 0

  return (
    <motion.div
      ref={ref}
      className={`flex items-center gap-4 md:gap-8 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row`}
      initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
    >
      {/* Card */}
      <div className={`flex-1 ${isLeft ? 'md:text-right' : 'md:text-left'} text-left`}>
        <motion.div
          className="p-5 rounded-2xl border border-white/5 bg-[#111827]/50 backdrop-blur-sm hover:border-[#00d4ff]/20 hover:bg-[#111827] transition-all duration-300 group"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{item.icon}</span>
            <span className="text-[#00d4ff] font-mono text-sm">{item.year}</span>
          </div>
          <h3 className="text-white font-semibold text-lg mb-1 font-[family-name:var(--font-inter)]">
            {lang === 'ar' ? item.titleAr : item.title}
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            {lang === 'ar' ? item.descriptionAr : item.description}
          </p>
          <div className="mt-3">
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
              item.type === 'education' ? 'bg-[#3b82f6]/10 text-[#3b82f6]' :
              item.type === 'work' ? 'bg-[#10b981]/10 text-[#10b981]' :
              item.type === 'achievement' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' :
              'bg-[#8b5cf6]/10 text-[#8b5cf6]'
            }`}>
              {item.type}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Dot */}
      <div className="relative flex-shrink-0 hidden md:flex flex-col items-center">
        <motion.div
          className="w-4 h-4 rounded-full bg-[#00d4ff] border-4 border-[#0a0f1a] z-10"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        />
      </div>

      {/* Spacer for alignment */}
      <div className="flex-1 hidden md:block" />
    </motion.div>
  )
}

export default function Timeline({ lang }: TimelineProps) {
  const t = portfolioTranslations[lang].timeline

  return (
    <section id="about" className="relative py-24 md:py-32 bg-[#0a0f1a]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-mono">
            {t.title}
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            {t.subtitle}
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Center line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#00d4ff]/50 via-[#8b5cf6]/30 to-transparent hidden md:block" />

          <div className="space-y-8 md:space-y-12">
            {timelineData.map((item, index) => (
              <TimelineCard key={item.id} item={item} index={index} lang={lang} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
