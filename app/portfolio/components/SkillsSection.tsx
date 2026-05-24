"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { skills, skillCategories } from '../data/skills'
import type { PortfolioLang } from '../data/i18n'
import { portfolioTranslations } from '../data/i18n'

interface SkillsSectionProps {
  lang: PortfolioLang
}

function SkillBar({ name, level, color, delay }: { name: string; level: number; color: string; delay: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <div ref={ref} className="group">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-gray-300 font-medium">{name}</span>
        <span className="text-xs text-gray-500 font-mono">{level}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${level}%` } : { width: 0 }}
          transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  )
}

export default function SkillsSection({ lang }: SkillsSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>('frontend')
  const t = portfolioTranslations[lang].skills

  const categoryLabels: Record<string, string> = {
    frontend: t.frontend,
    backend: t.backend,
    ai: t.ai,
    tools: t.tools,
    design: t.design,
  }

  const filteredSkills = skills.filter(s => s.category === activeCategory)
  const activeColor = skillCategories.find(c => c.id === activeCategory)?.color || '#00d4ff'

  return (
    <section id="skills" className="relative py-24 md:py-32 bg-[#0a0f1a]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-mono">
            {t.title}
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            {t.subtitle}
          </p>
        </motion.div>

        {/* Category tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {skillCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeCategory === cat.id
                  ? 'text-white border'
                  : 'text-gray-400 border border-transparent hover:text-white hover:border-white/10'
              }`}
              style={{
                backgroundColor: activeCategory === cat.id ? `${cat.color}15` : undefined,
                borderColor: activeCategory === cat.id ? `${cat.color}40` : undefined,
                color: activeCategory === cat.id ? cat.color : undefined,
              }}
            >
              {categoryLabels[cat.id]}
            </button>
          ))}
        </div>

        {/* Skills grid */}
        <motion.div
          key={activeCategory}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {filteredSkills.map((skill, i) => (
            <SkillBar
              key={skill.name}
              name={skill.name}
              level={skill.level}
              color={activeColor}
              delay={i * 0.05}
            />
          ))}
        </motion.div>

        {/* Overall stats */}
        <motion.div
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          {[
            { label: 'Technologies', value: '30+', color: '#00d4ff' },
            { label: 'Projects', value: '15+', color: '#f59e0b' },
            { label: 'Years Coding', value: '4+', color: '#10b981' },
            { label: 'Events Managed', value: '10+', color: '#8b5cf6' },
          ].map(stat => (
            <div
              key={stat.label}
              className="text-center p-4 rounded-xl border border-white/5 bg-[#111827]/30"
            >
              <div className="text-2xl md:text-3xl font-bold font-mono" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
