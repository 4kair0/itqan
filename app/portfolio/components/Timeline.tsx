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
          className="p-5 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm hover:border-blue-300 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300 group"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{item.icon}</span>
            <span className="text-blue-600 font-medium text-sm">{item.year}</span>
          </div>
          <h3 className="text-gray-900 font-semibold text-lg mb-1">
            {lang === 'ar' ? item.titleAr : item.title}
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            {lang === 'ar' ? item.descriptionAr : item.description}
          </p>
          <div className="mt-3">
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
              item.type === 'education' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
              item.type === 'work' ? 'bg-purple-50 text-purple-600 border border-purple-200' :
              item.type === 'achievement' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
              'bg-violet-50 text-violet-600 border border-violet-200'
            }`}>
              {item.type}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Node with pulse */}
      <div className="relative flex-shrink-0 hidden md:flex flex-col items-center">
        <motion.div
          className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-4 border-white z-10 shadow-md"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        />
        {/* Pulse ring */}
        <motion.div
          className="absolute w-8 h-8 rounded-full border border-blue-300"
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: [0.5, 1.5], opacity: [0.5, 0] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
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
    <section id="about" className="relative py-24 md:py-32 bg-gray-50/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {t.title}
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            {t.subtitle}
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Center line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px hidden md:block"
            style={{
              background: 'linear-gradient(to bottom, transparent, #3b82f6 10%, #8b5cf6 90%, transparent)',
            }}
          />

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
